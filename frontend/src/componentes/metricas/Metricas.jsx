import {
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Datos de ejemplo
const ventasPorDia = [
  { dia: "Lun", ventas: 400 },
  { dia: "Mar", ventas: 300 },
  { dia: "Mié", ventas: 500 },
  { dia: "Jue", ventas: 200 },
  { dia: "Vie", ventas: 700 },
  { dia: "Sáb", ventas: 900 },
  { dia: "Dom", ventas: 300 },
];

const ingresosMensuales = [
  { mes: "Ene", ingreso: 1200 },
  { mes: "Feb", ingreso: 2100 },
  { mes: "Mar", ingreso: 800 },
  { mes: "Abr", ingreso: 1600 },
  { mes: "May", ingreso: 1900 },
];

const categoriasVendidas = [
  { name: "Notebooks", value: 400 },
  { name: "Periféricos", value: 300 },
  { name: "Accesorios", value: 300 },
  { name: "Monitores", value: 200 },
];

const colores = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Metricas() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Grid container spacing={3} padding={isMobile ? 2 : 4}>
      {/* Gráfico de barras */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: "16px" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ventas por día
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ventasPorDia}>
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ventas" fill="#ff7d21" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Gráfico de línea */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: "16px" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ingresos mensuales
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ingresosMensuales}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ingreso" stroke="#ff7d21" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Gráfico de torta */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: "16px" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Categorías más vendidas
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoriasVendidas}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {categoriasVendidas.map((entry, index) => (
                    <Cell key={index} fill={colores[index % colores.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
