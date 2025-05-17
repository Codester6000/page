import { useState } from "react";
import { useAuth } from "../Auth";
const FormularioArchivo = () => {
    const { sesion } = useAuth();
    const [imagenTransferencia, setImagenTransferencia] = useState();
    const url = import.meta.env.VITE_URL_BACK;
    const  handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("imagenTransferencia",imagenTransferencia)

        try {
            const response = await fetch(`${url}/transferencias/single`,{
                method:"POST",
                headers:{Authorization: `Bearer ${sesion.token}`},
                body:formData,
                
            })

            if(response.ok){
                console.log(response)
            }else{
                console.log(response.status)
            }
        } catch (error) {
            console.error(error)
        }

    }
    return (
        <>
        <form onSubmit={handleSubmit} encType="multipart/form-data" method="post">
        <input type="file" name="imagenTransferencia" onChange={(e)=> setImagenTransferencia(e.target.files[0])} />
        <button>Enviar</button>
        </form>
        </>
    )
}

export default FormularioArchivo