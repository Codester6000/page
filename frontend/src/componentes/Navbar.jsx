import {
  AppBar,
  Button,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  colors,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import CustomizedInputBase from "./CustomizedInputBase";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useState } from "react";
import "../styles/navBar.css";
import MenuNavbar from "./MenuNavbar";
import { AuthStatus } from "../Auth";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);

  // Estado para el submenú de productos
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
            sx={{
              "& .MuiDrawer-paper": {
                backgroundColor: "#E66C1D",
              },
            }}
          >
            <MenuNavbar />
          </Drawer>
          <img
            src="/modex.png"
            alt="logo modex"
            onClick={() => navigate("/")}
            style={{
              width: "150px",
              height: "auto",
              padding: "15px",
              paddingRight: "10px",
              filter: "brightness(0) invert(1)",
              cursor: "pointer",
            }}
          />
          <CustomizedInputBase />
          <AuthStatus />
          <IconButton
            onClick={() => navigate("/favorito")}
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
          <IconButton
            onClick={() => navigate("/carrito")}
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
        </Toolbar>

        {/* NAV LINKS */}
        <div className="navLinksPc">
          <div className="linkPc">
            <a href="/">INICIO</a>
          </div>

          <div className="linkPc">
            {/* Activador del submenú */}
            <Button
              onClick={handleClick}
              sx={{ color: "white", fontWeight: "bold" }}
            >
              PRODUCTOS
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{ "aria-labelledby": "productos-button" }}
            >
              <MenuItem
                onClick={() => {
                  navigate("/productos");
                  handleClose();
                }}
              >
                Todos los productos
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate("/productos/usados");
                  handleClose();
                }}
              >
                Usados
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate("/productos/nuevos");
                  handleClose();
                }}
              >
                Nuevos
              </MenuItem>
            </Menu>
          </div>

          <div className="linkPc">
            <a href="/armador">ARMA TU PC</a>
          </div>
          <div className="linkPc">
            <a href="/desarrollo">DESARROLLO</a>
          </div>
        </div>
      </AppBar>
    </>
  );
}
