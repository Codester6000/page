import React, {useState} from "react";
import '../Login.css'
import icono_usuario from '/iconos/person.png'
import icono_contraseña from '/iconos/password.png'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formLoginSchema } from '../validations/formlogin'
import {useLocation, useNavigate} from "react-router-dom"
import { useAuth } from "../Auth";
import { Link } from "react-router-dom";

const Login = () =>{
    const url = import.meta.env.VITE_URL_BACK;
    const {register,handleSubmit,resetField,formState:{errors}} = useForm({
        resolver:zodResolver(formLoginSchema)
    })
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";
    const [error,setError] = useState('');
    const onSubmit = async (datos) => {
        const response = await fetch(`${url}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });
        const mensaje = await response.json()
        if (response.ok) {
            resetField('username')
            resetField('password')
        
        }
        login(
            datos.username,
            datos.password,
            () =>navigate(from,{replace:true}),
            () =>setError('Contraseña o usuario incorrecto.')
        )
    };
    return (
        <div className="loginContainer">
            <form  onSubmit={handleSubmit(onSubmit)} className="loginForm">
            <div className="headerForm">
                <div className="texto">Iniciar sesión en MODEX</div>
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

            </div>

            <div className="submit-contenedor">
                <button type="submit" className="submit">Iniciar sesión</button>
            </div>
                {(error != '') && <p style={{color:"red"}}>{error}</p>}
            <p>No tienes una cuenta? Haz clic <Link to="/register">Aquí!</Link></p>
            </form>
            
        </div>
    )
}
export default Login;