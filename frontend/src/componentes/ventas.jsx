import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Grid,
  Typography,
  Paper,
  useTheme,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@mui/material";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useAuth } from "../Auth";
import "../ventas.css";

const Ventas = () => {
  const { sesion } = useAuth();
  const url = import.meta.env.VITE_URL_BACK;
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const paginationModel = { page: 0, pageSize: 5 };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "ventas.xlsx");
  };

  const columnas = [
    { field: "id", headerName: "ID Pedido", width: 100 },
    { field: "username", headerName: "Cliente", width: 150 },
    {
      field: "fecha_finalizada",
      headerName: "Fecha",
      width: 170,
      type: "dateTime",
      valueGetter: (value) => value && new Date(value),
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 120,
      cellClassName: "estado",
    },
    { field: "productos", headerName: "Productos", width: 350 },
    { field: "total_a_pagar", headerName: "Total", width: 200 },
  ];

  const getVentas = async () => {
    const response = await fetch(`${url}/carrito/ventas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sesion.token}`,
      },
    });

    if (response.ok) {
      const resultado = await response.json();
      setRows(resultado);
    }

    const statsResponse = await fetch(`${url}/carrito/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sesion.token}`,
      },
    });

    if (statsResponse.ok) {
      const resultadoStats = await statsResponse.json();
      setStats(resultadoStats[0]);
    }
  };

  useEffect(() => {
    getVentas();
  }, []);

  const renderCard = (label, value, icon, color) => (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        borderRadius: 3,
        bgcolor: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
      <Box>
        <Typography variant="body2" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {value ?? "-"}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Panel de Ventas
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          {renderCard(
            "Total Vendido",
            stats.total_vendido,
            <AttachMoneyIcon />,
            "#1976d2"
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCard(
            "Pedidos",
            stats.pedidos,
            <ShoppingCartIcon />,
            "#9c27b0"
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCard("Clientes", stats.clientes, <PeopleAltIcon />, "#ff9800")}
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
        <DataGrid
          columns={columnas}
          rows={rows}
          getRowHeight={() => "auto"}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#f5f5f5",
              fontWeight: "bold",
            },
            "& .estado": {
              color: "#4caf50",
              fontWeight: "bold",
            },
          }}
        />
        <Button
          onClick={exportToExcel}
          variant="contained"
          sx={{ mb: 2, backgroundColor: "#4caf50", color: "white" }}
        >
          Exportar a Excel
        </Button>
      </Paper>
    </Box>
  );
};

export default Ventas;
