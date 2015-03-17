# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class SeleniumFinal(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://127.0.0.1:5000/"
        self.verificationErrors = []
        self.accept_next_alert = True

    def test_selenium_final(self):
        driver = self.driver
        driver.get(self.base_url + "/")
        """The code below tries to signup with empty email field"""
        driver.find_element_by_id("firstname").clear()
        driver.find_element_by_id("firstname").send_keys("Anders")
        driver.find_element_by_id("lastname").clear()
        driver.find_element_by_id("lastname").send_keys("Anderss")
        driver.find_element_by_id("lastname").clear()
        driver.find_element_by_id("lastname").send_keys("Andersson")
        driver.find_element_by_id("gender").clear()
        driver.find_element_by_id("gender").send_keys("Male")
        driver.find_element_by_id("city").clear()
        driver.find_element_by_id("city").send_keys("Linkoping")
        driver.find_element_by_id("country").clear()
        driver.find_element_by_id("country").send_keys("Sverige")
        driver.find_element_by_id("signup-pwd").clear()
        driver.find_element_by_id("signup-pwd").send_keys("1234")
        driver.find_element_by_id("signup-pwd2").clear()
        driver.find_element_by_id("signup-pwd2").send_keys("1234")
        driver.find_element_by_css_selector("#sign-up > div.form-group > input.btn.btn-default").click()

        """The code below tries to sign up a user with an invalid email"""
        driver.find_element_by_id("signup-email").clear()
        driver.find_element_by_id("signup-email").send_keys("anders")
        driver.find_element_by_css_selector("#sign-up > div.form-group > input.btn.btn-default").click()

        """The code below gets failure since the password is to short"""
        driver.find_element_by_id("signup-email").clear()
        driver.find_element_by_id("signup-email").send_keys("anders@mail.com")
        driver.find_element_by_css_selector("#sign-up > div.form-group > input.btn.btn-default").click()

        """The code below successfully creates a new user, password field is changed"""
        driver.find_element_by_id("signup-pwd").clear()
        driver.find_element_by_id("signup-pwd").send_keys("12345")
        driver.find_element_by_id("signup-pwd2").clear()
        driver.find_element_by_id("signup-pwd2").send_keys("12345")
        driver.find_element_by_css_selector("#sign-up > div.form-group > input.btn.btn-default").click()

        """The user tries to login with wrong pasword"""
        driver.find_element_by_id("email").clear()
        driver.find_element_by_id("email").send_keys("anders@mail.com")
        driver.find_element_by_id("password").clear()
        driver.find_element_by_id("password").send_keys("123456")
        driver.find_element_by_id("login-button").click()

        """The user sign in with the correct password"""
        driver.find_element_by_id("email").clear()
        driver.find_element_by_id("email").send_keys("anders@mail.com")
        driver.find_element_by_id("password").clear()
        driver.find_element_by_id("password").send_keys("12345")
        driver.find_element_by_id("login-button").click()

        """The user tries to post an empty message"""
        driver.find_element_by_css_selector("input.btn.btn-default").click()

        """"The user posts something to its wall"""
        driver.find_element_by_id("to-my-wall").clear()
        driver.find_element_by_id("to-my-wall").send_keys("My name is Anders!")
        driver.find_element_by_css_selector("input.btn.btn-default").click()

        """The user searches for a user"""
        driver.find_element_by_link_text("Browse").click()
        driver.find_element_by_id("view-user-button").click()
        driver.find_element_by_id("user-email").clear()
        driver.find_element_by_id("user-email").send_keys("kalle@mail.com")
        driver.find_element_by_id("view-user-button").click()

        """The user posts on the searched users wall"""
        driver.find_element_by_id("to-user-wall").clear()
        driver.find_element_by_id("to-user-wall").send_keys("Hello Kalle!")
        driver.find_element_by_css_selector("#post-their > input.btn.btn-default").click()

        """Tries to post an empty message"""
        driver.find_element_by_css_selector("#post-their > input.btn.btn-default").click()

        """Tries to change the password with wrong old password"""
        driver.find_element_by_link_text("Account").click()
        driver.find_element_by_id("old-pwd").clear()
        driver.find_element_by_id("old-pwd").send_keys("123456")
        driver.find_element_by_id("new-pwd").clear()
        driver.find_element_by_id("new-pwd").send_keys("123456")
        driver.find_element_by_id("new-pwd2").clear()
        driver.find_element_by_id("new-pwd2").send_keys("123456")
        driver.find_element_by_id("change-pwd-button").click()

        """Tries to change password with different passwords"""
        driver.find_element_by_id("old-pwd").clear()
        driver.find_element_by_id("old-pwd").send_keys("12345")
        driver.find_element_by_id("new-pwd").clear()
        driver.find_element_by_id("new-pwd").send_keys("12345")
        driver.find_element_by_id("new-pwd2").clear()
        driver.find_element_by_id("new-pwd2").send_keys("12346")
        driver.find_element_by_id("change-pwd-button").click()

        """Successfully change password"""
        driver.find_element_by_id("old-pwd").clear()
        driver.find_element_by_id("old-pwd").send_keys("12345")
        driver.find_element_by_id("new-pwd").clear()
        driver.find_element_by_id("new-pwd").send_keys("123456")
        driver.find_element_by_id("new-pwd2").clear()
        driver.find_element_by_id("new-pwd2").send_keys("123456")
        driver.find_element_by_id("change-pwd-button").click()

        """The user signs out"""
        driver.find_element_by_id("sign-out-button").click()

        """The user tries to sign in with the old password"""
        driver.find_element_by_id("email").clear()
        driver.find_element_by_id("email").send_keys("anders@mail.com")
        driver.find_element_by_id("password").clear()
        driver.find_element_by_id("password").send_keys("12345")
        driver.find_element_by_id("login-button").click()

        """The user successfully signs in with the new password"""
        driver.find_element_by_id("email").clear()
        driver.find_element_by_id("email").send_keys("anders@mail.com")
        driver.find_element_by_id("password").clear()
        driver.find_element_by_id("password").send_keys("123456")
        driver.find_element_by_id("login-button").click()

    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException, e: return False
        return True

    def is_alert_present(self):
        try: self.driver.switch_to_alert()
        except NoAlertPresentException, e: return False
        return True

    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally: self.accept_next_alert = True

    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
