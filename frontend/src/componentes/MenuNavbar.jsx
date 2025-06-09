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
    <Box sx={{ width: 320, pl: "24px", bgcolor: "#e66c1d", minHeight: "100vh" }}>
      <List
        size="sm"
        sx={{
          "--List-insetStart": "32px",
          "--ListItem-paddingY": "0px",
          "--ListItem-paddingRight": "16px",
          "--ListItem-paddingLeft": "21px",
        }}
      >
        {Object.entries(data).map(([category, subcategories]) => {
          if (category === "Productos") return null;
          if (category === "Área técnica") {
            return (
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
                    sx={{ fontWeight: openCategory === category ? "bold" : null }}
                  >
                    {category}
                  </Typography>
                  <KeyboardArrowDown
                    sx={{
                      color: "inherit",
                      transition: "transform 0.3s",
                      transform:
                        openCategory === category ? "rotate(0deg)" : "rotate(-90deg)",
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
                            onClick={() => navigate(`/${subcategory.toLowerCase()}`)}
                          >
                            {subcategory}
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </div>
              </ListItem>
            );
          }

          return (
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
                  sx={{ fontWeight: openCategory === category ? "bold" : null }}
                >
                  {category}
                </Typography>
                <KeyboardArrowDown
                  sx={{
                    color: "inherit",
                    transition: "transform 0.3s",
                    transform:
                      openCategory === category ? "rotate(0deg)" : "rotate(-90deg)",
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
                          onClick={() => navigate(`/${subcategory.toLowerCase()}`)}
                        >
                          {subcategory}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </div>
            </ListItem>
          );
        })}

        {/* Productos hardcodeado */}
        <ListItem nested sx={{ my: 1 }}>
          <ListItemButton
            onClick={() => toggleCategory("Productos")}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              color: "white",
            }}
          >
            <Typography
              sx={{
                fontWeight: openCategory === "Productos" ? "bold" : null,
                color: "white",
              }}
            >
              Productos
            </Typography>
            <KeyboardArrowDown
              sx={{
                color: "inherit",
                transition: "transform 0.3s",
                transform:
                  openCategory === "Productos"
                    ? "rotate(0deg)"
                    : "rotate(-90deg)",
              }}
            />
          </ListItemButton>
          <div
            style={{
              maxHeight: openCategory === "Productos" ? `${height}px` : "0",
              overflow: "hidden",
              transition: "max-height 0.3s ease-out",
            }}
          >
            {openCategory === "Productos" && (
              <List sx={{ "--ListItem-paddingY": "8px" }}>
                <ListItem>
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
                    onClick={() => navigate("/productos/usados")}
                  >
                    Usados
                  </ListItemButton>
                </ListItem>
                <ListItem>
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
                    onClick={() => navigate("/productos/nuevos")}
                  >
                    Nuevos
                  </ListItemButton>
                </ListItem>
                <ListItem>
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
                    onClick={() => navigate("/productos")}
                  >
                    Todos los productos
                  </ListItemButton>
                </ListItem>
              </List>
            )}
          </div>
        </ListItem>

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
              onClick={() => navigate(`/Mantenimiento/ingreso`)}
            >
              Ingreso de mantenimiento
            </ListItemButton>
          </ListItem>
        </AuthRol>
      </List>
    </Box>
  );
}
