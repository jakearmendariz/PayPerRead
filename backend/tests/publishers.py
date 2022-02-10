import json
from pickle import ADDITEMS
import requests
import unittest
from utils.http_response_status_codes import HTTP

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

def delete_publisher():
    return requests.delete("{ADDRESS}/publisher/{TEST_EMAIL}")

def set_initial_state():
    get_publisher_result = get_publisher()
    if get_publisher_result.status_code == HTTP.OK:
        delete_publisher()

class PublisherTests(unittest.TestCase):

    def test_publisher_does_not_exist(self):
        get_publisher_result = get_publisher()
        self.assertEqual(get_publisher_result.status_code, HTTP.NOT_FOUND)

    def test_insert_then_delete_publisher(self):
        add_publisher_result = add_publisher()
        self.assertEqual(add_publisher_result.status_code, HTTP.CREATED)
        get_publisher_result = get_publisher()
        self.assertEqual(get_publisher_result.status_code, HTTP.OK)


if __name__ == "__main__":
    set_initial_state()
    unittest.main()