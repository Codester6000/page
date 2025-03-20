from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import urllib.parse

def obtener_primera_imagen_google(nombre):
    """
    Busca un nombre en Google Imágenes y devuelve la URL de la primera imagen encontrada
    usando Selenium para ejecutar un navegador real.
    
    Args:
        nombre: El término de búsqueda
        
    Returns:
        str: URL de la primera imagen encontrada, o mensaje de error si no se encuentra
    """
    # Configurar opciones de Chrome para ejecutarlo en modo headless (sin interfaz gráfica)
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    # Preparar la búsqueda
    query = urllib.parse.quote_plus(nombre)
    url = f"https://www.google.com/search?q={query}&tbm=isch"
    
    try:
        # Iniciar el navegador
        driver = webdriver.Chrome(options=chrome_options)
        driver.get(url)
        
        # Esperar a que las imágenes se carguen
        time.sleep(2)
        
        # Esperar a que aparezcan las imágenes
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "img.rg_i, img.YQ4gaf"))
        )
        
        # Encontrar todas las imágenes (excluyendo la primera que suele ser el logo)
        img_elements = driver.find_elements(By.CSS_SELECTOR, "img.rg_i, img.YQ4gaf")
        
        # Buscar la primera imagen real (no placeholder)
        image_url = None
        for img in img_elements[1:]:  # Saltamos la primera imagen
            # Intentar obtener el atributo src
            src = img.get_attribute("src")
            print(src)
            
            # Si no hay src, intentar con data-src
            if not src or src.startswith("data:"):
                src = img.get_attribute("data-src")
            
            # Si aún no hay src, intentar hacer clic en la imagen para cargarla
            if not src or src.startswith("data:"):
                try:
                    img.click()
                    # Esperar a que se cargue la imagen en tamaño completo
                    time.sleep(1)
                    # Buscar la imagen ampliada
                    large_img = driver.find_element(By.CSS_SELECTOR, "img.iPVvYb, img.r48jcc")
                    src = large_img.get_attribute("src")
                except:
                    continue
            
            # Verificar si tenemos una URL válida
            if src and (src.startswith("http") or src.startswith("https")):
                image_url = src
                break
        
        driver.quit()
        
        if image_url:
            return image_url
        else:
            return "No se encontró ninguna imagen con URL directa"
    
    except Exception as e:
        try:
            driver.quit()
        except:
            pass
        return f"Error al buscar la imagen: {str(e)}"

print(obtener_primera_imagen_google("rtx 3080ti 12gb"))