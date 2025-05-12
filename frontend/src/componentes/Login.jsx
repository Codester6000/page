import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formLoginSchema } from "../validations/formlogin";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Auth";

// Material UI
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const url = import.meta.env.VITE_URL_BACK;
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formLoginSchema),
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (datos) => {
    const response = await fetch(`${url}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const mensaje = await response.json();
    if (response.ok) {
      resetField("username");
      resetField("password");
    }
    login(
      datos.username,
      datos.password,
      () => navigate(from, { replace: true }),
      () => setError("Contraseña o usuario incorrecto.")
    );
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 12 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" fontWeight={400} gutterBottom>
          Iniciar sesión en MODEX
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 2 }}
        >
          <TextField
            fullWidth
            margin="normal"
            label="Usuario"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleShowPassword}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: "#FF7D20" }}
          >
            Iniciar sesión
          </Button>

          {error && (
            <Typography color="error" align="center" variant="body2">
              {error}
            </Typography>
          )}

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            ¿No tienes una cuenta? Haz clic <Link to="/register">Aquí</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
