import json
from pickle import ADDITEMS
import requests
import unittest

from backend.tests.readers import TEST_USER, TEST_USER_WITH_MONEY

ADDRESS = "http://localhost:8000"
TEST_EMAIL = "test2@gmail.com"
TEST_DOMAIN = 'www.example.com'
NO_MONEY = {'dollars': 0, 'cents': 0}
MONEY = {'dollars': 1000, 'cents': 55}
NEW_USER = {'email': TEST_EMAIL, 'name': 'Test User', 'domain': TEST_DOMAIN}
TEST_USER = {'email': TEST_EMAIL, 'name': 'Test User', 'domain': TEST_DOMAIN}
TEST_USER_WITH_MONEY = {'email': TEST_EMAIL, 'name': 'Test User', 'balance': MONEY}



