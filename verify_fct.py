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
    cursor.execute("SELECT user_id, user_status, hubspot_id FROM public.fct_customer_journey LIMIT 10;")
    rows = cursor.fetchall()
    print("user_id | user_status | hubspot_id")
    print("-" * 40)
    for row in rows:
        print(f"{row[0]} | {row[1]} | {row[2]}")

except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals() and conn:
        cursor.close()
        conn.close()
