import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port="5433",
        database="rudder_warehouse",
        user="diego_admin",
        password="supersecret"
    )
    cursor = conn.cursor()

    # Buscar en la tabla principal de tracks o eventos (puede llamarse 'tracks' o estar en el schema public/dbt)
    print("Buscando el evento vip_scoring_assigned en schemas...")
    
    # 1. Encontrar en que tablas podría estar 
    cursor.execute("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name ILIKE '%vip%' OR table_name ILIKE '%scoring%' OR table_name ILIKE '%tracks%';
    """)
    tablas = cursor.fetchall()
    print("Tablas candidatas:", tablas)
    
    for schema, tabla in tablas:
        try:
            cursor.execute(f"SELECT * FROM {schema}.{tabla} LIMIT 1;")
            columnas = [desc[0] for desc in cursor.description]
            print(f"[{schema}.{tabla}] Columnas: {columnas}")
            
            # intentamos buscar la etiqueta
            query = f"SELECT * FROM {schema}.{tabla} ORDER BY timestamp DESC LIMIT 5;"
            cursor.execute(query)
            filas = cursor.fetchall()
            if filas:
                print(f"--> Últimos registros en {tabla}: {filas[0]}")
        except Exception as ex:
            pass

except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals() and conn:
        conn.close()
