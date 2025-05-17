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
import { AuthStatus } from "../Auth";

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

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
                onClick={handleClick}
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
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{ "aria-labelledby": "productos-button" }}
              >
                <MenuItem component="a" href="/productos" onClick={handleClose}>
                  Todos los productos
                </MenuItem>
                <MenuItem
                  component="a"
                  href="/productos/usados"
                  onClick={handleClose}
                >
                  Usados
                </MenuItem>
                <MenuItem
                  component="a"
                  href="/productos/nuevos"
                  onClick={handleClose}
                >
                  Nuevos
                </MenuItem>
                <MenuItem
                  component="a"
                  href="/productos/hotsale"
                  onClick={handleClose}
                >
                  Hot sale
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
        )}
      </AppBar>
    </>
  );
}
