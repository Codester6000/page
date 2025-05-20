import * as React from "react";
import Box from "@mui/joy/Box";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import Typography from "@mui/joy/Typography";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";
import data from "./MenuData.json";
import { useNavigate } from "react-router-dom";
import { AuthRol } from "../Auth";
import { Divider, Collapse, ListItemText } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export default function MenuNavbar() {
  const [openCategory, setOpenCategory] = useState(null);
  const [ventas, setVentas] = useState(false);
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

  const handleOpenVentas = () => {
    setVentas(!ventas);
  };

  return (
    <Box
      sx={{ width: 320, pl: "24px", bgcolor: "#e66c1d", minHeight: "100vh" }}
    >
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
            <ListItemButton
              onClick={() => toggleCategory(category)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
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
                          color: "#fff",
                          borderRadius: "10px",
                          "&:hover": {
                            backgroundColor: "#ff832b",
                          },
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

        {/* Productos*/}
        <ListItem sx={{ my: 1 }}>
          <ListItemButton
            sx={{
              backgroundColor: "#e66c1d",
              color: "#fff",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "#ff832b",
              },
            }}
            onClick={() => navigate(`/productos`)}
          >
            Productos
          </ListItemButton>
        </ListItem>
        {/* Preguntas frecuentes */}
        <ListItem sx={{ my: 1 }}>
          <ListItemButton
            sx={{
              backgroundColor: "#e66c1d",
              color: "#fff",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "#ff832b",
              },
            }}
            onClick={() => navigate(`/faqs`)}
          >
            Preguntas frecuentes
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 2, borderColor: "#fff" }} />

        {/* Sección para admin (rol 2) */}
        <AuthRol rol="2">
          <ListItem nested>
            <ListItemButton
              onClick={handleOpenVentas}
              sx={{
                backgroundColor: "#e66c1d",
                color: "#fff",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#ff832b",
                },
              }}
            >
              <ListItemText primary="Ventas" />
              {ventas ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={ventas} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{
                    pl: 4,
                    color: "#fff",
                    "&:hover": { backgroundColor: "#ff832b" },
                  }}
                  onClick={() => navigate("/ventas")}
                >
                  <ListItemText primary="Ventas" />
                </ListItemButton>
                <ListItemButton
                  sx={{
                    pl: 4,
                    color: "#fff",
                    "&:hover": { backgroundColor: "#ff832b" },
                  }}
                  onClick={() => navigate("/metricas")}
                >
                  <ListItemText primary="Métricas" />
                </ListItemButton>
              </List>
            </Collapse>
          </ListItem>
          <ListItem sx={{ mt: 1 }}>
            <ListItemButton
              sx={{
                backgroundColor: "#e66c1d",
                color: "#fff",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#ff832b",
                },
              }}
              onClick={() => navigate(`/cargar-producto`)}
            >
              Cargar producto
            </ListItemButton>
          </ListItem>
        </AuthRol>
      </List>
    </Box>
  );
}
