# from mock import patch
# from django.test import TestCase
#
# import myt
# from myt.home.models import Room, Myt, MytCard
# from myt.home.utils import process_myt_message
#
#
# class TestMytMessageProcess(TestCase):
#
#     def setUp(self):
#         self.room1 = Room.objects.create(name='test-room1')
#
#         self.myt1 = Myt.objects.create(character='test-ch1', level='1000', account=1, role='test-role')
#
#         self.myt2 = Myt.objects.create(character='test-ch2', level='1000', account=2, role='test-role')
#
#         self.myt_card1 = MytCard.objects.create(legion='test-legion', day='test-day',
#                                                 difficulty='test-diff', times='[12, 12]',
#                                                 room=self.room1)
#         self.myt_card1.myts.add(self.myt1)
#
#     def test_add_myt_to_source(self):
#         """
#         process_message_for_db should do nothing for this message
#         """
#         message = {
#             'name': 'source',
#             'action': 'add',
#             'target': 'myts',
#             'value': {
#                 'character': 'test-ch',
#                 'level': 1000,
#                 'account': 1,
#                 'role': 'test-role'
#             }
#         }
#
#         process_myt_message(self.room1.name, message)
#         with self.assertRaises(Myt.DoesNotExist):
#             Myt.objects.get(character='test-ch')
#
#     def test_add_myt_card(self):
#         """
#         Creating a myt-card record having an existing myt
#         """
#         message = {
#             'name': 'source',
#             'action': 'add',
#             'target': 'mytCards',
#             'value': {
#                 'name': 'test-card-0',
#                 'legion': 'test-legion',
#                 'day': 'test-day',
#                 'difficulty': 'test-diff',
#                 'times': [12, 16],
#                 'myts': [{
#                     'character': 'test-ch1',
#                     'level': 1000,
#                     'account': 1,
#                     'role': 'test-role'
#                 }]
#             }
#         }
#
#         process_myt_message(self.room1.name, message)
#         try:
#             latest_index = self.myt_card1.id + 1
#             myt_card = MytCard.objects.get(id=latest_index)
#             self.assertTrue(myt_card.name, f'myt-card-list-{latest_index}')
#             self.assertTrue(myt_card.legion, 'test-legion')
#             self.assertTrue(myt_card.day, 'test-day')
#             self.assertTrue(myt_card.difficulty, 'test-diff')
#             self.assertTrue(myt_card.times, '[12, 16]')
#             self.assertTrue(myt_card.myts.first(), self.myt1)
#         except MytCard.DoesNotExist:
#             self.assertTrue(0)
#
#     def test_delete_myt_card(self):
#         """
#         Deleting a myt-card
#         """
#         message = {
#             'name': 'source',
#             'action': 'delete',
#             'target': 'mytCards',
#             'value': self.myt_card1.name
#         }
#
#         deleting_card_id = self.myt_card1.id
#         process_myt_message(self.room1.name, message)
#         with self.assertRaises(MytCard.DoesNotExist):
#             MytCard.objects.get(id=deleting_card_id)
#
#     def test_edit_myt_card(self):
#         """
#         Editting myt-card info
#         """
#         message1 = {
#             'name': self.myt_card1.name,
#             'action': 'edit',
#             'target': 'legion',
#             'value': 'new-legion'
#         }
#
#         message2 = {
#             'name': self.myt_card1.name,
#             'action': 'edit',
#             'target': 'day',
#             'value': 'new-day'
#         }
#
#         message3 = {
#             'name': self.myt_card1.name,
#             'action': 'edit',
#             'target': 'difficulty',
#             'value': 'new-diff'
#         }
#
#         message4 = {
#             'name': self.myt_card1.name,
#             'action': 'edit',
#             'target': 'times',
#             'value': '[15,18]'
#         }
#
#         process_myt_message(self.room1.name, message1)
#         process_myt_message(self.room1.name, message2)
#         process_myt_message(self.room1.name, message3)
#         process_myt_message(self.room1.name, message4)
#
#         try:
#             myt_card = MytCard.objects.get(id=self.myt_card1.id)
#             self.assertTrue(myt_card.legion, 'new-legion')
#             self.assertTrue(myt_card.day, 'new-day')
#             self.assertTrue(myt_card.difficulty, 'new-diff')
#             self.assertTrue(myt_card.times, '[15,18]')
#         except MytCard.DoesNotExist:
#             self.assertTrue(0)
#
#     def test_add_myt_to_card(self):
#         """
#         Adding a myt to a myt-card
#         """
#         message = {
#             'name': self.myt_card1.name,
#             'action': 'add',
#             'target': 'myts',
#             'value': {
#                 'character': 'test-ch2',
#                 'level': 1000,
#                 'account': 2,
#                 'role': 'test-role'
#             }
#         }
#
#         process_myt_message(self.room1.name, message)
#         try:
#             myt_card = MytCard.objects.get(id=self.myt_card1.id)
#             self.assertTrue(myt_card.myts.last(), self.myt2)
#         except MytCard.DoesNotExist:
#             self.assertTrue(0)
#
#     def test_delete_myt_from_card(self):
#         """
#         Deleting a myt from a myt-card
#         """
#         message = {
#             'name': self.myt_card1.name,
#             'action': 'delete',
#             'target': 'myts',
#             'value': {
#                 'character': 'test-ch1',
#                 'level': 1000,
#                 'account': 1,
#                 'role': 'test-role'
#             }
#         }
#
#         process_myt_message(self.room1.name, message)
#         try:
#             myt_card = MytCard.objects.get(id=self.myt_card1.id)
#             self.assertTrue(myt_card.myts.last(), None)
#         except MytCard.DoesNotExist:
#             self.assertTrue(0)
