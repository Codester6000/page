-- MySQL Script generated by MySQL Workbench
-- Wed Jan 15 20:48:48 2025
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema schemamodex
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema schemamodex
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `schemamodex` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `schemamodex` ;

-- -----------------------------------------------------
-- Table `schemamodex`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`roles` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_rol`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`usuarios` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(25) NOT NULL,
  `password` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `id_rol` INT NOT NULL DEFAULT '1',
  `fechaNacimiento` DATE NOT NULL DEFAULT '2000-01-01',
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `id_usuario_UNIQUE` (`id_usuario` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  INDEX `fk_usuarios_roles1_idx` (`id_rol` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_roles1`
    FOREIGN KEY (`id_rol`)
    REFERENCES `schemamodex`.`roles` (`id_rol`))
ENGINE = InnoDB
AUTO_INCREMENT = 31
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`carrito`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`carrito` (
  `id_carrito` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `estado` VARCHAR(45) NULL DEFAULT 'activo',
  `fecha_creacion` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `id_intencion_pago` VARCHAR(60) NULL DEFAULT NULL,
  `total_a_pagar` DECIMAL(14,2) NULL DEFAULT NULL,
  `fecha_finalizada` TIMESTAMP NULL DEFAULT NULL,
  `comprobante` VARCHAR(80) NULL DEFAULT NULL,
  PRIMARY KEY (`id_carrito`),
  INDEX `fk_carrito_usuarios1_idx` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_carrito_usuarios1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `schemamodex`.`usuarios` (`id_usuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`productos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`productos` (
  `id_producto` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NULL DEFAULT NULL,
  `garantia_meses` INT NOT NULL,
  `detalle` LONGTEXT CHARACTER SET 'ascii' NOT NULL,
  `peso` DECIMAL(6,2) NOT NULL,
  `codigo_fabricante` VARCHAR(45) NOT NULL,
  `marca` VARCHAR(45) NOT NULL,
  `largo` DECIMAL(6,2) NULL DEFAULT NULL,
  `alto` DECIMAL(6,2) NULL DEFAULT NULL,
  `ancho` DECIMAL(6,2) NULL DEFAULT NULL,
  `consumo` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  UNIQUE INDEX `id_productos_UNIQUE` (`id_producto` ASC) VISIBLE,
  UNIQUE INDEX `codigo_fabricante_UNIQUE` (`codigo_fabricante` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 7379
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`carrito_detalle`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`carrito_detalle` (
  `id_carrito_detalle` INT NOT NULL AUTO_INCREMENT,
  `id_carrito` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `cantidad` INT NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_carrito_detalle`),
  INDEX `fk_carrito_detalle_carrito1_idx` (`id_carrito` ASC) VISIBLE,
  INDEX `fk_carrito_detalle_productos1_idx` (`id_producto` ASC) VISIBLE,
  CONSTRAINT `fk_carrito_detalle_carrito1`
    FOREIGN KEY (`id_carrito`)
    REFERENCES `schemamodex`.`carrito` (`id_carrito`),
  CONSTRAINT `fk_carrito_detalle_productos1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `schemamodex`.`productos` (`id_producto`))
ENGINE = InnoDB
AUTO_INCREMENT = 31
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`categorias`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`categorias` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre_categoria` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE INDEX `id_categoria_UNIQUE` (`id_categoria` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 279
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`favoritos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`favoritos` (
  `id_favorito` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `fecha_agregado` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_favorito`),
  INDEX `fk_favoritos_usuarios1_idx` (`id_usuario` ASC) VISIBLE,
  INDEX `fk_favoritos_productos1_idx` (`id_producto` ASC) VISIBLE,
  CONSTRAINT `fk_favoritos_productos1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `schemamodex`.`productos` (`id_producto`),
  CONSTRAINT `fk_favoritos_usuarios1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `schemamodex`.`usuarios` (`id_usuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 10
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`imagenes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`imagenes` (
  `id_imagen` INT NOT NULL AUTO_INCREMENT,
  `url_imagen` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id_imagen`),
  UNIQUE INDEX `id_imagene_UNIQUE` (`id_imagen` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 2004
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`proveedores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`proveedores` (
  `id_proveedor` INT NOT NULL AUTO_INCREMENT,
  `nombre_proveedor` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`),
  UNIQUE INDEX `id_proveedor_UNIQUE` (`id_proveedor` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`precios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`precios` (
  `id_precio` INT NOT NULL AUTO_INCREMENT,
  `precio_dolar` DECIMAL(8,2) NOT NULL,
  `precio_dolar_iva` DECIMAL(8,2) NOT NULL,
  `iva` DECIMAL(4,2) NOT NULL,
  `precio_pesos` DECIMAL(14,2) NOT NULL,
  `precio_pesos_iva` DECIMAL(14,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT '0',
  `id_proveedor` INT NOT NULL,
  `id_producto` INT NOT NULL,
  PRIMARY KEY (`id_precio`),
  UNIQUE INDEX `id_precio_UNIQUE` (`id_precio` ASC) VISIBLE,
  INDEX `fk_precios_proveedores1_idx` (`id_proveedor` ASC) VISIBLE,
  INDEX `fk_precios_productos_idx` (`id_producto` ASC) VISIBLE,
  CONSTRAINT `fk_precios_productos`
    FOREIGN KEY (`id_producto`)
    REFERENCES `schemamodex`.`productos` (`id_producto`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_precios_proveedores1`
    FOREIGN KEY (`id_proveedor`)
    REFERENCES `schemamodex`.`proveedores` (`id_proveedor`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 11254
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`productos_categorias`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`productos_categorias` (
  `id_productos_categorias` INT NOT NULL AUTO_INCREMENT,
  `id_producto` INT NOT NULL,
  `id_categoria` INT NOT NULL,
  PRIMARY KEY (`id_productos_categorias`),
  INDEX `fk_productos_categorias_productos1_idx` (`id_producto` ASC) VISIBLE,
  INDEX `fk_productos_categorias_categorias1_idx` (`id_categoria` ASC) VISIBLE,
  CONSTRAINT `fk_productos_categorias_categorias1`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `schemamodex`.`categorias` (`id_categoria`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_productos_categorias_productos1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `schemamodex`.`productos` (`id_producto`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 16802
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`productos_imagenes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`productos_imagenes` (
  `id_producto_imagene` INT NOT NULL AUTO_INCREMENT,
  `id_imagen` INT NOT NULL,
  `id_producto` INT NOT NULL,
  PRIMARY KEY (`id_producto_imagene`),
  UNIQUE INDEX `id_producto_imagene_UNIQUE` (`id_producto_imagene` ASC) VISIBLE,
  INDEX `fk_productos_imagenes_imagenes1_idx` (`id_imagen` ASC) VISIBLE,
  INDEX `fk_productos_imagenes_productos1_idx` (`id_producto` ASC) VISIBLE,
  CONSTRAINT `fk_productos_imagenes_imagenes1`
    FOREIGN KEY (`id_imagen`)
    REFERENCES `schemamodex`.`imagenes` (`id_imagen`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_productos_imagenes_productos1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `schemamodex`.`productos` (`id_producto`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 7596
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`productos_proveedores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`productos_proveedores` (
  `id_productos_proveedores` INT NOT NULL AUTO_INCREMENT,
  `id_producto` INT NOT NULL,
  `id_proveedor` INT NOT NULL,
  PRIMARY KEY (`id_productos_proveedores`),
  UNIQUE INDEX `id_productos_proveedores_UNIQUE` (`id_productos_proveedores` ASC) VISIBLE,
  INDEX `fk_productos_proveedores_proveedores_idx` (`id_proveedor` ASC) VISIBLE,
  INDEX `fk_productos_proveedores_productos1_idx` (`id_producto` ASC) VISIBLE,
  CONSTRAINT `fk_productos_proveedores_productos1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `schemamodex`.`productos` (`id_producto`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_productos_proveedores_proveedores`
    FOREIGN KEY (`id_proveedor`)
    REFERENCES `schemamodex`.`proveedores` (`id_proveedor`))
ENGINE = InnoDB
AUTO_INCREMENT = 7379
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

USE `schemamodex` ;

-- -----------------------------------------------------
-- procedure InsertCategoriasYRelacionesChipSet
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `InsertCategoriasYRelacionesChipSet`()
BEGIN
    -- Variables para almacenar temporalmente los IDs
    DECLARE categoria_id INT;

    -- Crear categorías si no existen
    INSERT INTO categorias (nombre_categoria)
    SELECT DISTINCT
        CASE
            WHEN nombre LIKE '%am4%' THEN 'am4'
            WHEN nombre LIKE '%am5%' THEN 'am5'
            WHEN nombre LIKE '%1200%' THEN '1200'
            WHEN nombre LIKE '%1700%' THEN '1700'
            WHEN nombre LIKE '%1151%' THEN '1151'
            WHEN nombre LIKE '%1851%' THEN '1851'
        END AS nombre_categoria
    FROM productos
    WHERE (nombre LIKE '%am4%' OR nombre LIKE '%am5%' OR nombre LIKE '%1200%' OR nombre LIKE '%1700%' OR nombre LIKE '%1151%' OR nombre LIKE '%1851%')
          AND CASE
                  WHEN nombre LIKE '%am4%' THEN 'am4'
                  WHEN nombre LIKE '%am5%' THEN 'am5'
                  WHEN nombre LIKE '%1200%' THEN '1200'
                  WHEN nombre LIKE '%1700%' THEN '1700'
                  WHEN nombre LIKE '%1151%' THEN '1151'
                  WHEN nombre LIKE '%1851%' THEN '1851'
              END NOT IN (SELECT nombre_categoria FROM categorias);

    -- Crear relaciones en productos_categorias
    INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT
        p.id_producto,
        c.id_categoria
    FROM productos p
    INNER JOIN categorias c
        ON (CASE
                WHEN p.nombre LIKE '%am4%' THEN 'am4'
                WHEN p.nombre LIKE '%am5%' THEN 'am5'
                WHEN p.nombre LIKE '%1200%' THEN '1200'
                WHEN p.nombre LIKE '%1700%' THEN '1700'
                WHEN p.nombre LIKE '%1151%' THEN '1151'
                WHEN p.nombre LIKE '%1851%' THEN '1851'
            END) = c.nombre_categoria
    WHERE (p.nombre LIKE '%am4%' OR p.nombre LIKE '%am5%' OR p.nombre LIKE '%1200%' OR p.nombre LIKE '%1700%' OR p.nombre LIKE '%1151%' OR p.nombre LIKE '%1851%')
          AND NOT EXISTS (
              SELECT 1
              FROM productos_categorias pc
              WHERE pc.id_producto = p.id_producto AND pc.id_categoria = c.id_categoria
          );
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure InsertCategoriasYRelacionesDDR
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `InsertCategoriasYRelacionesDDR`()
BEGIN
    -- Variables para almacenar temporalmente los IDs
    DECLARE categoria_id INT;

    -- Crear categorías si no existen
    INSERT INTO categorias (nombre_categoria)
    SELECT DISTINCT
        CASE
            WHEN nombre LIKE '%DDR4%' THEN 'DDR4'
            WHEN nombre LIKE '%DDR5%' THEN 'DDR5'
        END AS nombre_categoria
    FROM productos
    WHERE (nombre LIKE '%DDR4%' OR nombre LIKE '%DDR5%')
          AND CASE
                  WHEN nombre LIKE '%DDR4%' THEN 'DDR4'
                  WHEN nombre LIKE '%DDR5%' THEN 'DDR5'
              END NOT IN (SELECT nombre_categoria FROM categorias);

    -- Crear relaciones en productos_categorias
    INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT
        p.id_producto,
        c.id_categoria
    FROM productos p
    INNER JOIN categorias c
        ON (CASE
                WHEN p.nombre LIKE '%DDR4%' THEN 'DDR4'
                WHEN p.nombre LIKE '%DDR5%' THEN 'DDR5'
            END) = c.nombre_categoria
    WHERE (p.nombre LIKE '%DDR4%' OR p.nombre LIKE '%DDR5%')
          AND NOT EXISTS (
              SELECT 1
              FROM productos_categorias pc
              WHERE pc.id_producto = p.id_producto AND pc.id_categoria = c.id_categoria
          );
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure actualizar_precio
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `actualizar_precio`(
IN precio_dolar decimal(8,2),
IN precio_dolar_iva decimal(8,2),
IN iva decimal(4,2),
IN precio_pesos decimal(14,2),
IN precio_pesos_iva decimal(14,2),
IN stock INT,
IN id_proveedor INT,
IN id_producto INT
)
BEGIN
UPDATE precios p
    SET p.precio_dolar = precio_dolar,
    p.precio_dolar_iva = precio_dolar_iva,
    p.iva = iva,
    p.precio_pesos = precio_pesos,
    p.precio_pesos_iva = precio_pesos_iva,
    p.stock = stock
    WHERE p.id_producto = id_producto AND p.id_proveedor = id_proveedor;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure alterar_carrito
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `alterar_carrito`(
IN id_producto_param INT,
IN cantidad_param INT,
IN user_id INT
)
BEGIN
set @id_carrito_viejo = (SELECT id_carrito 
FROM carrito
WHERE id_usuario = user_id AND estado = 'activo' 
LIMIT 1);

UPDATE carrito_detalle SET cantidad = cantidad_param WHERE id_producto = id_producto_param AND id_carrito = @id_carrito_viejo;



END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure borrar_producto_carrito
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `borrar_producto_carrito`(
IN id_producto_param INT,
IN usuario_id INT
)
BEGIN
set @id_carrito_viejo = (SELECT id_carrito 
FROM carrito
WHERE id_usuario = usuario_id AND estado = 'activo' 
LIMIT 1);


DELETE FROM carrito_detalle WHERE id_producto = id_producto_param and id_carrito = @id_carrito_viejo;

END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure cargarDDRMOTHERS
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `cargarDDRMOTHERS`()
BEGIN

    -- Variables para las nuevas categorías
    DECLARE ddr4_id INT;
    DECLARE ddr5_id INT;

    -- Asegurarse de que las categorías DDR4 y DDR5 existen
    INSERT INTO categorias (nombre_categoria)
    SELECT 'DDR4'
    WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre_categoria = 'DDR4');

    INSERT INTO categorias (nombre_categoria)
    SELECT 'DDR5'
    WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre_categoria = 'DDR5');

    -- Obtener los IDs de las categorías DDR4 y DDR5
    SELECT id_categoria INTO ddr4_id FROM categorias WHERE nombre_categoria = 'DDR4';
    SELECT id_categoria INTO ddr5_id FROM categorias WHERE nombre_categoria = 'DDR5';

    -- Agregar la categoría DDR4 a productos con `motherboards` y `AM4`
    INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT
        pc1.id_producto, ddr4_id
    FROM productos_categorias pc1
    INNER JOIN categorias c1 ON pc1.id_categoria = c1.id_categoria
    INNER JOIN productos_categorias pc2 ON pc1.id_producto = pc2.id_producto
    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
    WHERE c1.nombre_categoria = 'Motherboards' 
      AND c2.nombre_categoria = 'am4'
      AND NOT EXISTS (
          SELECT 1
          FROM productos_categorias pc
          WHERE pc.id_producto = pc1.id_producto AND pc.id_categoria = ddr4_id
      );

    -- Agregar la categoría DDR5 a productos con `motherboard` y `AM5`
    INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT
        pc1.id_producto, ddr5_id
    FROM productos_categorias pc1
    INNER JOIN categorias c1 ON pc1.id_categoria = c1.id_categoria
    INNER JOIN productos_categorias pc2 ON pc1.id_producto = pc2.id_producto
    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
    WHERE c1.nombre_categoria = 'Motherboards' 
      AND c2.nombre_categoria = 'am5'
      AND NOT EXISTS (
          SELECT 1
          FROM productos_categorias pc
          WHERE pc.id_producto = pc1.id_producto AND pc.id_categoria = ddr5_id
      );
      
       -- Agregar la categoría DDR4 a productos con `motherboards` y `1200`
    INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT
        pc1.id_producto, ddr4_id
    FROM productos_categorias pc1
    INNER JOIN categorias c1 ON pc1.id_categoria = c1.id_categoria
    INNER JOIN productos_categorias pc2 ON pc1.id_producto = pc2.id_producto
    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
    WHERE c1.nombre_categoria = 'Motherboards' 
      AND c2.nombre_categoria = '1200'
      AND NOT EXISTS (
          SELECT 1
          FROM productos_categorias pc
          WHERE pc.id_producto = pc1.id_producto AND pc.id_categoria = ddr4_id
      );
      
       -- Agregar la categoría DDR5 a productos con `motherboard` y `1700`
    INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT
        pc1.id_producto, ddr5_id
    FROM productos_categorias pc1
    INNER JOIN categorias c1 ON pc1.id_categoria = c1.id_categoria
    INNER JOIN productos_categorias pc2 ON pc1.id_producto = pc2.id_producto
    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
    WHERE c1.nombre_categoria = 'Motherboards' 
      AND c2.nombre_categoria = '1700'
      AND NOT EXISTS (
          SELECT 1
          FROM productos_categorias pc
          WHERE pc.id_producto = pc1.id_producto AND pc.id_categoria = ddr5_id
      );
      
       -- Agregar la categoría DDR4 a productos con `motherboard` y `1151`
    INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT
        pc1.id_producto, ddr4_id
    FROM productos_categorias pc1
    INNER JOIN categorias c1 ON pc1.id_categoria = c1.id_categoria
    INNER JOIN productos_categorias pc2 ON pc1.id_producto = pc2.id_producto
    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
    WHERE c1.nombre_categoria = 'Motherboards' 
      AND c2.nombre_categoria = '1151'
      AND NOT EXISTS (
          SELECT 1
          FROM productos_categorias pc
          WHERE pc.id_producto = pc1.id_producto AND pc.id_categoria = ddr4_id
      );
      
	-- Agregar la categoría DDR5 a productos con `motherboard` y `1851`
    INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT
        pc1.id_producto, ddr5_id
    FROM productos_categorias pc1
    INNER JOIN categorias c1 ON pc1.id_categoria = c1.id_categoria
    INNER JOIN productos_categorias pc2 ON pc1.id_producto = pc2.id_producto
    INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
    WHERE c1.nombre_categoria = 'Motherboards' 
      AND c2.nombre_categoria = '1851'
      AND NOT EXISTS (
          SELECT 1
          FROM productos_categorias pc
          WHERE pc.id_producto = pc1.id_producto AND pc.id_categoria = ddr5_id
      );
      
      
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure cargarDatosProducto
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `cargarDatosProducto`(
IN nombre text,
IN stock INT,
IN garantia_meses INT,
IN detalle longtext,
IN largo decimal(6,2),
IN alto decimal(6,2),
IN ancho decimal(6,2),
IN peso decimal(6,2),
IN codigo_fabricante VARCHAR(45),
IN marca VARCHAR(45),
IN categoria VARCHAR(45),
IN sub_categoria VARCHAR(45),
IN proveedor varchar(45),
IN precio_dolar decimal(8,2),
IN precio_dolar_iva decimal(8,2),
IN iva decimal(4,2),
IN precio_pesos decimal(14,2),
IN precio_pesos_iva decimal(14,2),
IN url_imagen varchar(150)


)
BEGIN
IF NOT EXISTS(SELECT * FROM productos p WHERE p.codigo_fabricante = codigo_fabricante)
THEN

INSERT INTO productos (nombre,garantia_meses,detalle,peso,codigo_fabricante,marca,largo,alto,ancho)
VALUES (nombre,garantia_meses,detalle,peso,codigo_fabricante,marca,largo,alto,ancho);
SET @id_producto := last_insert_id();
call schemamodex.cargar_proveedores(proveedor, @id_producto);
call schemamodex.cargar_categorias(categoria,sub_categoria, @id_producto);
call schemamodex.cargar_imagen(url_imagen, @id_producto);

set @id_proveedor = (SELECT id_proveedor from proveedores WHERE nombre_proveedor = proveedor);
call schemamodex.cargar_precios(precio_dolar, precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,@id_proveedor,@id_producto);
Else

set @id_proveedor = (SELECT id_proveedor from proveedores WHERE nombre_proveedor = proveedor);
set @id_producto = (SELECT id_producto from productos p WHERE p.codigo_fabricante = codigo_fabricante);

IF NOT EXISTS (SELECT * FROM productos_proveedores pp WHERE pp.id_proveedor = @id_proveedor AND pp.id_producto = @id_producto)
	THEN
	call schemamodex.cargar_proveedores(proveedor, @id_producto);
	call schemamodex.cargar_categorias(categoria,sub_categoria, @id_producto);
    call schemamodex.cargar_precios(precio_dolar, precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,@id_proveedor,@id_producto);
	
 
	ELSE
 call schemamodex.actualizar_precio(precio_dolar, precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,@id_proveedor,@id_producto);   
    END IF;
end if;
 SELECT 'Ejecución completada', @id_producto, @id_proveedor;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure cargar_carrito
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `cargar_carrito`(
IN id_usuario_param INT,
IN id_producto_param INT,
IN cantidad_param INT

)
BEGIN
IF NOT EXISTS (SELECT id_carrito 
FROM carrito 
WHERE id_usuario = id_usuario_param AND estado = 'activo' 
LIMIT 1)
THEN
INSERT INTO carrito (id_usuario,estado) VALUES (id_usuario_param,'activo');
set @nuevo_id_carrito := last_insert_id();
INSERT INTO carrito_detalle (id_carrito,id_producto,cantidad) VALUES (@nuevo_id_carrito, id_producto_param,cantidad_param);
ELSE

set @id_carrito_viejo = (SELECT id_carrito 
FROM carrito
WHERE id_usuario = id_usuario_param AND estado = 'activo' 
LIMIT 1);

INSERT INTO carrito_detalle (id_carrito,id_producto,cantidad) VALUES (@id_carrito_viejo, id_producto_param,cantidad_param);




END IF;

END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure cargar_categorias
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `cargar_categorias`(
IN categoria varchar(45),
IN sub_categoria varchar(45),
IN id_producto INT
)
BEGIN
IF NOT EXISTS(SELECT * FROM categorias c WHERE c.nombre_categoria = categoria)
THEN
INSERT INTO categorias (nombre_categoria) VALUES (categoria);
set @nuevo_id_categoria := last_insert_id();
INSERT INTO productos_categorias (id_producto, id_categoria) VALUES (id_producto,@nuevo_id_categoria);
ELSE
SET @id_categoria = (SELECT id_categoria from categorias WHERE nombre_categoria = categoria); 
INSERT INTO productos_categorias (id_producto, id_categoria) VALUES (id_producto,@id_categoria);
end if;

IF NOT EXISTS(SELECT * FROM categorias c WHERE c.nombre_categoria = sub_categoria)
THEN
INSERT INTO categorias (nombre_categoria) VALUES (sub_categoria);
set @nuevo_id_sub_categoria := last_insert_id();
INSERT INTO productos_categorias (id_producto, id_categoria) VALUES (id_producto,@nuevo_id_sub_categoria);
ELSE
SET @id_sub_categoria = (SELECT id_categoria from categorias WHERE nombre_categoria = sub_categoria); 
INSERT INTO productos_categorias (id_producto, id_categoria) VALUES (id_producto,@id_sub_categoria);
end if;

END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure cargar_imagen
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `cargar_imagen`(
IN url_imagen varchar(150),
IN id_producto int
)
BEGIN
IF NOT EXISTS(SELECT * FROM imagenes i WHERE i.url_imagen = url_imagen)
THEN
INSERT INTO imagenes (url_imagen) VALUES (url_imagen);
SET @id_imagen := last_insert_id();

INSERT INTO productos_imagenes(id_imagen, id_producto) VALUES (@id_imagen, id_producto);

else
SET @id_imagen_existente = (SELECT i.id_imagen FROM imagenes i WHERE i.url_imagen = url_imagen);
INSERT INTO productos_imagenes(id_imagen, id_producto) VALUES (@id_imagen_existente, id_producto);
end if;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure cargar_precios
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `cargar_precios`(
IN precio_dolar decimal(8,2),
IN precio_dolar_iva decimal(8,2),
IN iva decimal(4,2),
IN precio_pesos decimal(14,2),
IN precio_pesos_iva decimal(14,2),
IN stock INT,
IN id_proveedor INT,
IN id_producto INT
)
BEGIN
INSERT INTO precios (precio_dolar,precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,id_proveedor,id_producto) 
VALUES (precio_dolar, precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,id_proveedor,id_producto);

END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure cargar_proveedores
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `cargar_proveedores`(
IN nombre_proveedor varchar(45),
IN id_producto INT
)
BEGIN
IF NOT EXISTS (SELECT * from proveedores p where p.nombre_proveedor = nombre_proveedor)
THEN
INSERT INTO proveedores (nombre_proveedor) VALUES (nombre_proveedor);
SET @nuevo_id_proveedor := last_insert_id();
INSERT INTO productos_proveedores (id_producto, id_proveedor) VALUES (id_producto, @nuevo_id_proveedor);
ELSE
SET @id_proveedor= (SELECT id_proveedor from proveedores p WHERE p.nombre_proveedor= nombre_proveedor); 

#Insertamos la relacion productos_proveedores;
INSERT INTO productos_proveedores (id_producto, id_proveedor) VALUES (id_producto,@id_proveedor);

END IF;

END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure determinar_categoria_armador
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `determinar_categoria_armador`(
IN id_producto INT
)
BEGIN
SELECT c.nombre_categoria
FROM categorias c
INNER JOIN productos_categorias pc ON c.id_categoria = pc.id_categoria
INNER JOIN productos pr ON pr.id_producto = pc.id_producto
WHERE c.nombre_categoria IN ("am3","am4","am5","1200","1700","1151","1851","DDR4","DDR5")
AND pr.id_producto = id_producto;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure get_armador
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`mati2`@`%` PROCEDURE `get_armador`(

)
BEGIN
SELECT 
    pr.nombre, 
    p.stock, 
    pr.peso, 
    pr.garantia_meses, 
    pr.codigo_fabricante,
    GROUP_CONCAT(DISTINCT c.nombre_categoria SEPARATOR ', ') AS categorias,
    GROUP_CONCAT(DISTINCT i.url_imagen SEPARATOR ', ') AS url_imagenes,
    p.precio_dolar, 
    p.precio_dolar_iva, 
    p.iva, 
    p.precio_pesos, 
    p.precio_pesos_iva,
    pr.alto, 
    pr.ancho, 
    pr.largo, 
    pro.nombre_proveedor,
    CASE 
            WHEN EXISTS (
                SELECT 1
                FROM productos pr2
                INNER JOIN productos_categorias pc2 ON pr2.id_producto = pc2.id_producto
                INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
                WHERE 
                    c2.nombre_categoria IN (SELECT c.nombre_categoria
FROM categorias c
INNER JOIN productos_categorias pc ON c.id_categoria = pc.id_categoria
INNER JOIN productos pr ON pr.id_producto = pc.id_producto
WHERE c.nombre_categoria IN ("am3","am4","am5","1200","1700","1151","DDR4","DDR5")
AND pr.id_producto = 741
    ) -- Ejemplo de llamada al procedimiento
            ) THEN 'Compatible'
            ELSE 'No Compatible'
        END AS compatibilidad
FROM productos pr
INNER JOIN precios p ON pr.id_producto = p.id_producto
INNER JOIN productos_categorias pc ON pr.id_producto = pc.id_producto
INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
INNER JOIN productos_imagenes pi ON pi.id_producto = pr.id_producto
INNER JOIN imagenes i ON pi.id_imagen = i.id_imagen
INNER JOIN proveedores pro ON pro.id_proveedor = p.id_proveedor
WHERE 
    p.precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = pr.id_producto AND stock > 0
    )

GROUP BY pr.id_producto, p.stock, p.precio_dolar, p.precio_dolar_iva, p.iva, p.precio_pesos, p.precio_pesos_iva, pr.alto, pr.ancho, pr.largo, pro.nombre_proveedor;
END$$

DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
