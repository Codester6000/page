
import csv 
import requests
import mysql.connector
from mysql.connector import Error

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="root123",
  database="schemamodex"
)

mycursor = mydb.cursor()


url = 'https://dolarapi.com/v1/dolares/oficial'

response = requests.get(url)
datos = response.json()
dolar_venta = datos["venta"]

categorias_final_air = {
"002-1263": "2en1 cx",
"001-0010": "Accesorios",
"001-0030": "Accesorios",
"001-0307": "Auriculares",
"001-0031": "Audio",
"001-0022": "Audio y video conferencias",
"001-0351": "Auriculares",
"001-0520": "Backup",
"002-0300": "Bicicletas electricas",
"001-0555": "Bolsos fundas y maletines",
"001-0609": "Botellas de Tinta",
"001-0998": "Fundas",
"001-0040": "Computadoras",
"001-0565": "Camaras Web",
"001-0704": "Carepack hp",
"001-0532": "Carepacks servers",
"001-0251": "Cart. alternativos ",
"904-0152": "Carteleria digital",
"001-0608": "Cartuchos de Tinta",
"001-0252": "Cartuchos de Tinta",
"001-0254": "Cartuchos de Tinta",
"001-0255": "Cartuchos de Tinta",
"001-0257": "Cartuchos de Tinta",
"001-0011": "Cartuchos de Tinta",
"001-0050": "Impresoras",
"001-0140": "Cds dvds disquetes cajas",
"001-3562": "Auriculares",
"001-0260": "Computadoras",
"001-0155": "Discos Externos",
"002-0015": "Computadoras",
"001-0014": "Computadoras",
"002-0997": "Computadoras",
"001-0528": "Conect. placas de red servers",
"001-0055": "Conectividad",
"001-1055": "Conectividad",
"001-0430": "Conectividad",
"001-0432": "Conectividad",
"001-0054": "Conectividad",
"001-0612": "Conectividad",
"001-0248": "Coolers",
"001-0308": "Control de accesos",
"001-0002": "Coolers",
"002-0670": "Crypto",
"001-0056": "Procesadores",
"001-0525": "Discos rigidos hdd sas servers",
"001-0524": "Discos rigidos hdd sata server",
"001-0134": "Discos Externos",
"001-0133": "Discos Externos",
"001-0131": "Discos Externos",
"001-0137": "Discos Externos",
"002-0137": "Discos Externos",
"001-0527": "Discos ssd sas servers",
"001-0526": "Discos Externos",
"001-0150": "Disqueteras y lectores zip",
"001-0212": "Domotica - smart house",
"001-0613": "Drum",
"001-0706": "Education services hpe aruba",
"001-0580": "Electrodomesticos y tv",
"001-1000": "Energia solar",
"001-0160": "Estabilizadores",
"001-0332": "Coolers",
"001-0170": "Fax",
"001-0610": "Fiscal epson",
"001-610": "Fiscales kretz",
"001-0529": "Fuentes alimentacion servers",
"001-0556": "Botellas de Tinta",
"001-0190": "Gabinetes",
"001-0200": "Grabadoras cd / dvd",
"908-957": "Iluminacion led",
"001-0607": "Imp c/sist. cont.",
"001-0601": "Impresoras Inkjet",
"001-0604": "Impresoras Laser",
"001-0605": "Imp laser negro",
"001-0606": "Imp mf c/sist. cont.",
"001-0600": "Impresoras Inkjet",
"001-0602": "Impresoras Laser",
"001-0603": "Imp mf laser negro",
"001-1001": "Accesorios",
"001-0231": "Imp. chorro de tinta canon",
"001-0220": "Imp. de aguja epson",
"001-900": "Impresoras Matricial",
"001-0001": "Insumos discontinuos",
"001-0341": "Joysticks",
"001-1510": "Juegos pc",
"001-0167": "Almacenamiento",
"001-980": "Lector de codigos",
"001-0070": "Lectoras de cd y dvd",
"001-0071": "Lectores de memorias",
"001-0557": "Limpieza y mantenimiento",
"001-0020": "Maq. de escribir borradoras",
"001-0060": "Maq. de escribir casetes",
"003-1000": "Maquinas, herram. y repuestos",
"002-0280": "Memorias",
"001-0280": "Memorias",
"001-0590": "Memorias Notebook",
"001-0282": "Memorias",
"001-0523": "Memorias",
"002-0281": "Memorias",
"001-0281": "Memorias",
"001-0330": "Procesadores",
"001-0522": "Procesadores",
"001-0310": "Mouse Pad",
"001-0320": "Monitores",
"002-0320": "Monitores",
"000-0299": "Monopatines y scooters",
"002-0299": "Monopatines y scooters",
"001-0333": "Mother + micro",
"001-0331": "Motherboards",
"001-0340": "Mouses",
"001-0290": "Muebles",
"001-0130": "Networking",
"001-0360": "Base Notebook",
"001-0363": "Accesorios",
"002-0361": "Base Notebook",
"001-0456": "Notebooks repuestos",
"001-2096": "Parlantes",
"001-0370": "Papeleria",
"001-0355": "Parlantes",
"001-0003": "Pasta termica",
"001-0558": "Pilas y cargadores",
"001-0101": "Placa hba sas",
"001-0102": "Placas de Video",
"001-0100": "Placas de Video",
"001-0352": "Memorias Flash",
"002-0553": "Placas de Video",
"001-0560": "Placas de Video",
"001-0390": "Routers",
"001-500": "Productos de exportacion",
"001-0335": "Productos discontinuos",
"001-0420": "Punto de venta",
"001-3561": "Rack",
"001-0450": "Parlantes",
"001-0455": "Repuestos",
"001-0460": "Memorias",
"001-0480": "Rollos",
"001-0279": "Computadoras",
"001-0490": "Escaner",
"001-0491": "Scanners cheques",
"002-0304": "Accesorios",
"001-0304": "Accesorios",
"001-0157": "Perifericos",
"001-0300": "Servidores",
"001-0500": "Accesorios",
"001-0521": "Servidores storage",
"001-0291": "Sillas de oficina",
"001-0015": "Sillas",
"002-0021": "Sistema cx",
"907-1555": "Switches",
"001-0510": "Software",
"002-0510": "Software",
"001-0531": "Software",
"001-0502": "Soluciones hp",
"569": "Streaming",
"001-0368": "Gabinetes",
"001-0530": "Teclados",
"001-0013": "Papeleria",
"001-0258": "Toners",
"001-0540": "Ups",
"001-3560": "Accesorios",
"001-0168": "Proyectores",
"001-0309": "Camaras Web",
"001-0305": "Camaras Web",
"001-0362": "Workstation desktop",
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
            nombre = fila["Descripcion"]
            stock = int(fila["CBA"])
            garantia_meses = 6
            detalle = "a"
            largo = float("0")
            alto = float("0")
            ancho = float("0")
            peso = float("0")
            codigo_fabricante = fila["Part Number "]
            marca = "a"
            sub_categoria = "a"
            proveedor = "air"
            precio_dolares = fila["lista3"]
            precio_dolares_iva = float("{:.2f}".format(float(fila["lista3"]) * (float(fila["IVA"]) / 100 + 1)))
            iva = float(fila["IVA"]) 
            precio_pesos = float(fila["lista3"]) * float(dolar_venta)
            precio_pesos_iva = float("{:.2f}".format(float(fila["lista3"]) * float(dolar_venta) * (float(fila["IVA"]) / 100 + 1)))
            url_imagen = "https://i.imgur.com/0wbrCkz.png"
            codigo_categoria = fila["Rubro"]
            try:
                categoria = categorias_final_air[f"{codigo_categoria}"]
            except:
                categoria = 0   

            if (categoria != 0 and stock > 0 and len(codigo_fabricante) > 2):
                parametros = (nombre,stock,garantia_meses,detalle,largo,alto,ancho,peso,codigo_fabricante,marca,categoria,sub_categoria,proveedor,precio_dolares,precio_dolares_iva,iva,precio_pesos,precio_pesos_iva,url_imagen)
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