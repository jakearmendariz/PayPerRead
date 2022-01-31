import json
from pickle import ADDITEMS
import requests
import unittest

ADDRESS = "http://localhost:8000"
TEST_EMAIL = "test@gmail.com"
TEST_DOMAIN = 'www.example.com'
NO_MONEY = {'dollars': 0, 'cents': 0}
MONEY = {'dollars': 1000, 'cents': 55}
TEST_USER_NAME = 'Test User'
NEW_USER = {'email': TEST_EMAIL, 'name': TEST_USER_NAME, 'domain': TEST_DOMAIN}
TEST_USER = {'email': TEST_EMAIL, 'name': TEST_USER_NAME, 'domain': TEST_DOMAIN}
TEST_USER_WITH_MONEY = {'email': TEST_EMAIL, 'name': TEST_USER_NAME, 'balance': MONEY}

def get_publishers():
    return requests.get(f"{ADDRESS}/publishers")
    
def add_publisher():
    return requests.post(f"{ADDRESS}/publisher/new-publisher", json=NEW_USER)

def get_publisher():
    return requests.get(f"{ADDRESS}/publisher/{TEST_EMAIL}")


class PublisherTests(unittest.TestCase):

    def test_publisher_does_not_exist(self):
        get_publisher_not_found = get_publisher()
        self.assertEqual(get_publisher_not_found.status_code, 404)

    def test_insert_then_delete_publisher(self):
        add_publisher_result = add_publisher()
        self.assertEqual(add_publisher_result.status_code, 201)
        get_publisher_result = get_publisher()
        self.assertEqual(get_publisher_result.status_code, 200)


if __name__ == "__main__":
    unittest.main()