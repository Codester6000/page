
import csv 
import requests
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

from pathlib import Path

load_dotenv()

# Obtener las variables de entorno
hostenv = os.getenv("DB_HOST_")
userenv= os.getenv("DB_USER")
passwordenv = os.getenv("DB_PASS")
databasenv = os.getenv("DB_NAME")


mydb = mysql.connector.connect(
  host=hostenv,
  user=userenv,
  password=passwordenv,
  database=databasenv
)


mycursor = mydb.cursor()


url = 'https://dolarapi.com/v1/dolares/oficial'

response = requests.get(url)
datos = response.json()
dolar_venta = datos["venta"]

def extraer_columnas_csv(ruta_csv):
    with open(ruta_csv, mode='r',newline='', encoding='ISO-8859-1') as archivo_csv:
        lector_csv = csv.DictReader(archivo_csv,delimiter=";")
        for fila in lector_csv:
            nombre = fila["Producto"]
            stock = int(float(fila["Stock"].replace(',','.')))
            garantia_meses = 6
            detalle = "a"
            largo = float(fila["Alto (Cm)"].replace(',','.'))
            alto = float(fila["Ancho (Cm)"].replace(',','.'))
            ancho = float(fila["Profundidad (Cm)"].replace(',','.'))
            peso = float(fila["Peso (Kg)"].replace(',','.'))
            codigo_fabricante = fila["ID"]
            marca = fila['Marca']
            sub_categoria = "a"
            iva = float(fila['Alicuota IVA'].replace(',','.').replace('%',''))
            proveedor = "Modex"
            categoria = fila["Categoría"]
            url_imagen = "https://i.imgur.com/0wbrCkz.png"
            if (fila['Moneda']=='$'):
                precio_pesos = float(fila['Precio Compra'].replace('.','').replace(',','.')) 
                precio_pesos_iva = float(fila['Precio Final'].replace('.','').replace(',','.'))
                precio_dolares = float(fila["Precio Compra"].replace('.','').replace(',','.')) / float(dolar_venta)
                precio_dolares_iva = float(fila['Precio Final'].replace('.','').replace(',','.')) / float(dolar_venta)
            else:
                precio_dolares = float(fila['Precio Compra'].replace('.','').replace(',','.'))
                precio_dolares_iva = float(fila['Precio Final'].replace('.','').replace(',','.'))
                precio_pesos = float(fila["Precio Compra"].replace('.','').replace(',','.')) * float(dolar_venta)
                precio_pesos_iva = float(fila['Precio Final'].replace('.','').replace(',','.')) * float(dolar_venta)
            if (categoria != 0):
                parametros = (nombre,stock,garantia_meses,detalle,largo,alto,ancho,peso,codigo_fabricante,marca,categoria,sub_categoria,proveedor,precio_dolares,precio_dolares_iva,iva,precio_pesos,precio_pesos_iva,url_imagen)
                print(parametros)
                try:
                    mycursor.callproc("cargarDatosProducto", parametros)
                    mydb.commit()  # Asegúrate de confirmar los cambios si la operación fue exitosa
                    # Obtener resultados de las operaciones, si aplica
                    for resultado in mycursor.stored_results():
                        print(resultado.fetchall())

                except mysql.connector.Error as error:
                    print(f"Error al ejecutar el procedimiento almacenado: {error}")




    # Llama a la función para procesar las filas seleccionadas

# Ejemplo de uso:
ruta_csv = './lista_modex.csv'  # Cambia esto por pya ruta a tu archivo CSV
extraer_columnas_csv(ruta_csv)