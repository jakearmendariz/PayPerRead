"""
Integration tests, interact with API and database.
Expensive, don't need to run often.

TODO convert all tests to rust. For now, writing in python was nice and easy,
but its good practice to write the tests in rust and also probably better practice.
"""
import requests
import unittest

ADDRESS = "http://localhost:8000"
TEST_EMAIL = 'test@gmail.com'
NO_MONEY = {'dollars': 0, 'cents': 0}
MONEY = {'dollars': 5, 'cents': 0}
NEW_USER = {'email': TEST_EMAIL, 'name':'Test User'}
TEST_USER = {'email': TEST_EMAIL, 'name':'Test User', 'balance': NO_MONEY}
TEST_USER_WITH_MONEY = {'email': TEST_EMAIL, 'name':'Test User', 'balance': MONEY}

def get_readers():
    return requests.get(f"{ADDRESS}/readers")

def add_reader():
    return requests.post(f"{ADDRESS}/reader/new-reader", json=NEW_USER)

def get_reader():
    return requests.get(f"{ADDRESS}/reader/{TEST_EMAIL}")

def update_reader_balance():
    return requests.post(f"{ADDRESS}/reader/add-balance/{TEST_EMAIL}", json=MONEY)

def sub_reader_balance():
    return requests.post(f"{ADDRESS}/reader/sub-balance/{TEST_EMAIL}", json=MONEY)

def delete_reader():
    return requests.delete(f"{ADDRESS}/reader/{TEST_EMAIL}")

class ReaderTests(unittest.TestCase):

    def test_reader_does_not_exist(self):
        get_reader_not_found = get_reader()
        self.assertEqual(get_reader_not_found.status_code, 404)

    def test_insert_then_delete_reader(self):
        add_reader_success = add_reader()
        self.assertEqual(add_reader_success.status_code, 201)
        # User was added successfully
        get_reader_success = get_reader()
        self.assertEqual(get_reader_success.status_code, 200)
        self.assertEqual(get_reader_success.json(), TEST_USER)
        # Clean up (delete test user)
        delete_reader_success = delete_reader()
        self.assertEqual(delete_reader_success.status_code, 200)
        # Check that delete was successful
        get_reader_not_found = get_reader()
        self.assertEqual(get_reader_not_found.status_code, 404)
    
    def test_no_duplicate_users(self):
        add_reader_success = add_reader()
        self.assertEqual(add_reader_success.status_code, 201)
        # Try again
        add_reader_failure = add_reader()
        self.assertEqual(add_reader_failure.status_code, 403)
        # Clean up
        delete_reader_success = delete_reader()
        self.assertEqual(delete_reader_success.status_code, 200)

    def test_update_reader_balance(self):
        add_reader_success = add_reader()
        self.assertEqual(add_reader_success.status_code, 201)
        # Update reader
        update_reader_balance_success = update_reader_balance()
        self.assertEqual(update_reader_balance_success.status_code, 201)
        # Verify
        get_reader_success = get_reader()
        self.assertEqual(get_reader_success.status_code, 200)
        self.assertEqual(get_reader_success.json(), TEST_USER_WITH_MONEY)
        # Take money
        sub_reader_balance_success = sub_reader_balance()
        self.assertEqual(sub_reader_balance_success.status_code, 201)
        # Verify
        get_reader_success = get_reader()
        self.assertEqual(get_reader_success.status_code, 200)
        self.assertEqual(get_reader_success.json(), TEST_USER)
        # Clean up
        delete_reader_success = delete_reader()
        self.assertEqual(delete_reader_success.status_code, 200)



if __name__ == '__main__':
    unittest.main()
    # print(add_reader().status_code)
    # delete_reader()