import { AppBar, Button, Drawer, IconButton, colors } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import CustomizedInputBase from "./CustomizedInputBase";
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState } from "react";
import MenuNavbar from "./MenuNavbar";
import { AuthStatus } from "../Auth";
import { useNavigate } from "react-router-dom";



export default function Navbar() {

    const navigate = useNavigate();
    const [abierto , setAbierto] = useState(false)

    return (
        <>
            <AppBar position="static" style={{ background: "#FF7d21"}}>
                <Toolbar className="navBar" >
                    <IconButton onClick={()=> setAbierto(true)} sx={{ml: 1,height: "55px", width: "55px" , padding: "5px", objectFit: "cover", color: "white"}}
                    ><MenuIcon></MenuIcon></IconButton>
                    <Drawer open={abierto} anchor="left" onClose={()=> setAbierto(false)} sx={{
    '& .MuiDrawer-paper': {
      backgroundColor: '#E66C1D',
    },
  }}><MenuNavbar></MenuNavbar> </Drawer>
                    {/* <Button>
                        <MenuIcon size="large" edge="start" color="orange" aria-label="menu" sx={{ mr: 2 }} ></MenuIcon>
                    </Button> */}
                        <img src="modex.png" alt="logo modex" onClick={()=> navigate("/")} style={{ width: "150px", height: "auto", padding: "15px", paddingRight: "10px" , filter: "brightness(0) invert(1)",}} />
                    <CustomizedInputBase ></CustomizedInputBase>
                    <AuthStatus />
                    <IconButton variant="contained" onClick={()=> navigate("/favorito")} sx={{ml: 2, backgroundColor: "#a111ad", borderRadius: 20, height: "45px", width: "45px" , padding: "5px", objectFit: "cover", color: "white"}}><FavoriteIcon color="inherit"/></IconButton>
                    <IconButton variant="contained" onClick={()=> navigate("/carrito")} sx={{ml: 2, backgroundColor: "#a111ad", borderRadius: 50, height: "45px", width: "45px" , padding: "5px", objectFit: "cover", color: "white"}}><ShoppingCartIcon color="inherit"/></IconButton>
                    {/* <Button> <img src="./public/fav.png" alt="" style={{ width: "50px", height: "auto", padding: "15px", filter: "brightness(0) invert(1)" }} /></Button>
                    <Button variant="contained" sx={{ml: 2, backgroundColor: "#a111ad", borderRadius: 50, height: "60px" , padding: "5px", objectFit: "cover" }}><ShoppingCartIcon sx={{ fontSize: 20 }} /></Button>
                    <Button> <img src="./public/carrito.png" alt="" style={{ width: "50px", height: "auto", padding: "15px", filter: "brightness(0) invert(1)" }} /></Button> */}
                </Toolbar>
                <div className="navLinksPc">
                    <div className="linkPc"><a href="/">INICIO</a></div>
                    <div className="linkPc"><a href="/productos">PRODUCTOS</a></div>
                    <div className="linkPc"><a href="/armador">ARMA TU PC</a></div>
                    <div className="linkPc"><a href="/desarrollo">DESARROLLO</a></div>
                    <div className="linkPc"></div>
                </div>
            </AppBar>

        </>

    )

}