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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
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
  const [anchorElCategorias, setAnchorElCategorias] = useState(null);
  const [anchorElComponentes, setAnchorElComponentes] = useState(null);
  const [anchorElRefrigeracion, setAnchorElRefrigeracion] = useState(null);
  const [anchorElNotebooks, setAnchorElNotebooks] = useState(null);
  const [anchorElComputadoras, setAnchorElComputadoras] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { sesion } = useAuth();

  const handleClickCategorias = (event) =>
    setAnchorElCategorias(event.currentTarget);
  const handleCloseCategorias = () => setAnchorElCategorias(null);

  const handleClickComponentes = (event) =>
    setAnchorElComponentes(event.currentTarget);
  const handleCloseComponentes = () => setAnchorElComponentes(null);

  const handleClickRefrigeracion = (event) =>
    setAnchorElRefrigeracion(event.currentTarget);
  const handleCloseRefrigeracion = () => setAnchorElRefrigeracion(null);

  const handleClickNotebooks = (event) =>
    setAnchorElNotebooks(event.currentTarget);
  const handleCloseNotebooks = () => setAnchorElNotebooks(null);

  const handleClickComputadoras = (event) =>
    setAnchorElComputadoras(event.currentTarget);
  const handleCloseComputadoras = () => setAnchorElComputadoras(null);

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
            {/* CATEGORÍAS Dropdown */}
            <div className="linkPc">
              <Button
                aria-controls="categorias-menu"
                aria-haspopup="true"
                onClick={handleClickCategorias}
                sx={{ color: "white", fontWeight: "normal" }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                CATEGORÍAS
              </Button>
              <Menu
                id="categorias-menu"
                anchorEl={anchorElCategorias}
                open={Boolean(anchorElCategorias)}
                onClose={handleCloseCategorias}
              >
                <MenuItem component="a" href="/productos/nuevos">Nuevos</MenuItem>
                <MenuItem component="a" href="/productos/usados">Usados</MenuItem>
                <MenuItem component="a" href="/productos/ofertas">Ofertas</MenuItem>
                <MenuItem component="a" href="/productos/mas-vendidos">Más Vendidos</MenuItem>
              </Menu>
            </div>

            {/* COMPONENTES Dropdown */}
            <div className="linkPc">
              <Button
                aria-controls="componentes-menu"
                aria-haspopup="true"
                onClick={handleClickComponentes}
                sx={{ color: "white", fontWeight: "normal" }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                COMPONENTES
              </Button>
              <Menu
                id="componentes-menu"
                anchorEl={anchorElComponentes}
                open={Boolean(anchorElComponentes)}
                onClose={handleCloseComponentes}
              >
                <MenuItem component="a" href="/componentes/procesadores">Procesadores</MenuItem>
                <MenuItem component="a" href="/componentes/placas-madre">Placas Madre</MenuItem>
                <MenuItem component="a" href="/componentes/placas-de-video">Placas de Video</MenuItem>
                <MenuItem component="a" href="/componentes/memorias-ram">Memorias RAM</MenuItem>
                <MenuItem component="a" href="/componentes/almacenamiento">Almacenamiento</MenuItem>
                <MenuItem component="a" href="/componentes/fuentes-de-poder">Fuentes de Poder</MenuItem>
              </Menu>
            </div>

            {/* REFRIGERACIÓN Dropdown */}
            <div className="linkPc">
              <Button
                aria-controls="refrigeracion-menu"
                aria-haspopup="true"
                onClick={handleClickRefrigeracion}
                sx={{ color: "white", fontWeight: "normal" }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                REFRIGERACIÓN
              </Button>
              <Menu
                id="refrigeracion-menu"
                anchorEl={anchorElRefrigeracion}
                open={Boolean(anchorElRefrigeracion)}
                onClose={handleCloseRefrigeracion}
              >
                <MenuItem component="a" href="/refrigeracion/coolers-cpu">Coolers para CPU</MenuItem>
                <MenuItem component="a" href="/refrigeracion/water-cooling">Water Cooling</MenuItem>
                <MenuItem component="a" href="/refrigeracion/ventiladores-gabinete">Ventiladores de Gabinete</MenuItem>
              </Menu>
            </div>

            {/* NOTEBOOKS Dropdown */}
            <div className="linkPc">
              <Button
                aria-controls="notebooks-menu"
                aria-haspopup="true"
                onClick={handleClickNotebooks}
                sx={{ color: "white", fontWeight: "normal" }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                NOTEBOOKS
              </Button>
              <Menu
                id="notebooks-menu"
                anchorEl={anchorElNotebooks}
                open={Boolean(anchorElNotebooks)}
                onClose={handleCloseNotebooks}
              >
                <MenuItem component="a" href="/notebooks/gamer">Notebooks Gamer</MenuItem>
                <MenuItem component="a" href="/notebooks/oficina">Notebooks de Oficina</MenuItem>
                <MenuItem component="a" href="/notebooks/diseno">Notebooks para Diseño</MenuItem>
              </Menu>
            </div>

            {/* COMPUTADORAS Dropdown */}
            <div className="linkPc">
              <Button
                onClick={handleClickComputadoras}
                sx={{ color: "white", fontWeight: "normal" }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                COMPUTADORAS
              </Button>
              <Menu
                anchorEl={anchorElComputadoras}
                open={Boolean(anchorElComputadoras)}
                onClose={handleCloseComputadoras}
              >
                <MenuItem component="a" href="/computadoras/pc-gamer">PC Gamer</MenuItem>
                <MenuItem component="a" href="/computadoras/pc-oficina">PC de Oficina</MenuItem>
                <MenuItem component="a" href="/computadoras/workstations">Workstations</MenuItem>
              </Menu>
            </div>

            <div className="linkPc">
              <Button
                component="a"
                href="/monitores"
                sx={{ color: "white", fontWeight: "normal" }}
              >
                MONITORES
              </Button>
            </div>

            <div className="linkPc">
              <Button
                component="a"
                href="/armador"
                sx={{ color: "white", fontWeight: "normal" }}
              >
                ARMADOR PC
              </Button>
            </div>
          </div>
        )}
      </AppBar>
    </>
  );
}
