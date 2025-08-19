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
  `nombre` VARCHAR(45) NULL DEFAULT NULL,
  `apellido` VARCHAR(45) NULL DEFAULT NULL,
  `direccion` VARCHAR(80) NULL DEFAULT NULL,
  `telefono` VARCHAR(45) NULL DEFAULT NULL,
  `compro_usado` TINYINT NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `id_usuario_UNIQUE` (`id_usuario` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  INDEX `fk_usuarios_roles1_idx` (`id_rol` ASC) VISIBLE,
  CONSTRAINT `fk_usuarios_roles1`
    FOREIGN KEY (`id_rol`)
    REFERENCES `schemamodex`.`roles` (`id_rol`))
ENGINE = InnoDB
AUTO_INCREMENT = 561
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
  `metodo_pago` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id_carrito`),
  INDEX `fk_carrito_usuarios1_idx` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_carrito_usuarios1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `schemamodex`.`usuarios` (`id_usuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 269
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`productos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`productos` (
  `id_producto` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NULL DEFAULT NULL,
  `garantia_meses` INT NOT NULL,
  `detalle` LONGTEXT CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' NULL DEFAULT NULL,
  `peso` DECIMAL(6,2) NOT NULL,
  `codigo_fabricante` VARCHAR(45) NOT NULL,
  `marca` VARCHAR(45) NOT NULL,
  `largo` DECIMAL(6,2) NULL DEFAULT NULL,
  `alto` DECIMAL(6,2) NULL DEFAULT NULL,
  `ancho` DECIMAL(6,2) NULL DEFAULT NULL,
  `consumo` INT NULL DEFAULT NULL,
  `usado` TINYINT NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_producto`),
  UNIQUE INDEX `id_productos_UNIQUE` (`id_producto` ASC) VISIBLE,
  UNIQUE INDEX `codigo_fabricante_UNIQUE` (`codigo_fabricante` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 9860
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
AUTO_INCREMENT = 1678
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
AUTO_INCREMENT = 382
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`empleados`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`empleados` (
  `id_empleado` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `dni` VARCHAR(20) NOT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `email` VARCHAR(100) NULL DEFAULT NULL,
  `direccion` VARCHAR(200) NULL DEFAULT NULL,
  `fecha_ingreso` DATE NULL DEFAULT curdate(),
  `estado` VARCHAR(20) NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_empleado`),
  UNIQUE INDEX `dni` (`dni` ASC) VISIBLE,
  UNIQUE INDEX `dni_2` (`dni` ASC) VISIBLE,
  UNIQUE INDEX `email` (`email` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 8
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
AUTO_INCREMENT = 159
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
AUTO_INCREMENT = 5610
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`imagenes_pasos_mantenimiento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`imagenes_pasos_mantenimiento` (
  `id_imagen` INT NOT NULL AUTO_INCREMENT,
  `numero_ficha` VARCHAR(50) NOT NULL,
  `tipo_producto` ENUM('PC', 'Notebook', 'Celular') NOT NULL,
  `orden_paso` INT NOT NULL,
  `url_imagen` VARCHAR(255) NOT NULL,
  `fecha_subida` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `titulo` VARCHAR(100) NULL DEFAULT NULL,
  `comentario` TEXT NULL DEFAULT NULL,
  `icono` VARCHAR(50) NULL DEFAULT NULL,
  `imagen` VARCHAR(255) NULL DEFAULT NULL,
  `fecha` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `id_mantenimiento` INT NULL DEFAULT NULL,
  `orden` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id_imagen`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`mantenimientos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`mantenimientos` (
  `id_mantenimiento` INT NOT NULL AUTO_INCREMENT,
  `numero_ficha` VARCHAR(50) NULL DEFAULT NULL,
  `id_usuario` INT NOT NULL,
  `dni_propietario` VARCHAR(20) NULL DEFAULT NULL,
  `nombre_producto` VARCHAR(100) NOT NULL,
  `responsable_de_retiro` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(20) NOT NULL,
  `direccion_propietario` VARCHAR(150) NOT NULL,
  `mail` VARCHAR(100) NOT NULL,
  `empleado_asignado` INT NULL DEFAULT NULL,
  `descripcion_producto` TEXT NULL DEFAULT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  `fecha_inicio` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` VARCHAR(50) NULL DEFAULT 'Pendiente',
  `fecha_finalizacion` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  UNIQUE INDEX `numero_ficha` (`numero_ficha` ASC) VISIBLE,
  UNIQUE INDEX `numero_ficha_2` (`numero_ficha` ASC) VISIBLE,
  UNIQUE INDEX `numero_ficha_3` (`numero_ficha` ASC) VISIBLE,
  UNIQUE INDEX `numero_ficha_4` (`numero_ficha` ASC) VISIBLE,
  UNIQUE INDEX `numero_ficha_5` (`numero_ficha` ASC) VISIBLE,
  INDEX `id_usuario` (`id_usuario` ASC) VISIBLE,
  INDEX `fk_empleado_asignado` (`empleado_asignado` ASC) VISIBLE,
  CONSTRAINT `fk_empleado_asignado`
    FOREIGN KEY (`empleado_asignado`)
    REFERENCES `schemamodex`.`empleados` (`id_empleado`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `mantenimientos_ibfk_1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `schemamodex`.`usuarios` (`id_usuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 31
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`mantenimientos_celular`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`mantenimientos_celular` (
  `id_mantenimiento` INT NOT NULL AUTO_INCREMENT,
  `numero_ficha` VARCHAR(20) NULL DEFAULT NULL,
  `id_usuario` INT NULL DEFAULT NULL,
  `dni_propietario` VARCHAR(20) NULL DEFAULT NULL,
  `nombre_producto` VARCHAR(100) NULL DEFAULT NULL,
  `responsable_de_retiro` VARCHAR(100) NULL DEFAULT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `direccion_propietario` VARCHAR(255) NULL DEFAULT NULL,
  `mail` VARCHAR(100) NULL DEFAULT NULL,
  `empleado_asignado` INT NULL DEFAULT NULL,
  `descripcion_producto` TEXT NULL DEFAULT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  `fecha_inicio` DATE NULL DEFAULT NULL,
  `estado` VARCHAR(50) NULL DEFAULT NULL,
  `fecha_finalizacion` DATE NULL DEFAULT NULL,
  `pantalla` VARCHAR(100) NULL DEFAULT NULL,
  `bateria` VARCHAR(100) NULL DEFAULT NULL,
  `camara` VARCHAR(100) NULL DEFAULT NULL,
  `placa_base` VARCHAR(100) NULL DEFAULT NULL,
  `sistema_operativo` VARCHAR(100) NULL DEFAULT NULL,
  `username` VARCHAR(100) NULL DEFAULT NULL,
  `detalles` JSON NOT NULL,
  `detalles_proceso` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  UNIQUE INDEX `numero_ficha` (`numero_ficha` ASC) VISIBLE,
  INDEX `fk_empleado_asignado_celular` (`empleado_asignado` ASC) VISIBLE,
  INDEX `fk_usuario_celular` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_empleado_asignado_celular`
    FOREIGN KEY (`empleado_asignado`)
    REFERENCES `schemamodex`.`empleados` (`id_empleado`),
  CONSTRAINT `fk_usuario_celular`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `schemamodex`.`usuarios` (`id_usuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`mantenimientos_general`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`mantenimientos_general` (
  `id_mantenimiento` INT NOT NULL AUTO_INCREMENT,
  `numero_ficha` VARCHAR(20) NULL DEFAULT NULL,
  `id_usuario` INT NULL DEFAULT NULL,
  `dni_propietario` VARCHAR(20) NULL DEFAULT NULL,
  `nombre_producto` VARCHAR(100) NULL DEFAULT NULL,
  `responsable_de_retiro` VARCHAR(100) NULL DEFAULT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `direccion_propietario` VARCHAR(255) NULL DEFAULT NULL,
  `mail` VARCHAR(100) NULL DEFAULT NULL,
  `empleado_asignado` INT NULL DEFAULT NULL,
  `descripcion_producto` TEXT NULL DEFAULT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  `fecha_inicio` DATE NULL DEFAULT NULL,
  `estado` VARCHAR(50) NULL DEFAULT NULL,
  `fecha_finalizacion` DATE NULL DEFAULT NULL,
  `username` VARCHAR(100) NULL DEFAULT NULL,
  `detalles` JSON NOT NULL,
  `detalles_proceso` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  UNIQUE INDEX `numero_ficha` (`numero_ficha` ASC) VISIBLE,
  INDEX `fk_empleado_asignado_general` (`empleado_asignado` ASC) VISIBLE,
  INDEX `fk_usuario_general` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_empleado_asignado_general`
    FOREIGN KEY (`empleado_asignado`)
    REFERENCES `schemamodex`.`empleados` (`id_empleado`),
  CONSTRAINT `fk_usuario_general`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `schemamodex`.`usuarios` (`id_usuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`mantenimientos_notebook`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`mantenimientos_notebook` (
  `id_mantenimiento` INT NOT NULL AUTO_INCREMENT,
  `numero_ficha` VARCHAR(20) NULL DEFAULT NULL,
  `id_usuario` INT NULL DEFAULT NULL,
  `dni_propietario` VARCHAR(20) NULL DEFAULT NULL,
  `nombre_producto` VARCHAR(100) NULL DEFAULT NULL,
  `responsable_de_retiro` VARCHAR(100) NULL DEFAULT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `direccion_propietario` VARCHAR(255) NULL DEFAULT NULL,
  `mail` VARCHAR(100) NULL DEFAULT NULL,
  `empleado_asignado` INT NULL DEFAULT NULL,
  `descripcion_producto` TEXT NULL DEFAULT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  `fecha_inicio` DATE NULL DEFAULT NULL,
  `estado` VARCHAR(50) NULL DEFAULT NULL,
  `fecha_finalizacion` DATE NULL DEFAULT NULL,
  `username` VARCHAR(100) NULL DEFAULT NULL,
  `detalles` JSON NOT NULL,
  `detalles_proceso` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  UNIQUE INDEX `numero_ficha` (`numero_ficha` ASC) VISIBLE,
  INDEX `fk_empleado_asignado_notebook` (`empleado_asignado` ASC) VISIBLE,
  INDEX `fk_usuario_notebook` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_empleado_asignado_notebook`
    FOREIGN KEY (`empleado_asignado`)
    REFERENCES `schemamodex`.`empleados` (`id_empleado`),
  CONSTRAINT `fk_usuario_notebook`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `schemamodex`.`usuarios` (`id_usuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`mantenimientos_pc`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`mantenimientos_pc` (
  `id_mantenimiento` INT NOT NULL AUTO_INCREMENT,
  `numero_ficha` VARCHAR(20) NULL DEFAULT NULL,
  `id_usuario` INT NULL DEFAULT NULL,
  `dni_propietario` VARCHAR(20) NULL DEFAULT NULL,
  `nombre_producto` VARCHAR(100) NULL DEFAULT NULL,
  `responsable_de_retiro` VARCHAR(100) NULL DEFAULT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `direccion_propietario` VARCHAR(255) NULL DEFAULT NULL,
  `mail` VARCHAR(100) NULL DEFAULT NULL,
  `empleado_asignado` INT NULL DEFAULT NULL,
  `descripcion_producto` TEXT NULL DEFAULT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  `fecha_inicio` DATE NULL DEFAULT NULL,
  `estado` VARCHAR(50) NULL DEFAULT NULL,
  `fecha_finalizacion` DATE NULL DEFAULT NULL,
  `username` VARCHAR(100) NULL DEFAULT NULL,
  `detalles` JSON NOT NULL,
  `detalles_proceso` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  UNIQUE INDEX `numero_ficha` (`numero_ficha` ASC) VISIBLE,
  INDEX `fk_empleado_asignado_pc` (`empleado_asignado` ASC) VISIBLE,
  INDEX `fk_usuario_pc` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_empleado_asignado_pc`
    FOREIGN KEY (`empleado_asignado`)
    REFERENCES `schemamodex`.`empleados` (`id_empleado`),
  CONSTRAINT `fk_usuario_pc`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `schemamodex`.`usuarios` (`id_usuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 14
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
  `deshabilitado` TINYINT NULL DEFAULT '0',
  `deposito` VARCHAR(45) NOT NULL,
  `oferta` TINYINT NULL DEFAULT '0',
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
AUTO_INCREMENT = 13732
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
AUTO_INCREMENT = 29476
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
AUTO_INCREMENT = 13831
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
AUTO_INCREMENT = 9860
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

USE `schemamodex` ;

-- -----------------------------------------------------
-- Placeholder table for view `schemamodex`.`vista_mantenimientos_dni`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`vista_mantenimientos_dni` (`id_mantenimiento` INT, `id_usuario` INT, `dni_propietario` INT, `nombre_producto` INT, `responsable_de_retiro` INT, `telefono` INT, `direccion_propietario` INT, `mail` INT, `empleado_asignado` INT, `descripcion_producto` INT, `observaciones` INT, `fecha_inicio` INT, `estado` INT, `numero_ficha` INT, `detalles` INT);

-- -----------------------------------------------------
-- Placeholder table for view `schemamodex`.`vista_mantenimientos_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`vista_mantenimientos_usuario` (`tipo` INT, `id_mantenimiento` INT, `id_usuario` INT, `dni_propietario` INT, `nombre_producto` INT, `responsable_de_retiro` INT, `telefono` INT, `direccion_propietario` INT, `mail` INT, `empleado_asignado` INT, `descripcion_producto` INT, `observaciones` INT, `fecha_inicio` INT, `estado` INT, `detalles` INT);

-- -----------------------------------------------------
-- procedure InsertCategoriasYRelacionesChipSet
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertCategoriasYRelacionesChipSet`()
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertCategoriasYRelacionesDDR`()
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `actualizar_precio`(
IN precio_dolar decimal(8,2),
IN precio_dolar_iva decimal(8,2),
IN iva decimal(4,2),
IN precio_pesos decimal(14,2),
IN precio_pesos_iva decimal(14,2),
IN stock INT,
IN id_proveedor INT,
IN id_producto INT,
IN deposito VARCHAR(45)
)
BEGIN
UPDATE precios p
    SET p.precio_dolar = precio_dolar,
    p.precio_dolar_iva = precio_dolar_iva,
    p.iva = iva,
    p.precio_pesos = precio_pesos,
    p.precio_pesos_iva = precio_pesos_iva,
    p.stock = stock,
    p.deshabilitado = 0,
    p.deposito = deposito
    WHERE p.id_producto = id_producto AND p.id_proveedor = id_proveedor;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure alterar_carrito
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `alterar_carrito`(
IN id_producto_param INT,
IN cantidad_param INT,
IN user_id INT
)
BEGIN
DECLARE stock_disponible INT;
    DECLARE mensaje VARCHAR(100);
    
    -- Get the available stock for the product
    SELECT stock INTO stock_disponible 
    FROM precios 
    WHERE id_producto = id_producto_param 
    AND deshabilitado = 0
    LIMIT 1;
    
    -- Check if the requested quantity exceeds the available stock
    IF cantidad_param > stock_disponible THEN
        -- Option 1: Throw an error and don't update
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La cantidad solicitada excede el stock disponible';
        
        -- Option 2 (alternative): Set the quantity to the maximum available stock
        -- SET cantidad_param = stock_disponible;
    ELSE
        -- Get the active cart ID for the user
        SET @id_carrito_viejo = (SELECT id_carrito 
                                FROM carrito
                                WHERE id_usuario = user_id AND estado = 'activo' 
                                LIMIT 1);
        
        -- Update the cart with the requested quantity
        UPDATE carrito_detalle 
        SET cantidad = cantidad_param 
        WHERE id_producto = id_producto_param 
        AND id_carrito = @id_carrito_viejo;
    END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure baja_stock_carrito
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `baja_stock_carrito`(
IN id_itencion_pago_uuid VARCHAR(60)
)
BEGIN
UPDATE precios p
JOIN (
    SELECT cd.id_producto, cd.cantidad, MIN(pre.precio_pesos) as min_precio
    FROM carrito_detalle cd
    JOIN carrito c ON cd.id_carrito = c.id_carrito
    JOIN precios pre ON cd.id_producto = pre.id_producto
    WHERE c.id_intencion_pago = id_itencion_pago_uuid
    GROUP BY cd.id_producto, cd.cantidad
) AS min_prices ON p.id_producto = min_prices.id_producto AND p.precio_pesos = min_prices.min_precio
SET p.stock = p.stock - min_prices.cantidad
WHERE p.stock >= min_prices.cantidad;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure borrar_producto_carrito
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `borrar_producto_carrito`(
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `cargarDDRMOTHERS`()
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `cargarDatosProducto`(
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
IN url_imagen varchar(150),
IN deposito varchar(45)


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
call schemamodex.cargar_precios(precio_dolar, precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,@id_proveedor,@id_producto,deposito);
Else

set @id_proveedor = (SELECT id_proveedor from proveedores WHERE nombre_proveedor = proveedor);
set @id_producto = (SELECT id_producto from productos p WHERE p.codigo_fabricante = codigo_fabricante);

IF NOT EXISTS (SELECT * FROM productos_proveedores pp WHERE pp.id_proveedor = @id_proveedor AND pp.id_producto = @id_producto)
	THEN
	call schemamodex.cargar_proveedores(proveedor, @id_producto);
	call schemamodex.cargar_categorias(categoria,sub_categoria, @id_producto);
    call schemamodex.cargar_precios(precio_dolar, precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,@id_proveedor,@id_producto,deposito);
	
 
	ELSE
 call schemamodex.actualizar_precio(precio_dolar, precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,@id_proveedor,@id_producto,deposito);

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
CREATE DEFINER=`root`@`localhost` PROCEDURE `cargar_carrito`(
IN id_usuario_param INT,
IN id_producto_param INT,
IN cantidad_param INT

)
BEGIN
 DECLARE stock_disponible INT;
    DECLARE es_usado TINYINT;
    DECLARE ha_comprado_usado TINYINT;
    DECLARE tiene_usado_en_carrito INT;
    
    -- Get the available stock for the product
    SELECT stock INTO stock_disponible 
    FROM precios 
    WHERE id_producto = id_producto_param 
    AND deshabilitado = 0
    LIMIT 1;
    
    -- Check if the requested product is used
    SELECT usado INTO es_usado 
    FROM productos 
    WHERE id_producto = id_producto_param;
    
    -- Check if the user has previously purchased a used product
    SELECT compro_usado INTO ha_comprado_usado 
    FROM usuarios 
    WHERE id_usuario = id_usuario_param;
    
    -- Check if the user already has a used product in their cart
    IF EXISTS (SELECT id_carrito 
              FROM carrito 
              WHERE id_usuario = id_usuario_param AND estado = 'activo') THEN
        
        SET @id_carrito_actual = (SELECT id_carrito 
                                 FROM carrito
                                 WHERE id_usuario = id_usuario_param AND estado = 'activo' 
                                 LIMIT 1);
        
        SELECT COUNT(*) INTO tiene_usado_en_carrito
        FROM carrito_detalle cd
        JOIN productos p ON cd.id_producto = p.id_producto
        WHERE cd.id_carrito = @id_carrito_actual
        AND p.usado = 1;
    ELSE
        SET tiene_usado_en_carrito = 0;
    END IF;
    
    -- Validate used product restrictions
    IF es_usado = 1 AND (tiene_usado_en_carrito > 1 OR ha_comprado_usado = 1) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede agregar más de un producto usado. Ya has comprado o tienes un producto usado en tu carrito.';
    -- Check if the requested quantity exceeds the available stock
    ELSEIF cantidad_param > stock_disponible THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La cantidad solicitada excede el stock disponible';
    ELSE
        -- Continue with cart processing
        IF NOT EXISTS (SELECT id_carrito 
                      FROM carrito 
                      WHERE id_usuario = id_usuario_param AND estado = 'activo' 
                      LIMIT 1)
        THEN
            -- Create a new cart if none exists
            INSERT INTO carrito (id_usuario, estado) VALUES (id_usuario_param, 'activo');
            SET @nuevo_id_carrito := last_insert_id();
            INSERT INTO carrito_detalle (id_carrito, id_producto, cantidad) 
            VALUES (@nuevo_id_carrito, id_producto_param, cantidad_param);
        ELSE
            -- Use existing cart
            SET @id_carrito_viejo = (SELECT id_carrito 
                                   FROM carrito
                                   WHERE id_usuario = id_usuario_param AND estado = 'activo' 
                                   LIMIT 1);
            
            -- Check if the product already exists in cart
            IF EXISTS (SELECT 1 FROM carrito_detalle 
                      WHERE id_carrito = @id_carrito_viejo 
                      AND id_producto = id_producto_param)
            THEN
                -- Get current quantity in cart
                SET @cantidad_actual = (SELECT cantidad FROM carrito_detalle
                                       WHERE id_carrito = @id_carrito_viejo
                                       AND id_producto = id_producto_param);
                
                -- Update quantity if product already in cart
                UPDATE carrito_detalle 
                SET cantidad = @cantidad_actual + cantidad_param
                WHERE id_carrito = @id_carrito_viejo
                AND id_producto = id_producto_param;
                
                -- Check if the updated quantity exceeds stock
                IF (@cantidad_actual + cantidad_param) > stock_disponible THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'La cantidad total en el carrito excede el stock disponible';
                END IF;
            ELSE
                -- Add new product to cart
                INSERT INTO carrito_detalle (id_carrito, id_producto, cantidad) 
                VALUES (@id_carrito_viejo, id_producto_param, cantidad_param);
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure cargar_categorias
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `cargar_categorias`(
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `cargar_imagen`(
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `cargar_precios`(
IN precio_dolar decimal(8,2),
IN precio_dolar_iva decimal(8,2),
IN iva decimal(4,2),
IN precio_pesos decimal(14,2),
IN precio_pesos_iva decimal(14,2),
IN stock INT,
IN id_proveedor INT,
IN id_producto INT,
IN deposito VARCHAR(45)
)
BEGIN
INSERT INTO precios (precio_dolar,precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,id_proveedor,id_producto,deposito) 
VALUES (precio_dolar, precio_dolar_iva, iva, precio_pesos, precio_pesos_iva,stock,id_proveedor,id_producto,deposito);

END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure cargar_proveedores
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `cargar_proveedores`(
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
-- procedure categoria_amd
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `categoria_amd`()
BEGIN
INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT pr.id_producto, 284
    FROM productos pr
    INNER JOIN productos_categorias pc ON pr.id_producto = pc.id_producto
    INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
    WHERE 
        c.nombre_categoria = 'PLACAS DE VIDEO'
        AND (
            pr.nombre LIKE '%RX%'

        )
        AND NOT EXISTS (
            SELECT 1 
            FROM productos_categorias pc2 
            WHERE pc2.id_producto = pr.id_producto 
            AND pc2.id_categoria = 284
        );
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure categoria_nvidia
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `categoria_nvidia`()
BEGIN
INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT pr.id_producto, 283
    FROM productos pr
    INNER JOIN productos_categorias pc ON pr.id_producto = pc.id_producto
    INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
    WHERE 
        c.nombre_categoria = 'PLACAS DE VIDEO'
        AND (
            pr.nombre LIKE '%RTX%'
            OR pr.nombre LIKE '%nvidia%'
            OR pr.nombre LIKE '%GT%'
        )
        AND NOT EXISTS (
            SELECT 1 
            FROM productos_categorias pc2 
            WHERE pc2.id_producto = pr.id_producto 
            AND pc2.id_categoria = 283
        );
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure categoria_procesador_amd
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `categoria_procesador_amd`()
BEGIN
INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT pr.id_producto, 285
    FROM productos pr
    INNER JOIN productos_categorias pc ON pr.id_producto = pc.id_producto
    INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
    WHERE 
        c.nombre_categoria = 'Procesadores'
        AND (
            pr.nombre LIKE '%amd%'

        )
        AND NOT EXISTS (
            SELECT 1 
            FROM productos_categorias pc2 
            WHERE pc2.id_producto = pr.id_producto 
            AND pc2.id_categoria = 285
        );
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure categoria_procesador_intel
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `categoria_procesador_intel`()
BEGIN
INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT pr.id_producto, 286
    FROM productos pr
    INNER JOIN productos_categorias pc ON pr.id_producto = pc.id_producto
    INNER JOIN categorias c ON pc.id_categoria = c.id_categoria
    WHERE 
        c.nombre_categoria = 'Procesadores'
        AND (
            pr.nombre LIKE '%intel%'

        )
        AND NOT EXISTS (
            SELECT 1 
            FROM productos_categorias pc2 
            WHERE pc2.id_producto = pr.id_producto 
            AND pc2.id_categoria = 286
        );
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure deshabilitar_air
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `deshabilitar_air`()
BEGIN
UPDATE precios p
SET p.deshabilitado = 1
WHERE p.id_proveedor = 5;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure determinar_categoria_armador
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `determinar_categoria_armador`(
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_armador`(

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

-- -----------------------------------------------------
-- procedure get_total_carrito
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_total_carrito`(
IN id_carrito_input INT
)
BEGIN
SELECT 
  SUM(
    CASE
      WHEN pro.nombre_proveedor = 'air' AND EXISTS (
        SELECT 1
        FROM productos_categorias pc2
        INNER JOIN categorias c2 ON pc2.id_categoria = c2.id_categoria
        WHERE pc2.id_producto = p.id_producto AND c2.nombre_categoria = 'procesadores'
      ) THEN p.precio_pesos_iva * 1.12 * cd.cantidad
      WHEN pro.nombre_proveedor = 'air' THEN p.precio_pesos_iva * 1.12 * cd.cantidad
      ELSE p.precio_pesos_iva * cd.cantidad
    END
  ) AS total_carrito  
FROM carrito_detalle cd
INNER JOIN precios p ON cd.id_producto = p.id_producto
INNER JOIN proveedores pro ON p.id_proveedor = pro.id_proveedor
WHERE cd.id_carrito = id_carrito_input;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure limpiar_notebooks
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `limpiar_notebooks`()
BEGIN
    -- Insertar relaciones para productos que tienen las categorías especificadas
    -- y que aún no tienen la categoría 272
    INSERT INTO productos_categorias (id_producto, id_categoria)
    SELECT DISTINCT pc.id_producto, 272
    FROM productos_categorias pc
    WHERE pc.id_categoria IN (151, 177, 188)
    AND NOT EXISTS (
        SELECT 1 
        FROM productos_categorias pc2 
        WHERE pc2.id_producto = pc.id_producto 
        AND pc2.id_categoria = 272
    );
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure salida_stock
-- -----------------------------------------------------

DELIMITER $$
USE `schemamodex`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `salida_stock`(
IN id_producto_a INT,
IN cantidad_a INT
)
BEGIN


SET @id_precio = (SELECT id_precio FROM precios WHERE precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = id_producto_a AND stock > 0 AND deshabilitado = 0
    ) AND id_producto = id_producto_a);
SET @stock_viejo = (SELECT stock FROM precios WHERE precio_dolar = (
        SELECT MIN(precio_dolar) 
        FROM precios 
        WHERE id_producto = id_producto_a AND stock > 0 AND deshabilitado = 0
    ) AND id_producto = id_producto_a);
    
UPDATE precios SET stock = @stock_viejo - cantidad_a  WHERE (id_precio = @id_precio);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- View `schemamodex`.`vista_mantenimientos_dni`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `schemamodex`.`vista_mantenimientos_dni`;
USE `schemamodex`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `schemamodex`.`vista_mantenimientos_dni` AS select `schemamodex`.`mantenimientos_pc`.`id_mantenimiento` AS `id_mantenimiento`,`schemamodex`.`mantenimientos_pc`.`id_usuario` AS `id_usuario`,`schemamodex`.`mantenimientos_pc`.`dni_propietario` AS `dni_propietario`,`schemamodex`.`mantenimientos_pc`.`nombre_producto` AS `nombre_producto`,`schemamodex`.`mantenimientos_pc`.`responsable_de_retiro` AS `responsable_de_retiro`,`schemamodex`.`mantenimientos_pc`.`telefono` AS `telefono`,`schemamodex`.`mantenimientos_pc`.`direccion_propietario` AS `direccion_propietario`,`schemamodex`.`mantenimientos_pc`.`mail` AS `mail`,`schemamodex`.`mantenimientos_pc`.`empleado_asignado` AS `empleado_asignado`,`schemamodex`.`mantenimientos_pc`.`descripcion_producto` AS `descripcion_producto`,`schemamodex`.`mantenimientos_pc`.`observaciones` AS `observaciones`,`schemamodex`.`mantenimientos_pc`.`fecha_inicio` AS `fecha_inicio`,`schemamodex`.`mantenimientos_pc`.`estado` AS `estado`,`schemamodex`.`mantenimientos_pc`.`numero_ficha` AS `numero_ficha`,`schemamodex`.`mantenimientos_pc`.`detalles` AS `detalles` from `schemamodex`.`mantenimientos_pc` union all select `schemamodex`.`mantenimientos_notebook`.`id_mantenimiento` AS `id_mantenimiento`,`schemamodex`.`mantenimientos_notebook`.`id_usuario` AS `id_usuario`,`schemamodex`.`mantenimientos_notebook`.`dni_propietario` AS `dni_propietario`,`schemamodex`.`mantenimientos_notebook`.`nombre_producto` AS `nombre_producto`,`schemamodex`.`mantenimientos_notebook`.`responsable_de_retiro` AS `responsable_de_retiro`,`schemamodex`.`mantenimientos_notebook`.`telefono` AS `telefono`,`schemamodex`.`mantenimientos_notebook`.`direccion_propietario` AS `direccion_propietario`,`schemamodex`.`mantenimientos_notebook`.`mail` AS `mail`,`schemamodex`.`mantenimientos_notebook`.`empleado_asignado` AS `empleado_asignado`,`schemamodex`.`mantenimientos_notebook`.`descripcion_producto` AS `descripcion_producto`,`schemamodex`.`mantenimientos_notebook`.`observaciones` AS `observaciones`,`schemamodex`.`mantenimientos_notebook`.`fecha_inicio` AS `fecha_inicio`,`schemamodex`.`mantenimientos_notebook`.`estado` AS `estado`,`schemamodex`.`mantenimientos_notebook`.`numero_ficha` AS `numero_ficha`,`schemamodex`.`mantenimientos_notebook`.`detalles` AS `detalles` from `schemamodex`.`mantenimientos_notebook` union all select `schemamodex`.`mantenimientos_celular`.`id_mantenimiento` AS `id_mantenimiento`,`schemamodex`.`mantenimientos_celular`.`id_usuario` AS `id_usuario`,`schemamodex`.`mantenimientos_celular`.`dni_propietario` AS `dni_propietario`,`schemamodex`.`mantenimientos_celular`.`nombre_producto` AS `nombre_producto`,`schemamodex`.`mantenimientos_celular`.`responsable_de_retiro` AS `responsable_de_retiro`,`schemamodex`.`mantenimientos_celular`.`telefono` AS `telefono`,`schemamodex`.`mantenimientos_celular`.`direccion_propietario` AS `direccion_propietario`,`schemamodex`.`mantenimientos_celular`.`mail` AS `mail`,`schemamodex`.`mantenimientos_celular`.`empleado_asignado` AS `empleado_asignado`,`schemamodex`.`mantenimientos_celular`.`descripcion_producto` AS `descripcion_producto`,`schemamodex`.`mantenimientos_celular`.`observaciones` AS `observaciones`,`schemamodex`.`mantenimientos_celular`.`fecha_inicio` AS `fecha_inicio`,`schemamodex`.`mantenimientos_celular`.`estado` AS `estado`,`schemamodex`.`mantenimientos_celular`.`numero_ficha` AS `numero_ficha`,`schemamodex`.`mantenimientos_celular`.`detalles` AS `detalles` from `schemamodex`.`mantenimientos_celular` union all select `schemamodex`.`mantenimientos_general`.`id_mantenimiento` AS `id_mantenimiento`,`schemamodex`.`mantenimientos_general`.`id_usuario` AS `id_usuario`,`schemamodex`.`mantenimientos_general`.`dni_propietario` AS `dni_propietario`,`schemamodex`.`mantenimientos_general`.`nombre_producto` AS `nombre_producto`,`schemamodex`.`mantenimientos_general`.`responsable_de_retiro` AS `responsable_de_retiro`,`schemamodex`.`mantenimientos_general`.`telefono` AS `telefono`,`schemamodex`.`mantenimientos_general`.`direccion_propietario` AS `direccion_propietario`,`schemamodex`.`mantenimientos_general`.`mail` AS `mail`,`schemamodex`.`mantenimientos_general`.`empleado_asignado` AS `empleado_asignado`,`schemamodex`.`mantenimientos_general`.`descripcion_producto` AS `descripcion_producto`,`schemamodex`.`mantenimientos_general`.`observaciones` AS `observaciones`,`schemamodex`.`mantenimientos_general`.`fecha_inicio` AS `fecha_inicio`,`schemamodex`.`mantenimientos_general`.`estado` AS `estado`,`schemamodex`.`mantenimientos_general`.`numero_ficha` AS `numero_ficha`,`schemamodex`.`mantenimientos_general`.`detalles` AS `detalles` from `schemamodex`.`mantenimientos_general`;

-- -----------------------------------------------------
-- View `schemamodex`.`vista_mantenimientos_usuario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `schemamodex`.`vista_mantenimientos_usuario`;
USE `schemamodex`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `schemamodex`.`vista_mantenimientos_usuario` AS select 'PC' AS `tipo`,`schemamodex`.`mantenimientos_pc`.`id_mantenimiento` AS `id_mantenimiento`,`schemamodex`.`mantenimientos_pc`.`id_usuario` AS `id_usuario`,`schemamodex`.`mantenimientos_pc`.`dni_propietario` AS `dni_propietario`,`schemamodex`.`mantenimientos_pc`.`nombre_producto` AS `nombre_producto`,`schemamodex`.`mantenimientos_pc`.`responsable_de_retiro` AS `responsable_de_retiro`,`schemamodex`.`mantenimientos_pc`.`telefono` AS `telefono`,`schemamodex`.`mantenimientos_pc`.`direccion_propietario` AS `direccion_propietario`,`schemamodex`.`mantenimientos_pc`.`mail` AS `mail`,`schemamodex`.`mantenimientos_pc`.`empleado_asignado` AS `empleado_asignado`,`schemamodex`.`mantenimientos_pc`.`descripcion_producto` AS `descripcion_producto`,`schemamodex`.`mantenimientos_pc`.`observaciones` AS `observaciones`,`schemamodex`.`mantenimientos_pc`.`fecha_inicio` AS `fecha_inicio`,`schemamodex`.`mantenimientos_pc`.`estado` AS `estado`,`schemamodex`.`mantenimientos_pc`.`detalles` AS `detalles` from `schemamodex`.`mantenimientos_pc` union all select 'Notebook' AS `tipo`,`schemamodex`.`mantenimientos_notebook`.`id_mantenimiento` AS `id_mantenimiento`,`schemamodex`.`mantenimientos_notebook`.`id_usuario` AS `id_usuario`,`schemamodex`.`mantenimientos_notebook`.`dni_propietario` AS `dni_propietario`,`schemamodex`.`mantenimientos_notebook`.`nombre_producto` AS `nombre_producto`,`schemamodex`.`mantenimientos_notebook`.`responsable_de_retiro` AS `responsable_de_retiro`,`schemamodex`.`mantenimientos_notebook`.`telefono` AS `telefono`,`schemamodex`.`mantenimientos_notebook`.`direccion_propietario` AS `direccion_propietario`,`schemamodex`.`mantenimientos_notebook`.`mail` AS `mail`,`schemamodex`.`mantenimientos_notebook`.`empleado_asignado` AS `empleado_asignado`,`schemamodex`.`mantenimientos_notebook`.`descripcion_producto` AS `descripcion_producto`,`schemamodex`.`mantenimientos_notebook`.`observaciones` AS `observaciones`,`schemamodex`.`mantenimientos_notebook`.`fecha_inicio` AS `fecha_inicio`,`schemamodex`.`mantenimientos_notebook`.`estado` AS `estado`,`schemamodex`.`mantenimientos_notebook`.`detalles` AS `detalles` from `schemamodex`.`mantenimientos_notebook` union all select 'Celular' AS `tipo`,`schemamodex`.`mantenimientos_celular`.`id_mantenimiento` AS `id_mantenimiento`,`schemamodex`.`mantenimientos_celular`.`id_usuario` AS `id_usuario`,`schemamodex`.`mantenimientos_celular`.`dni_propietario` AS `dni_propietario`,`schemamodex`.`mantenimientos_celular`.`nombre_producto` AS `nombre_producto`,`schemamodex`.`mantenimientos_celular`.`responsable_de_retiro` AS `responsable_de_retiro`,`schemamodex`.`mantenimientos_celular`.`telefono` AS `telefono`,`schemamodex`.`mantenimientos_celular`.`direccion_propietario` AS `direccion_propietario`,`schemamodex`.`mantenimientos_celular`.`mail` AS `mail`,`schemamodex`.`mantenimientos_celular`.`empleado_asignado` AS `empleado_asignado`,`schemamodex`.`mantenimientos_celular`.`descripcion_producto` AS `descripcion_producto`,`schemamodex`.`mantenimientos_celular`.`observaciones` AS `observaciones`,`schemamodex`.`mantenimientos_celular`.`fecha_inicio` AS `fecha_inicio`,`schemamodex`.`mantenimientos_celular`.`estado` AS `estado`,`schemamodex`.`mantenimientos_celular`.`detalles` AS `detalles` from `schemamodex`.`mantenimientos_celular` union all select 'General' AS `tipo`,`schemamodex`.`mantenimientos_general`.`id_mantenimiento` AS `id_mantenimiento`,`schemamodex`.`mantenimientos_general`.`id_usuario` AS `id_usuario`,`schemamodex`.`mantenimientos_general`.`dni_propietario` AS `dni_propietario`,`schemamodex`.`mantenimientos_general`.`nombre_producto` AS `nombre_producto`,`schemamodex`.`mantenimientos_general`.`responsable_de_retiro` AS `responsable_de_retiro`,`schemamodex`.`mantenimientos_general`.`telefono` AS `telefono`,`schemamodex`.`mantenimientos_general`.`direccion_propietario` AS `direccion_propietario`,`schemamodex`.`mantenimientos_general`.`mail` AS `mail`,`schemamodex`.`mantenimientos_general`.`empleado_asignado` AS `empleado_asignado`,`schemamodex`.`mantenimientos_general`.`descripcion_producto` AS `descripcion_producto`,`schemamodex`.`mantenimientos_general`.`observaciones` AS `observaciones`,`schemamodex`.`mantenimientos_general`.`fecha_inicio` AS `fecha_inicio`,`schemamodex`.`mantenimientos_general`.`estado` AS `estado`,`schemamodex`.`mantenimientos_general`.`detalles` AS `detalles` from `schemamodex`.`mantenimientos_general`;
