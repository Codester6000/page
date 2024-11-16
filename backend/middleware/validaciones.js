import { query} from "express-validator"

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