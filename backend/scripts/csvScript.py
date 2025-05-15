
import csv 
import requests
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

from pathlib import Path

load_dotenv()

# Obtener las variables de entorno
hostenv = os.getenv("DB_HOST")
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

categorias_final_air =  {
"001-0010":"Accesorios", 
"001-0030":"Accesorios",
"001-0307":"ALARMAS",
"001-0351":"AURICULARES Y MICROFONOS",
"001-0520":"BACKUP", 
"002-0300":"BICICLETAS ELECTRICAS",
"001-0609":"BOTELLA",
"001-0040":"CALCULADORAS", 
"001-0608":"CARTUCHOS",
"001-0252":"CARTUCHOS", 
"001-0254":"CARTUCHOS", 
"001-0255":"CARTUCHOS",
"001-0257":"CARTUCHOS", 
"001-0011":"CARTUCHOS",
"001-3562":"CELULARES",
"001-0260":"CINTAS P/ROTULADORAS", 
"002-0015":"COMPUTADORAS", 
"001-0014":"COMPUTADORAS", 
"002-0997":"COMPUTADORAS", 
"001-0528":"CONECT. PLACAS DE RED SERVERS", 
"001-0055":"CONECTIVIDAD", 
"001-1055":"CONECTIVIDAD", 
"001-0430":"CONECTIVIDAD", 
"001-0432":"CONECTIVIDAD", 
"001-0054":"CONECTIVIDAD", 
"001-0612":"CONECTIVIDAD", 
"001-0248":"CONSOLA", 
"001-0308":"CONTROL DE ACCESOS", 
"001-0002":"Coolers", 
"002-0670":"CRYPTO", 
"001-0525":"DISCOS RIGIDOS HDD SAS SERVERS", 
"001-0524":"DISCOS RIGIDOS HDD SATA SERVER", 
"001-0134":"DISCOS RIGIDOS IDE/SATA", 
"001-0133":"DISCOS RIGIDOS SAS", 
"001-0131":"DISCOS RIGIDOS SCSI", 
"001-0137":"DISCOS INTERNOS SSD", 
"002-0137":"DISCOS INTERNOS SSD", 
"001-0527":"DISCOS SSD SAS SERVERS", 
"001-0526":"DISCOS SSD SATA SERVER", 
"001-0212":"Domotica - SMART HOUSE", 
"001-0580":"ELECTRODOMESTICOS Y TV",
"001-0160":"ESTABILIZADORES",
"001-0332":"Coolers",
"001-0170":"FAX",
"001-0610":"IMPRESORA FISCAL",
"001-610":"IMPRESORA FISCAL",
"001-0529":"FUENTES ALIMENTACION SERVERS",
"001-0556":"FUENTES",
"001-0190":"GABINETES",
"001-0607":"IMPRESORAS",
"001-0601":"IMPRESORAS",
"001-0604":"IMPRESORAS",
"001-0605":"IMPRESORAS",
"001-0606":"IMPRESORAS",
"001-0600":"IMPRESORAS",
"001-0602":"IMPRESORAS",
"001-0603":"IMPRESORAS",
"001-1001":"Accesorios",
"001-0231":"IMPRESORAS",
"001-0220":"IMPRESORAS",
"001-900":"IMPRESORAS",
"001-0341":"JOYSTICK",
"001-980":"LECTOR DE CODIGOS",
"002-0280":"MEMORIAS PC",
"001-0282":"MEMORIAS FLASH",
"001-0523":"MEMORIAS SERVERS",
"002-0281":"MEMORIAS USB",
"001-0281":"MEMORIAS USB",
"001-0330":"Procesadores",
"001-0522":"MICROPROCESADORES SERVERS",
"001-0310":"MODEM FAX",
"001-0320":"MONITORES",
"002-0320":"MONITORES",
"000-0299":"MONOPATINES Y SCOOTERS",
"002-0299":"MONOPATINES Y SCOOTERS",
"001-0333":"MOTHER + MICRO",
"001-0331":"MOTHERBOARDS",
"001-0340":"MOUSE",
"001-0360":"NOTEBOOK",
"001-0363":"Accesorios",
"002-0361":"NOTEBOOK",
"001-2096":"PANTALLAS",
"001-0355":"PARLANTES",
"001-0003":"PASTA TERMICA",
"001-0101":"PLACA HBA SAS",
"001-0102":"PLACAS DE RED",
"001-0352":"PLACAS VARIAS",
"002-0553":"Placas De Video",
"001-0560":"PLACAS VIDEO EDICION",
"001-0390":"PLOTTERS",
"001-0420":"PUNTO DE VENTA",
"001-3561":"RACK",
"001-0480":"ROLLOS DE PAPEL",
"001-0279":"ROTULADORAS",
"001-0490":"SCANNERS",
"001-0491":"SCANNERS",
"002-0304":"Accesorios",
"001-0304":"Accesorios",
"001-0300":"SERVIDORES",
"001-0500":"Accesorios", 
"001-0291":"SILLAS DE OFICINA", 
"001-0015":"SILLAS GAMERS", 
"907-1555":"SMARTWATCH", 
"569":"STREAMING",
"001-0368":"TABLETS",
"001-0530":"TECLADOS",
"001-0258":"TONERS", 
"001-0540":"UPS",
"001-3560":"UPS Accesorios",
"001-0168":"VIDEO PROYECTORES",
"001-0309":"camara web", 
"001-0305":"camara web", 
"001-0362":"COMPUTADORAS",
"001-0521":"SERVIDORES STORAGE",
}


def extraer_columnas_csv(ruta_csv):
    """
    Lee un archivo CSV, extrae las columnas especificadas y pasa los datos a otra función.
    
    Args:
        ruta_csv (str): Ruta del archivo CSV a leer.
 
    """
    cuenta = 1
    with open(ruta_csv, mode='r', newline='', encoding='ISO-8859-1') as archivo_csv:
        lector_csv = csv.DictReader(archivo_csv)
        for fila in lector_csv:
            deposito = ""
            if int(fila["CBA"]) > 0:
                stock = int(fila["CBA"])
                deposito = "CBA"
            elif int(fila["LUG"]) > 0:
                stock = int(fila["LUG"])
                deposito = "LUG"
            else:
                stock = 0
                

            nombre = fila["Descripcion"]
            garantia_meses = 6
            detalle = "a"
            largo = float("0")
            alto = float("0")
            ancho = float("0")
            peso = float("0")
            codigo_fabricante = fila["Part Number "]
            marca = "a"
            sub_categoria = "general"
            proveedor = "air"
            precio_dolares = fila["lista4"]
            precio_dolares_iva = float("{:.2f}".format(float(fila["lista4"]) * (float(fila["IVA"]) / 100 + 1)))
            iva = float(fila["IVA"]) 
            precio_pesos = float(fila["lista4"]) * float(dolar_venta)
            precio_pesos_iva = float("{:.2f}".format(float(fila["lista4"]) * float(dolar_venta) * (float(fila["IVA"]) / 100 + 1)))
            url_imagen = "https://i.imgur.com/0wbrCkz.png"
            codigo_categoria = fila["Rubro"]
            try:
                categoria = categorias_final_air[f"{codigo_categoria}"]
            except:
                categoria = 0   

            if (categoria != 0 and len(codigo_fabricante) > 2):
                parametros = (nombre,stock,garantia_meses,detalle,largo,alto,ancho,peso,codigo_fabricante,marca,categoria,sub_categoria,proveedor,precio_dolares,precio_dolares_iva,iva,precio_pesos,precio_pesos_iva,url_imagen,deposito)
                try:
                    mycursor.callproc("cargarDatosProducto", parametros)
                    mydb.commit()  # Asegúrate de confirmar los cambios si la operación fue exitosa
                    print('aaaaa')
                    # Obtener resultados de las operaciones, si aplica
                    for resultado in mycursor.stored_results():
                        print(resultado.fetchall())

                except mysql.connector.Error as error:
                    print(f"Error al ejecutar el procedimiento almacenado: {error}")




    # Llama a la función para procesar las filas seleccionadas

# Ejemplo de uso:
ruta_csv = './arituc.csv'  # Cambia esto por pya ruta a tu archivo CSV
columnas_interes = ['nombre', 'edad', 'correo']  # Cambia esto por las columnas que quieras extraer
extraer_columnas_csv(ruta_csv)

print("Terminado")