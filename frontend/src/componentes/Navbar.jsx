import {
  AppBar,
  Button,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import CustomizedInputBase from "./CustomizedInputBase";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useState } from "react";
import "../styles/navBar.css";
import MenuNavbar from "./MenuNavbar";
import { AuthStatus, useAuth } from "../Auth.jsx";

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [anchorElProductos, setAnchorElProductos] = useState(null);
  const [anchorElMantenimientos, setAnchorElMantenimientos] = useState(null);

  const openProductos = Boolean(anchorElProductos);
  const openMantenimientos = Boolean(anchorElMantenimientos);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { sesion } = useAuth();

  const handleClickProductos = (event) => setAnchorElProductos(event.currentTarget);
  const handleClickMantenimientos = (event) => setAnchorElMantenimientos(event.currentTarget);
  const handleCloseProductos = () => setAnchorElProductos(null);
  const handleCloseMantenimientos = () => setAnchorElMantenimientos(null);

  return (
    <>
      <AppBar position="static" style={{ background: "#FF7d21" }}>
        <Toolbar className="navBar">
          <IconButton
            onClick={() => setAbierto(true)}
            sx={{
              ml: 1,
              height: "55px",
              width: "55px",
              padding: "5px",
              objectFit: "cover",
              color: "white",
            }}
          >
            <MenuIcon />
          </IconButton>

          <Drawer
            open={abierto}
            anchor="left"
            onClose={() => setAbierto(false)}
            sx={{ "& .MuiDrawer-paper": { backgroundColor: "#E66C1D" } }}
          >
            <MenuNavbar />
          </Drawer>

          <a href="/" style={{ textDecoration: "none" }}>
            <img
              src="/modex.png"
              alt="logo modex"
              style={{
                width: "150px",
                height: "auto",
                padding: "15px",
                paddingRight: "10px",
                filter: "brightness(0) invert(1)",
                cursor: "pointer",
              }}
            />
          </a>

          <CustomizedInputBase />
          <AuthStatus />

          <a href="/favorito" style={{ textDecoration: "none" }}>
            <IconButton
              sx={{
                ml: 2,
                backgroundColor: "#F8F8F8",
                borderRadius: 20,
                height: "45px",
                width: "45px",
                padding: "5px",
                objectFit: "cover",
                color: "black",
              }}
            >
              <FavoriteIcon color="inherit" />
            </IconButton>
          </a>

          <a href="/carrito" style={{ textDecoration: "none" }}>
            <IconButton
              sx={{
                ml: 2,
                backgroundColor: "#F8F8F8",
                borderRadius: 50,
                height: "45px",
                width: "45px",
                padding: "5px",
                objectFit: "cover",
                color: "black",
              }}
            >
              <ShoppingCartIcon color="inherit" />
            </IconButton>
          </a>
        </Toolbar>

        {!isMobile && (
          <div className="navLinksPc">
            <div className="linkPc">
              <a href="/">INICIO</a>
            </div>

            <div className="linkPc">
              <Button
                onClick={handleClickProductos}
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.3rem",
                  fontFamily: "Roboto Condensed",
                }}
              >
                PRODUCTOS
              </Button>
              <Menu
                anchorEl={anchorElProductos}
                open={openProductos}
                onClose={handleCloseProductos}
                MenuListProps={{ "aria-labelledby": "productos-button" }}
              >
                <MenuItem component="a" href="/productos" onClick={handleCloseProductos}>
                  Todos los productos
                </MenuItem>
                <MenuItem component="a" href="/productos/usados" onClick={handleCloseProductos}>
                  Usados
                </MenuItem>
                <MenuItem component="a" href="/productos/nuevos" onClick={handleCloseProductos}>
                  Nuevos
                </MenuItem>
                <MenuItem component="a" href="/productos/hotsale" onClick={handleCloseProductos}>
                  Modex sale
                </MenuItem>
              </Menu>
            </div>

            <div className="linkPc">
              <a href="/armador">ARMA TU PC</a>
            </div>

            <div className="linkPc">
              <a href="/desarrollo">DESARROLLO WEB</a>
            </div>

                <div className="linkPc">
  <Button
    onClick={handleClickMantenimientos}
    sx={{
      color: "white",
      fontWeight: "bold",
      fontSize: "1.3rem",
      fontFamily: "Roboto Condensed",
    }}
  >
    MANTENIMIENTOS
  </Button>
  <Menu
    anchorEl={anchorElMantenimientos}
    open={openMantenimientos}
    onClose={handleCloseMantenimientos}
    MenuListProps={{ "aria-labelledby": "mantenimientos-button" }}
  >
      {sesion && String(sesion.rol) === "2" && (
        <>
          <MenuItem
            component="a"
            href="/mantenimiento/ingreso"
            onClick={handleCloseMantenimientos}
          >
            Cargar un mantenimiento
          </MenuItem>
          <MenuItem
            component="a"
            href="/mantenimiento/tabla"
            onClick={handleCloseMantenimientos}
          >
            Tabla de mantenimientos
          </MenuItem>
        </>
      )}

    <MenuItem
      component="a"
      href="/mantenimiento/ver"
      onClick={handleCloseMantenimientos}
    >
      Ver mi mantenimiento
    </MenuItem>
  </Menu>
</div>

          </div>
        )}
      </AppBar>
    </>
  );
}
