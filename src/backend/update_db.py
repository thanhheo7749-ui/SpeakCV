import pymysql

try:
    connection = pymysql.connect(host='localhost', user='root', password='thanhhoang@123', database='speakcv')
    cursor = connection.cursor()

    # Add last_token_reset_date column if missing
    cursor.execute("SHOW COLUMNS FROM users LIKE 'last_token_reset_date'")
    res = cursor.fetchone()
    if not res:
        cursor.execute("ALTER TABLE users ADD COLUMN last_token_reset_date DATE")
        print("Success: Added 'last_token_reset_date' to 'users'.")
    else:
        print("Column 'last_token_reset_date' already exists.")

    connection.commit()
    connection.close()
except Exception as e:
    print(f"Error updating SQL: {e}")
