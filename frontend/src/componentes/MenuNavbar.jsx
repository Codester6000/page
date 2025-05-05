import * as React from "react";
import Box from "@mui/joy/Box";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import Typography from "@mui/joy/Typography";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";
import data from "./MenuData.json";
import { useNavigate } from "react-router-dom";
import { AuthRol } from "../Auth";
import { Divider } from "@mui/material";

// JSON con las categorías y subcategorías
// const data = {
//     "Accesorios": ["Candado", "Docking", "Accesorios Videojuegos"],
//     "Almacenamiento": ["Pendrive", "SSD Interno", "SSD Externo", "Interno", "Externo", "Memorias Flash"],
//     "Audio": ["Auriculares", "Micrófonos"],
//     "Computadoras": ["All In One", "PC de Escritorio", "Notebooks Corporativos", "Notebooks Consumo"],
//     "Conectividad": ["Extensores", "Routers", "Switches"],
//     "Estuches": ["Fundas", "Maletines", "Mochilas"],
//     "Hardware": ["Coolers", "Fuentes", "Gabinetes", "Motherboards", "Placas de Video", "Procesadores"],
//     "Imagen": ["Accesorios", "Escaner", "Monitores", "Proyectores"],
//     "Impresoras": [
//         "Impresoras de Sistema Continuo",
//         "Impresoras de Tickets",
//         "Impresoras Inkjet",
//         "Impresoras Laser",
//         "Impresoras Matricial",
//         "Impresoras Multifunción"
//     ],
//     "Insumos": ["Botellas de Tinta", "Cartuchos de Tinta", "Cintas", "Toners"],
//     "Memorias": ["Memorias Notebook", "Memorias PC"],
//     "Muebles": ["Sillas"],
//     "Networking": ["Hubs"],
//     "Papelería": ["Rollos"],
//     "Periféricos": ["Cámaras Web", "Joysticks", "Mouse Pad", "Mouse", "Teclados", "Volantes"],
//     "Seguridad": ["Cámaras IP", "Cámaras Wifi"],
//     "Software": ["Garantía", "Software"]
// };

export default function MenuNavbar() {
  const [openCategory, setOpenCategory] = useState(null);

  const [height, setHeight] = useState(0);
  const navigate = useNavigate();
  const toggleCategory = (category) => {
    if (openCategory === category) {
      setHeight(0);
    } else {
      setHeight(200);
    }
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  return (
    <Box sx={{ width: 320, pl: "24px", bgcolor: "#e66c1d" }}>
      <List
        size="sm"
        sx={{
          "--List-insetStart": "32px",
          "--ListItem-paddingY": "0px",
          "--ListItem-paddingRight": "16px",
          "--ListItem-paddingLeft": "21px",
        }}
      >
        {Object.entries(data).map(([category, subcategories]) => (
          <ListItem key={category} nested sx={{ my: 1 }}>
            {/* Botón de categoría */}
            <ListItemButton
              onClick={() => toggleCategory(category)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                // backgroundColor: '#e66c1d',
                // backgroundColor: '#FF7d21',
                color: "white",
              }}
            >
              <Typography
                level="inherit"
                sx={{
                  fontWeight: openCategory === category ? "bold" : null,
                }}
              >
                {category}
              </Typography>
              <KeyboardArrowDown
                sx={{
                  color: "inherit",
                  transition: "transform 0.3s",
                  transform:
                    openCategory === category
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                }}
              />
            </ListItemButton>
            <div
              style={{
                maxHeight: openCategory === category ? `${height}px` : "0",
                overflow: "hidden",
                transition: "max-height 0.3s ease-out",
              }}
            >
              {openCategory === category && (
                <List sx={{ "--ListItem-paddingY": "8px" }}>
                  {subcategories.map((subcategory) => (
                    <ListItem key={subcategory}>
                      <ListItemButton
                        sx={{
                          paddingLeft: "40px",
                          backgroundColor: "#e66c1d",
                          color: "#ffff",
                          borderRadius: "10px",
                        }}
                        onClick={() => navigate(`/${subcategory}`)}
                      >
                        {subcategory}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </div>
          </ListItem>
        ))}
        <Divider />
        <AuthRol rol="2">
          <ListItem key="123">
            <ListItemButton
              sx={{
                backgroundColor: "#e66c1d",
                color: "#ffff",
                borderRadius: "10px",
              }}
              onClick={() => navigate(`/ventas`)}
            >
              Ventas
            </ListItemButton>
          </ListItem>
          <ListItemButton
            sx={{
              backgroundColor: "#e66c1d",
              color: "#ffff",
              borderRadius: "10px",
            }}
            onClick={() => navigate(`/cargar-producto`)}
          >
            Cargar producto
          </ListItemButton>
        </AuthRol>
      </List>
    </Box>
  );
}
