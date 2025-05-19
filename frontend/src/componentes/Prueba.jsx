import { useState } from "react";
import { useAuth } from "../Auth";
import { useNavigate } from "react-router-dom";
import "../styles/FormularioArchivo.css";

// Acepta isModalOpen y setIsModalOpen como props
const FormularioArchivo = ({ isModalOpen, setIsModalOpen }) => {

    const { sesion } = useAuth();
    const [imagenTransferencia, setImagenTransferencia] = useState();
    const url = import.meta.env.VITE_URL_BACK;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("imagenTransferencia", imagenTransferencia);

        try {
            const response = await fetch(`${url}/transferencias/single`, {
                method: "POST",
                headers: { Authorization: `Bearer ${sesion.token}` },
                body: formData,
            });

            if (response.ok) {
                console.log(response);
                // Cierra el modal cuando se envía con éxito
                afterSubmit()
            } else {
                console.log(response.status);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const navigate = useNavigate();
    const afterSubmit = () => {
        setIsModalOpen(false);
        navigate('/thank-you');
    };
    return (
        <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
            <div className="modal-container">
                <div className="modal-header">
                    <h3 className="modal-title">Comprobante de Transferencia</h3>
                    <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} encType="multipart/form-data" method="post" className="formularioTransferencia">
                    <input type="file" name="imagenTransferencia" onChange={(e) => setImagenTransferencia(e.target.files[0])} />
                    <button>Enviar</button>
                </form>
            </div>
        </div>
    );
};

export default FormularioArchivo;