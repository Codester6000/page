import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../thankyou.css'
import svgTY from '../assets/ty_icon.svg'

const ThankYou = () => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/');
    };

    return (
        <div className='thankContainer'>
            <img src={svgTY} alt="" />
            <h1><span>GRACIAS</span> <br /> POR TU COMPRA</h1>
            <button onClick={handleButtonClick} className='botonTY'>Seguir comprando</button>
        </div>
    );
};

export default ThankYou;