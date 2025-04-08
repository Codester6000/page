import React, { useState } from "react";
import '../Login.css'
import icono_usuario from '/iconos/person.png'
import icono_contraseña from '/iconos/password.png'
import icono_email from '/iconos/email.png'
import icono_fechaNacimiento from '/iconos/fechaNacimiento.png'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formRegisterSchema } from '../validations/formlogin'
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Register = () =>{
    const url = import.meta.env.VITE_URL_BACK;
    const navigate = useNavigate();
    const [errores,setErrores] = useState("")
    const {register,handleSubmit,resetField,formState:{errors}} = useForm({
        resolver:zodResolver(formRegisterSchema)
    })

    const onSubmit = async (datos) => {
        console.log(datos)
        const response = await fetch(`${url}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });
        if (response.ok) {
            const mensaje = await response.json()
            resetField('username')
            resetField('password')
            resetField('email')
            resetField('fechaNacimiento')
            setErrores("Cuenta Creada con exito")
            navigate('/login')
            console.log(mensaje)
        
        }else{
            setErrores("Ese usuario o email ya esta en uso")
        }
    };
    return (
        <div className="registerContainer">
            <form  onSubmit={handleSubmit(onSubmit)} className="registerForm">
            <div className="headerForm">
                <div className="texto">Crear cuenta en MODEX</div>
            </div>

            <div className="inputs">
                <div className="input" >
                    <img src={icono_usuario} alt="" />
                    <input type="text" placeholder='Usuario' name='usuario' {...register("username")}  />
                </div>
                    { errors.username?.message && <p style={{color:"red"}}>{errors.username.message}</p>}

                <div className="input">
                    <img src={icono_contraseña} alt="" />
                    <input type="password" placeholder='Contraseña' name='contraseña' {...register("password")} />
                </div>
                    { errors.password?.message && <p style={{color:"red"}}>{errors.password.message}</p>}


                <div className="input">
                    <img src={icono_email} alt="" />
                    <input type="email" placeholder='email' name='email' {...register("email")} />
                </div>
                    { errors.email?.message && <p style={{color:"red"}}>{errors.email.message}</p>}
                <div className="input">
                    <img src={icono_fechaNacimiento} alt="" />
                    <input type="date" name='fechaNacimiento' onChange={(e)=>console.log(e.target.value)} placeholder="YYYY-MM-DD" {...register("fechaNacimiento")} />
                </div>
                    { errors.fechaNacimiento?.message && <p style={{color:"red"}}>{errors.fechaNacimiento.message}</p>}

            </div>
            {errores && <p style={{color:"red"}}>{errores}</p>}
            <div className="submit-contenedor">
                <button type="submit" className="submit">Registrarse</button>
            </div>
            <p>Ya tenes una cuenta? Haz clic <Link to="/login">Aquí!</Link></p>
            </form> 
            
        </div>
    )
}
export default Register;