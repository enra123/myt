import requests

from asgiref.sync import sync_to_async
from bs4 import BeautifulSoup
from django.conf import settings
from django.db.models import Max

from myt.home.models import Myt, MytCard, Room, Announcement
from myt.home.serializers import MytSerializer


class CharacterNotFoundError(Exception):
    pass


def save_myt(room_id, myt_dict):
    myt = Myt(**myt_dict)
    myt.save()
    myt.rooms.add(Room.objects.get(id=room_id))


def add_myt_to_room(room, character_name):
    myt = Myt.objects.get(character=character_name)
    myt.rooms.add(room)
    serialized_myt = MytSerializer(instance=myt)
    return serialized_myt.data


def append_announcement(room, announcement):
    announcement = Announcement(message=announcement, room=room)
    announcement.save()


def delete_myt_card_from_room(room, card_id):
    myt_card = MytCard.objects.filter(id=card_id, room=room).first()
    if myt_card:
        myt_card.delete()


def delete_myt_from_room(room, character_name):
    Myt.objects.filter(character=character_name).first().rooms.remove(room)


def create_myt_card(room, myt_card_dict, myt_characters):
    myts = Myt.objects.filter(character__in=myt_characters)
    myt_card = MytCard(legion=myt_card_dict['legion'],
                       day=myt_card_dict['day'],
                       difficulty=myt_card_dict['difficulty'],
                       times=myt_card_dict['times'],
                       pinned=myt_card_dict['pinned'],
                       room=room)
    myt_card.save()
    myt_card.myts.add(*myts)
    return myt_card


def get_myt_card_by_id(room, myt_card_id):
    myt_card = MytCard.objects.filter(id=myt_card_id, room=room).first()
    return myt_card


def add_myt_to_card(room, myt_card, character_name):
    myt_card.myts.add(Myt.objects.filter(character=character_name, rooms__in=[room]).first())


def delete_myt_from_card(room, myt_card, character_name):
    myt_card.myts.remove(Myt.objects.filter(character=character_name, rooms__in=[room]).first())


def edit_myt_card(myt_card_id, card_dict):
    MytCard.objects.filter(id=myt_card_id).update(**card_dict)


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


def extract_character_info(html):
    try:
        soup = BeautifulSoup(html, "html.parser")
        div = soup.find('div', {'class': 'level-info2__item'})
        level = float(div.text.split('Lv.')[1].replace(',', ''))

        img = soup.find('img', {'class': 'profile-character-info__img'})
        role = img.attrs['alt']

        uls = soup.find_all('ul', {'class': 'profile-character-list__char'})
        characters = []
        for ul in uls:
            for button in ul.find_all('button'):
                characters.append(button.attrs['onclick'].split('Character/')[1].rstrip("\'"))
        return characters, level, role
    except (AttributeError, ValueError):
        raise CharacterNotFoundError('character not found')


def scrape_character_info_dict(character_name):
    url = settings.LOSTARK_PROFILE_URL + character_name
    response = requests.get(url)
    characters, level, role = extract_character_info(response.content)
    account = get_myt_account_num_by_characters(characters)

    return {
        'level': int(level),
        'character': character_name,
        'account': account,
        'role': role,
    }


# cronjob batch-updating myts in db async
async def scrape_character_info_dict_async(character_name, session):
    async with session.get(settings.LOSTARK_PROFILE_URL + character_name) as response:
        characters, level, role = await sync_to_async(extract_character_info)(await response.text())

    return {
        'level': int(level),
        'character': character_name,
        'account': None,
        'role': role,
    }
