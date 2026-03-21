import psycopg2
import requests
import json

import os

# 1. Configuración de HubSpot
HUBSPOT_TOKEN = os.environ.get("HUBSPOT_TOKEN", "tu_token_aqui")
HUBSPOT_URL = "https://api.hubapi.com/crm/v3/objects/contacts"
HEADERS = {
    "Authorization": f"Bearer {HUBSPOT_TOKEN}",
    "Content-Type": "application/json"
}

# 2. Conexión al Data Warehouse Local
print("Conectando a PostgreSQL (Capa Clean)...")
try:
    conn = psycopg2.connect(
        host="localhost",
        port="5433",
        database="rudder_warehouse",
        user="diego_admin",
        password="supersecret"
    )
    cursor = conn.cursor()

    # Extraemos los usuarios únicos y su última URL limpia
    cursor.execute("""
        SELECT user_id, MAX(page_url_clean) 
        FROM public.stg_page_view_clean 
        GROUP BY user_id
        LIMIT 5;
    """)
    usuarios_limpios = cursor.fetchall()
    
    print(f"Se encontraron {len(usuarios_limpios)} usuarios para sincronizar.")

    # 3. El Reverse ETL (Empujando al CRM)
    print("Iniciando sincronización hacia HubSpot...\n")
    
    for usuario in usuarios_limpios:
        user_id = usuario[0]
        url_limpia = usuario[1]
        
        # Mapeamos nuestros datos al formato que exige HubSpot
        # Como no tenemos el correo (lo censuramos), usamos el user_id como Apellido
        payload = {
            "properties": {
                "firstname": "Usuario Anónimo",
                "lastname": user_id,
                "website": url_limpia # Guardamos la URL censurada aquí para probar
            }
        }
        
        # Disparamos el POST a la API de HubSpot
        respuesta = requests.post(HUBSPOT_URL, headers=HEADERS, data=json.dumps(payload))
        
        if respuesta.status_code == 201:
            print(f"Exito: Contacto creado en HubSpot -> ID: {user_id}")
        else:
            print(f"Error con ID {user_id}: {respuesta.text}")

except Exception as e:
    print(f"Error catastrofico: {e}")
finally:
    if 'conn' in locals() and conn:
        cursor.close()
        conn.close()
        print("\nConexion a la base de datos cerrada.")
