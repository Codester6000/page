import { z } from "zod";

export const formCheckoutSchema = z.object({
    nombre: z
      .string()
      .min(1, {
        message: "El nombre debe tener al menos 1 caracter",
      })
      .max(25, {
        message: "El nombre no debe tener mas de 25 caracteres",
      }),
    apellido: z
    .string()
    .min(1,{
        message: "El appellido debe tener al menos 1 caracter"
    })
    .max(25,{
        message:"El appelido no debe tener mas de 25 caracteres"
    })
    ,
    direccion: z
    .string()
    .min(1, {
        message: "La direccion debe tener al menos 1 caracter",
      })
    ,
    telefono: z
    .string()
    .min(10,{
        message:'El telefonono debe tener al menos 10 digitos'
    })
    .max(17,{
        message:"El telefono es demasiado largo"
    })
    ,
    email: z.string().email({message:"El email no es valido"}),

    
  });
  