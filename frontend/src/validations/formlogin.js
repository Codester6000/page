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