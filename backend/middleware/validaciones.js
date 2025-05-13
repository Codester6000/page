import { query,body,param,validationResult} from "express-validator"

export const validarQuerysProducto = () => [
    query("categoria").isString().notEmpty().withMessage("La categoría debe ser alfabética.").optional(),
    query("precio_gt").isFloat({min:0}).optional().withMessage("precrio_gt no puede ser negativo"),
    query("precio_lt").isFloat({min:0}).optional().withMessage("precrio_lt no puede ser negativo"),
    query("nombre").isString().notEmpty().optional(),
    query("offset").isInt({min:0}).withMessage("offset es obligatorio y no puede ser negativo"),
    query("limit").isInt({min:1,max:100}).withMessage("limit es obligatorio y tiene que estar entre 1-100"),
    query("usado").isBoolean().withMessage("Usado tiene que ser un valor booleano.").optional(),
    ];



const chipsets = ["am4","am5"]
export const validarQueryArmador = () => [
    query("procesador").isAlphanumeric().notEmpty().optional(),
    query("motherboard").isAlphanumeric().notEmpty().optional(),
    query("memoria").isAlphanumeric().notEmpty().optional(),
    query("gabinete").isAlphanumeric().notEmpty().optional(),
    query("almacenamiento").isAlphanumeric().notEmpty().optional(),
    query("motherboard").isAlphanumeric().notEmpty().optional(),
    query("order").isAlphanumeric().notEmpty(),
    query("consumoW").isInt({min:0}).optional(),
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

export const validarBodyRegister = () => [
    body("username").isAlphanumeric().notEmpty().isLength({max:25}).withMessage("usuario muy largo"),
    body("password").isStrongPassword({
    minLength:8,
    minNumbers:1,
    minUppercase:1,
    minLowercase:1,
    minSymbols:0
}).withMessage("La contraseña debe contener 8 caracteres, 1 mayuscula , 1 minuscula, y 1 numero"),
    body("fechaNacimiento").isISO8601().withMessage("Fecha invalida")
]

export const validarBodyLogin = () => [
    body("username").isAlphanumeric().notEmpty().isLength({max:25}).withMessage("usuario muy largo"),
    body("password").isStrongPassword({
    minLength:8,
    minNumbers:1,
    minUppercase:1,
    minLowercase:1,
    minSymbols:0
}).withMessage("La contraseña debe contener 8 caracteres, 1 mayuscula , 1 minuscula, y 1 numero"),
]

export const validarBodyCarrito = () => [
    body("id_producto").isAlphanumeric().notEmpty().isLength({min:1}).withMessage("Ingrese un id producto valido"),
    body("cantidad").isInt({min:1}).notEmpty().withMessage("Pasar un numero entero")
]
export const validarBodyPutCarrito = () => [
    body("id_producto").isAlphanumeric().notEmpty().isLength({min:1}).withMessage("Ingrese un id producto valido"),
    body("cantidad").isInt({min:1}).notEmpty().withMessage("Pasar un numero entero")
]
export const validarId = param("id").isInt({min:1})

export const validarBodyCheckout = () => [
    body('price').isFloat({min:0}).withMessage('Hay un error en el precio'),
    body('productName').isString().notEmpty().isLength({min:1}).withMessage('Hay un error en el productName'),
    body('id_carrito').isInt({ min: 0 }).withMessage("El id debe ser entero positivo"),
    body("total").isDecimal({min:0}).withMessage("el total debe ser decimal y positivo")

]

export const validarBodyInfoUsuario = () =>[
    body("nombre").isString().notEmpty().isLength({max:25}).withMessage("El nombre es obligatorio"),
    body("apellido").isString().notEmpty().isLength({max:25}).withMessage("El apellido es obligatorio"),
    body("direccion").isString().notEmpty().withMessage("La dirección es obligatoria"),
    body("telefono").isString().notEmpty().withMessage("El teléfono es obligatorio")
]
export const verificarValidaciones = (req, res, next) => {
    // Enviar errores de validacion en caso de ocurrir alguno.
    const validacion = validationResult(req);
    if (!validacion.isEmpty()) {
        return res.status(400).send({ errores: validacion.array() });
    }
    next();
  };
