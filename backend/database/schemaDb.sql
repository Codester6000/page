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
CREATE SCHEMA IF NOT EXISTS `schemamodex` ;
USE `schemamodex` ;

-- -----------------------------------------------------
-- Table `schemamodex`.`tabla_elit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`tabla_elit` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_elit` VARCHAR(45) NULL DEFAULT NULL,
  `codigo_alfa` VARCHAR(100) NULL DEFAULT NULL,
  `codigo_producto` VARCHAR(100) NULL DEFAULT NULL,
  `nombre` VARCHAR(100) NULL DEFAULT NULL,
  `marca` VARCHAR(45) NULL DEFAULT NULL,
  `categoria` VARCHAR(45) NULL DEFAULT NULL,
  `sub_categoria` VARCHAR(45) NULL DEFAULT NULL,
  `precio_usd` FLOAT NULL DEFAULT NULL,
  `iva` FLOAT NULL DEFAULT NULL,
  `precio_usd_iva` FLOAT NULL DEFAULT NULL,
  `garantia_meses` INT(11) NULL DEFAULT NULL,
  `link` VARCHAR(100) NULL DEFAULT NULL,
  `uri` VARCHAR(100) NULL DEFAULT NULL,
  `imagenes` VARCHAR(100) NULL DEFAULT NULL,
  `dimensiones` VARCHAR(100) NULL DEFAULT NULL,
  `gamer` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uri_UNIQUE` (`uri` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 695
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `schemamodex`.`categorias`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`categorias` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre_categoria` VARCHAR(45) NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE INDEX `id_categoria_UNIQUE` (`id_categoria` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `schemamodex`.`productos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`productos` (
  `id_producto` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NULL,
  `stock` INT NOT NULL,
  `garantia_meses` INT NOT NULL,
  `detalle` LONGTEXT CHARACTER SET 'ascii' NOT NULL,
  `largo` DECIMAL(6,2) NOT NULL,
  `alto` DECIMAL(6,2) NOT NULL,
  `ancho` DECIMAL(6,2) NOT NULL,
  `peso` VARCHAR(45) NOT NULL,
  `codigo_fabricante` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_producto`),
  UNIQUE INDEX `id_productos_UNIQUE` (`id_producto` ASC) VISIBLE,
  UNIQUE INDEX `codigo_fabricante_UNIQUE` (`codigo_fabricante` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `schemamodex`.`productos_categorias`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`productos_categorias` (
  `id_productos_categorias` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `id_categoria` INT NOT NULL,
  PRIMARY KEY (`id_productos_categorias`),
  INDEX `fk_productos_categorias_productos1_idx` (`id_producto` ASC) VISIBLE,
  INDEX `fk_productos_categorias_categorias1_idx` (`id_categoria` ASC) VISIBLE,
  CONSTRAINT `fk_productos_categorias_productos1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `schemamodex`.`productos` (`id_producto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_productos_categorias_categorias1`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `schemamodex`.`categorias` (`id_categoria`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `schemamodex`.`proveedores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`proveedores` (
  `id_proveedor` INT NOT NULL,
  `nombre_proveedor` VARCHAR(45) NULL,
  PRIMARY KEY (`id_proveedor`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `schemamodex`.`productos_proveedores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`productos_proveedores` (
  `id_productos_proveedores` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `id_proveedor` INT NOT NULL,
  PRIMARY KEY (`id_productos_proveedores`),
  INDEX `fk_productos_proveedores_proveedores_idx` (`id_proveedor` ASC) VISIBLE,
  INDEX `fk_productos_proveedores_productos1_idx` (`id_producto` ASC) VISIBLE,
  CONSTRAINT `fk_productos_proveedores_proveedores`
    FOREIGN KEY (`id_proveedor`)
    REFERENCES `schemamodex`.`proveedores` (`id_proveedor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_productos_proveedores_productos1`
    FOREIGN KEY (`id_producto`)
    REFERENCES `schemamodex`.`productos` (`id_producto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `schemamodex`.`precios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `schemamodex`.`precios` (
  `id_precio` INT NOT NULL AUTO_INCREMENT,
  `precio_dolar` DECIMAL(8,2) NOT NULL,
  `precio_dolar_iva` DECIMAL(8,2) NOT NULL,
  `iva` DECIMAL(4,2) NOT NULL,
  `cotizacion_dolar` DECIMAL(14,2) NOT NULL,
  `precio_pesos` DECIMAL(14,2) NOT NULL,
  `precio_pesos_iva` DECIMAL(14,2) NOT NULL,
  `id_proveedor` INT NOT NULL,
  PRIMARY KEY (`id_precio`),
  UNIQUE INDEX `id_precio_UNIQUE` (`id_precio` ASC) VISIBLE,
  INDEX `fk_precios_proveedores1_idx` (`id_proveedor` ASC) VISIBLE,
  CONSTRAINT `fk_precios_proveedores1`
    FOREIGN KEY (`id_proveedor`)
    REFERENCES `schemamodex`.`proveedores` (`id_proveedor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
