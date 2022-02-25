import requests
from bs4 import BeautifulSoup

from django.db.models import Max
from django.http import HttpResponseServerError

from myt.home.models import Myt, MytCard


def get_myt_account_num_by_characters(characters):
    myts = Myt.objects.filter(character__in=characters)
    if myts:  # existing account
        return myts.first().account
    else:  # new account num is last account + 1 or 1 as the first account going in
        max_account_num = Myt.objects.aggregate(max_account_num=Max('account'))\
                                     .get('max_account_num')
        if max_account_num:
            return max_account_num + 1
        else:
            return 1


def scrape_character_info_dict(name):
    url = 'https://lostark.game.onstove.com/Profile/Character/'
    response = requests.get(url + name)
    soup = BeautifulSoup(response.content, "html.parser")

    try:
        div = soup.find('div', {'class': 'level-info2__item'})
        level = float(div.text.split('Lv.')[1].replace(',', ''))

        img = soup.find('img', {'class': 'profile-character-info__img'})
        role = img.attrs['alt']

        ul = soup.find('ul', {'class': 'profile-character-list__char'})
        characters = []
        for button in ul.find_all('button'):
            characters.append(button.attrs['onclick'].split('Character/')[1].rstrip("\'"))
    except (AttributeError, ValueError):
        return HttpResponseServerError('profile not found')

    account = get_myt_account_num_by_characters(characters)

    return {
        'level': int(level),
        'character': name,
        'account': account,
        'role': role,
    }


def get_character_info_dict(name):
    try:
        Myt.objects.get(character=name)
        return HttpResponseServerError('profile already exists')
    except Myt.DoesNotExist:
        return scrape_character_info_dict(name)

# TODO: validation
def process_message_for_db(message):
    name = message['name']
    action = message['action']
    target = message['target']
    value = message['value']

    if 'source' in name:
        if action == 'delete':
            MytCard.objects.get(name=value).delete()
        elif action == 'add' and target != 'myts':
            myt_characters = [myt['character'] for myt in value.get('myts', [])]
            myts = Myt.objects.filter(character__in=myt_characters)
            del value['myts']
            myt_card = MytCard.objects.create(**value)
            myt_card.myts.add(*myts)

    if 'card' in name:
        myt_card = MytCard.objects.get(name=name)
        if action == 'add':
            myt_card.myts.add(Myt.objects.get(character=value['character']))
        elif action == 'delete':
            myt_card.myts.remove(Myt.objects.get(character=value['character']))
        elif action == 'edit':
            MytCard.objects.filter(id=myt_card.id).update(**{target: value})


