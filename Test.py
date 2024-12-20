import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time

# Configurer le logging pour écraser le fichier à chaque exécution
logging.basicConfig(
    filename='test-output/test_log.log',
    filemode='w',  # 'w' pour écraser le fichier à chaque exécution
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
)

driver = webdriver.Edge()
driver.get("http://localhost:3000/")

try:
    # Attendre que la page se charge
    time.sleep(2)
    
    # Trouver un élément (par exemple, un champ de saisie) et interagir avec lui
    input_box = driver.find_element(By.ID, "prompt")
    input_box.send_keys("Bonjour, chatbot!" + Keys.RETURN)
    time.sleep(2)
    valider = driver.find_element(By.ID, "send")
    valider.click()
    
    # Attendre que l'élément de réponse soit présent et visible
    response_element = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.ID, "reponse"))
    )
    
    # Vérifier la réponse
    response = response_element.text
    if "Error communicating" in response:
        # Enregistrer un message si l'assertion est réussie
        logging.info("L'assertion a réussi : Le texte 'Error communicating' est présent dans le champ de réponse.")
    else:
        raise AssertionError("Erreur 500 (Serveur error) : Le texte attendu n'est pas présent.")
    
except TimeoutException:
    logging.error("TimeoutException: Erreur 500 (Serveur error), probleme to fetch API.")
except NoSuchElementException:
    logging.error("NoSuchElementException: L'élément spécifié n'a pas été trouvé sur la page.")
except AssertionError as e:
    logging.error(f"AssertionError: {e}")
except Exception as e:
    logging.error(f"An unexpected error occurred: {e}")
finally:
    # Fermer le navigateur
    time.sleep(5)
    driver.quit()