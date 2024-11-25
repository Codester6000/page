import { z } from "zod";

export const formLoginSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "El usuario debe tener al menos 1 caracter",
    })
    .max(25, {
      message: "El usuario no debe tener mas de 25 caracteres",
    }),
  password: z.string().min(1,{
    message: "La contraseña no debe estar vacia",
  }),
  
});
export const formRegisterSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "El usuario debe tener al menos 1 caracter",
    })
    .max(25, {
      message: "El usuario no debe tener mas de 25 caracteres",
    }),
  password: z.string().min(1,{
    message: "La contraseña no debe estar vacia",
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
  }),
  email: z.string().email({message:"El email no es valido"}),
  fechaNacimiento: z.string().refine(
    (value) => !isNaN(Date.parse(value)),
    {
      message: "Ingrese una fecha con el formato YYYY-MM-DD",
    }
  ),
  
});
