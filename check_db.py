import psycopg2
import sys

try:
    conn = psycopg2.connect(
        host="localhost",
        port="5433",
        database="rudder_warehouse",
        user="diego_admin",
        password="supersecret"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'hubspot_raw' AND table_name = 'contacts' LIMIT 30;")
    tables = cursor.fetchall()
    for table in tables:
        print(table[0])
    
    if tables:
        # Also describe the first table to see columns
        table_name = tables[0][0]
        print(f"\nColumns for {table_name}:")
        cursor.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'hubspot_raw' AND table_name = '{table_name}';")
        for col in cursor.fetchall():
            print(f"{col[0]} ({col[1]})")

except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals() and conn:
        cursor.close()
        conn.close()
