import requests
from bs4 import BeautifulSoup

from django.db.models import Max
from django.http import HttpResponseServerError, HttpResponseBadRequest

from myt.home.models import Myt, MytCard, Room, Announcement


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


def append_announcement(room, announcement):
    announcement = Announcement(message=announcement, room=room)
    announcement.save()


# TODO: validation
def process_myt_message_for_db(room, message):
    name = message['name']
    action = message['action']
    target = message['target']
    value = message['value']

    if 'source' in name:
        if action == 'delete':
            card_id = int(value.split('-')[-1])
            myt_card = MytCard.objects.filter(id=card_id, room=room).first()
            if myt_card:
                myt_card.delete()
        elif action == 'add' and target != 'myts':
            myt_characters = [myt['character'] for myt in value.get('myts', [])]
            myts = Myt.objects.filter(character__in=myt_characters)
            myt_card = MytCard(legion=value['legion'],
                               day=value['day'],
                               difficulty=value['difficulty'],
                               times=value['times'],
                               room=room)
            myt_card.save()
            myt_card.myts.add(*myts)
            # new card being sent back with newly assigned (name)id
            value['name'] = myt_card.name

    if 'card' in name:
        card_id = int(name.split('-')[-1])
        myt_card = MytCard.objects.filter(id=card_id, room=room).first()
        if myt_card is None:
            return
        if action == 'add':
            myt_card.myts.add(Myt.objects.filter(character=value['character'], rooms__in=[room]).first())
        elif action == 'delete':
            myt_card.myts.remove(Myt.objects.filter(character=value['character'], rooms__in=[room]).first())
        elif action == 'edit':
            MytCard.objects.filter(id=myt_card.id).update(**{target: value})


