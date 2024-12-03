import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="root123",
  database="schemamodex"
)

mycursor = mydb.cursor()

mycursor.execute("SELECT * FROM productos LIMIT 100;")

myresult = mycursor.fetchall()

for x in myresult:
  print(x)