import { query,body} from "express-validator"

export const validarQuerysProducto = () => [
    query("categoria").isAlphanumeric().notEmpty().withMessage("La categoría debe ser alfabética.").optional(),
    query("precio_gt").isFloat({min:0}).optional(),
    query("precio_lt").isFloat({min:0}).optional(),
    query("nombre").isAlpha().notEmpty().optional(),
    ];



const chipsets = ["am4","am5"]
export const validarQueryArmador = () => [
    query("procesador").isAlphanumeric().notEmpty().optional(),
    query("motherboard").isAlphanumeric().notEmpty().optional(),
]

export const validarBodyProducto = () => [
    body("nombre").isString().notEmpty().withMessage("El nombre es obligatorio"),
    body("stock").isInt({ min: 0 }).withMessage("El stock debe ser un entero mayor o igual a 0"),
    body("garantia_meses").isInt({ min: 0 }).withMessage("La garantía debe ser un entero mayor o igual a 0"),
    body("detalle").isString().optional(),
    body("largo").isDecimal({ decimal_digits: "0,2" }).withMessage("El largo debe ser un decimal con hasta 2 dígitos decimales"),
    body("alto").isDecimal({ decimal_digits: "0,2" }).withMessage("El alto debe ser un decimal con hasta 2 dígitos decimales"),
    body("ancho").isDecimal({ decimal_digits: "0,2" }).withMessage("El ancho debe ser un decimal con hasta 2 dígitos decimales"),
    body("peso").isDecimal({ decimal_digits: "0,2" }).withMessage("El peso debe ser un decimal con hasta 2 dígitos decimales"),
    body("codigo_fabricante").isString().notEmpty().withMessage("El código del fabricante es obligatorio"),
    body("marca").isString().notEmpty().withMessage("La marca es obligatoria"),
    body("categoria").isString().notEmpty().withMessage("La categoría es obligatoria"),
    body("sub_categoria").isString().notEmpty().withMessage("La subcategoría es obligatoria"),
    body("proveedor").isString().notEmpty().withMessage("El proveedor es obligatorio"),
    body("precio_dolar").isDecimal({ decimal_digits: "0,2" }).withMessage("El precio en dólares debe ser un decimal con hasta 2 dígitos decimales"),
    body("precio_dolar_iva").isDecimal({ decimal_digits: "0,2" }).withMessage("El precio en dólares con IVA debe ser un decimal con hasta 2 dígitos decimales"),
    body("iva").isDecimal({ decimal_digits: "0,2" }).withMessage("El IVA debe ser un decimal con hasta 2 dígitos decimales"),
    body("precio_pesos").isDecimal({ decimal_digits: "0,2" }).withMessage("El precio en pesos debe ser un decimal con hasta 2 dígitos decimales"),
    body("precio_pesos_iva").isDecimal({ decimal_digits: "0,2" }).withMessage("El precio en pesos con IVA debe ser un decimal con hasta 2 dígitos decimales"),
    body("url_imagen").isURL().withMessage("La URL de la imagen debe ser válida"),
]