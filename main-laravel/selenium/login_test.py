from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import random
import string

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.maximize_window()

driver.get("http://127.0.0.1:8000/login")

wait = WebDriverWait(driver, 10)

email_box = wait.until(
    EC.presence_of_element_located((By.NAME, "email_address"))
)

password_box = wait.until(
    EC.presence_of_element_located((By.NAME, "password"))
)

email = ''.join(random.choices(string.ascii_lowercase, k=8)) + "@gmail.com"
password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

email_box.send_keys(email)
password_box.send_keys(password)

print("Random Email:", email)
print("Random Password:", password)

driver.quit()