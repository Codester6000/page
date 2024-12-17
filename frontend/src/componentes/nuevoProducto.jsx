import React from "react";
import '../nuevoProducto.css'
const NuevoProducto = () =>{
    return (
        <div className="nuevoProducto">
            <form className="formProducto">
                <h2>Cargar Producto</h2>
                <div className="fila">
                    <div className="labelInput">
                        <label htmlFor="marca">Marca</label>
                        <input type="text" name="marca" id="marca"/>
                    </div>
                    <div className="labelInput">
                        <label htmlFor="categoria">Categoria</label>
                        <select name="categoria" >
                        <option value="Computadoras">Computadoras</option>
                        <option value="All In One">All In One</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Coolers">Coolers</option>
                        <option value="Seguridad">Seguridad</option>
                        <option value="Camaras Wifi">Camaras Wifi</option>
                        <option value="Imagen">Imagen</option>
                        <option value="Accesorios">Accesorios</option>
                        <option value="Conectividad">Conectividad</option>
                        <option value="Extensores">Extensores</option>
                        <option value="Fuentes">Fuentes</option>
                        <option value="Audio">Audio</option>
                        <option value="Auriculares">Auriculares</option>
                        <option value="Base Notebook">Base Notebook</option>
                        <option value="Insumos">Insumos</option>
                        <option value="Botellas de Tinta">Botellas de Tinta</option>
                        <option value="Gabinetes">Gabinetes</option>
                        <option value="Camaras IP">Camaras IP</option>
                        <option value="Candado">Candado</option>
                        <option value="Cartuchos de Tinta">Cartuchos de Tinta</option>
                        <option value="Cintas">Cintas</option>
                        <option value="Software">Software</option>
                        <option value="Garantia">Garantia</option>
                        <option value="Almacenamiento">Almacenamiento</option>
                        <option value="Discos Internos SSD">Discos Internos SSD</option>
                        <option value="Placas de Video">Placas de Video</option>
                        <option value="Perifericos">Perifericos</option>
                        <option value="Camaras Web">Camaras Web</option>
                        <option value="Discos Externos">Discos Externos</option>
                        <option value="Discos Externos SSD">Discos Externos SSD</option>
                        <option value="Discos Internos">Discos Internos</option>
                        <option value="Docking">Docking</option>
                        <option value="Proyectores">Proyectores</option>
                        <option value="Estuches">Estuches</option>
                        <option value="Fundas">Fundas</option>
                        <option value="PC de Escritorio">PC de Escritorio</option>
                        <option value="Notebooks Corporativo">Notebooks Corporativo</option>
                        <option value="Networking">Networking</option>
                        <option value="Hubs">Hubs</option>
                        <option value="Impresoras">Impresoras</option>
                        <option value="Impresoras Inkjet">Impresoras Inkjet</option>
                        <option value="Impresoras de Sistema Continuo">Impresoras de Sistema Continuo</option>
                        <option value="Impresoras Multifunción">Impresoras Multifunción</option>
                        <option value="Impresoras de Tickets">Impresoras de Tickets</option>
                        <option value="Impresoras Laser">Impresoras Laser</option>
                        <option value="Impresoras Matricial">Impresoras Matricial</option>
                        <option value="Joysticks">Joysticks</option>
                        <option value="Notebooks Consumo">Notebooks Consumo</option>
                        <option value="Accesorios Videojuegos">Accesorios Videojuegos</option>
                        <option value="Maletines">Maletines</option>
                        <option value="Memorias">Memorias</option>
                        <option value="Memorias Notebook">Memorias Notebook</option>
                        <option value="Memorias PC">Memorias PC</option>
                        <option value="Microfonos">Microfonos</option>
                        <option value="Mochilas">Mochilas</option>
                        <option value="Monitores">Monitores</option>
                        <option value="Motherboards">Motherboards</option>
                        <option value="Mouses">Mouses</option>
                        <option value="Mouse Pad">Mouse Pad</option>
                        <option value="Nvrs">Nvrs</option>
                        <option value="Parlantes">Parlantes</option>
                        <option value="Pen Drive">Pen Drive</option>
                        <option value="Procesadores">Procesadores</option>
                        <option value="Toners">Toners</option>
                        <option value="Papeleria">Papeleria</option>
                        <option value="Rollos">Rollos</option>
                        <option value="Routers">Routers</option>
                        <option value="Switches">Switches</option>
                        <option value="Muebles">Muebles</option>
                        <option value="Sillas">Sillas</option>
                        <option value="Memorias Flash">Memorias Flash</option>
                        <option value="Teclados">Teclados</option>
                        <option value="Volantes">Volantes</option>
                        <option value="Electrodomesticos y tv">Electrodomesticos y tv</option>
                        <option value="Limpieza y mantenimiento">Limpieza y mantenimiento</option>
                        <option value="Repuestos">Repuestos</option>
                        <option value="Punto de venta">Punto de venta</option>
                        <option value="Domotica - smart house">Domotica - smart house</option>
                        <option value="Disqueteras y lectores zip">Disqueteras y lectores zip</option>
                        <option value="Fiscal epson">Fiscal epson</option>
                        <option value="Imp. de aguja epson">Imp. de aguja epson</option>
                        <option value="Estabilizadores">Estabilizadores</option>
                        <option value="Maquinas, herram. y repuestos">Maquinas, herram. y repuestos</option>
                        <option value="Fax">Fax</option>
                        <option value="Bolsos fundas y maletines">Bolsos fundas y maletines</option>
                        <option value="Grabadoras cd / dvd">Grabadoras cd / dvd</option>
                        <option value="Discos rigidos hdd sata server">Discos rigidos hdd sata server</option>
                        <option value="Pilas y cargadores">Pilas y cargadores</option>
                        <option value="Backup">Backup</option>
                        <option value="Lector de codigos">Lector de codigos</option>
                        <option value="Imp laser negro">Imp laser negro</option>
                        <option value="Mother + micro">Mother + micro</option>
                        <option value="Imp mf c/sist. cont.">Imp mf c/sist. cont.</option>
                        <option value="Imp mf laser negro">Imp mf laser negro</option>
                        <option value="Rack">Rack</option>
                        <option value="Pasta termica">Pasta termica</option>
                        <option value="Streaming">Streaming</option>
                        <option value="Escaner">Escaner</option>
                        <option value="Servidores">Servidores</option>
                        <option value="Sillas de oficina">Sillas de oficina</option>
                        <option value="Iluminacion led">Iluminacion led</option>
                        <option value="Ups">Ups</option>
                        <option value="1700">1700</option>
                        <option value="am4">am4</option>
                        <option value="1200">1200</option>
                        <option value="am5">am5</option>
                        <option value="DDR4">DDR4</option>
                        <option value="DDR5">DDR5</option>
                        <option value="General">General</option>
                        <option value="Notebook">Notebook</option>
                        <option value="Impresora">Impresora</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Consola">Consola</option>
                        </select>
                    </div>
                    <div className="labelInput">
                        <label htmlFor="nombre">Nombre</label>
                        <input type="text" name="nombre" id="nombre"/>
                    </div>
                    <div className="labelInput">
                        <label htmlFor="stock">stock</label>
                        <input type="number" name="stock" id="stock"/>
                    </div>
                </div>
                <div className="fila"  id="filaDetalle">
                <div className="labelInput">
                        <label htmlFor="detalle">Detalle</label>
                        <textarea name="detalle" ></textarea>
                    </div>
                <div className="labelInput">
                        <label htmlFor="Garantia">Garantia</label>
                        <input type="number" name="Garantia" id="garantia" />
                    </div>
                </div>
                    <div className="fila" id='medidas'>
                        <h3 className="titulo">Medida y Peso</h3>
                        <div className="labelInput">
                        <label htmlFor="Ancho">Ancho(cm)</label>
                        <input type="number" name="Ancho"  />
                    </div>
                    <div className="labelInput">
                        <label htmlFor="Alto">Alto (cm)</label>
                        <input type="number" name="Alto"  />
                    </div>
                    <div className="labelInput">
                        <label htmlFor="Largo">Largo(cm)</label>
                        <input type="number" name="Largo"  />
                    </div>
                    <div className="labelInput">
                        <label htmlFor="Peso">Peso (kg)</label>
                        <input type="number" name="Peso"  />
                    </div>
                    </div>
                <div className="fila">
                    <h3 className="titulo">Identificacion</h3>
                    <div className="labelInput">
                        <label htmlFor="codigoFabricante">Codigo Fabricante</label>
                        <input type="number" name="codigoFabricante"  />
                    </div>
                </div>
                <div className="fila">
                    <h3 className="titulo">Proveedor</h3>
                    <div className="labelRadio">
                        <input type="radio" name="proveedor" id="Air" value='Air'/>
                        <label htmlFor="Air">Air</label>
                    </div>
                    <div className="labelRadio">
                        <input type="radio" name="proveedor" id="Elite" value='Elite'/>
                        <label htmlFor="Elite">Elite</label>
                    </div>
                    <div className="labelRadio">
                        <input type="radio" name="proveedor" id="Modex" value='Modex'/>
                        <label htmlFor="Modex">Modex</label>
                    </div>
                    <div className="labelRadio">
                        <input type="radio" name="proveedor" id="otros" value='otros'/>
                        <label htmlFor="otros">otros</label>
                    </div>
                </div>

                <div className="fila" >
                    <h3 className="titulo">Precio</h3>
                    <div className="fila" id="filaPrecio">
                        <div className="fila">
                            <div className="labelInput">
                                <label htmlFor="precio_dolar">Precio Dolar</label>
                                <input type="number" name="precio_dolar"  />
                            </div>
                            <div className="labelInput">
                                <label htmlFor="precio_dolar_iva">Precio Dolar iva</label>
                                <input type="number" name="precio_dolar_iva"  />
                            </div>
                            <div className="labelInput">
                                <label htmlFor="iva">IVA</label>
                                <input type="number" name="iva"  />
                            </div>
                        </div>

                    <div className="fila">
                        <div className="labelInput">
                            <label htmlFor="precio_pesos">Precio Pesos</label>
                            <input type="number" name="precio_pesos"  />
                        </div>
                        <div className="labelInput">
                            <label htmlFor="precio_pesos_iva">Precio Pesos Iva</label>
                            <input type="number" name="precio_pesos_iva"  />
                        </div>
                    </div>
                    </div>
                </div>
                <div className="fila">
                    <h3 className="titulo">Imagen</h3>
                    <div className="labelInput">
                        <label htmlFor="url">url imagen</label>
                        <input type="number" name="url"  />
                    </div>
                </div>
                <button type="submit" className="botonCargar">Cargar Producto</button>
            </form>
        </div>
    )
}

export default NuevoProducto;