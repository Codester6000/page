import { query} from "express-validator"

export const validarQuerysProducto = () => [
    query("categoria").isAlpha().notEmpty().withMessage("La categoría debe ser alfabética.").optional(),
    query("precio_gt").isFloat({min:0}).optional(),
    query("precio_lt").isFloat({min:0}).optional(),
    query("nombre").isAlpha().notEmpty().optional(),
    ];

export const validaciones = {
    validarQuerysProducto

}