import requests
import time
import random
import uuid
import os
from datetime import datetime
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Tu Write Key (ahora desde el entorno) y la URL local de RudderStack
WRITE_KEY = os.getenv("WRITE_KEY", "")
DATA_PLANE_URL = "http://localhost:8080/v1/track"

# Datos falsos para simular el e-commerce
eventos = ["page_view", "add_to_cart", "checkout", "purchase"]
usuarios = ["diego@prueba.com", "primo@dtorreshaus.com", "cliente_anonimo@mail.com"]
productos = ["Moza R5 Bundle", "Pedales Load Cell AliExpress", "Redragon Vortex Cockpit", "Assetto Corsa Competizione"]

print("Iniciando bombardeo de datos al Data Plane local...\n")

for i in range(10): # Cambia este 10 por 1000 cuando quieras hacer pruebas de estrés
    evento_actual = random.choice(eventos)
    usuario_actual = random.choice(usuarios)
    
    # Simulamos la URL sucia que trae el correo expuesto
    url_sucia = f"https://dtorreshaus.com/tienda?email={usuario_actual}"
    
    # Construimos el Payload JSON estándar de analítica
    payload = {
        "userId": str(uuid.uuid4()), # ID único de usuario
        "event": evento_actual,
        "properties": {
            "page_location": url_sucia,
            "product_name": random.choice(productos),
            "price": random.randint(20, 500) if evento_actual in ["add_to_cart", "purchase"] else 0
        },
        "context": {
            "library": {
                "name": "python-requests-sandbox",
                "version": "1.0"
            }
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    # RudderStack usa Basic Auth pasando el Write Key como usuario y dejando el password vacío
    respuesta = requests.post(DATA_PLANE_URL, auth=(WRITE_KEY, ''), json=payload)
    
    if respuesta.status_code == 200:
        print(f"DONE: {evento_actual} enviado correctamente | Usuario: {usuario_actual}")
    else:
        print(f"ERROR {respuesta.status_code}: {respuesta.text}")
        
    time.sleep(0.5) # Pausa de medio segundo entre eventos

print("\nSimulacion terminada.")
