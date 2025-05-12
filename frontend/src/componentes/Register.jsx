import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formRegisterSchema } from "../validations/formlogin";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";

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
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Register = () => {
  const url = import.meta.env.VITE_URL_BACK;
  const navigate = useNavigate();
  const [errores, setErrores] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formRegisterSchema),
  });

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (datos) => {
    if (!captchaValue) {
      setErrores("Por favor completa el CAPTCHA");
      return;
    }

    try {
      const response = await fetch(`${url}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (response.ok) {
        const mensaje = await response.json();
        resetField("username");
        resetField("password");
        resetField("email");
        resetField("fechaNacimiento");
        setErrores("");

        await Swal.fire({
          title: "¡Cuenta creada!",
          text: "Ahora puedes iniciar sesión",
          icon: "success",
          confirmButtonText: "Aceptar",
        });

        navigate("/login");
      } else {
        setErrores("Ese usuario o email ya está en uso");
      }
    } catch (error) {
      console.error("Error al registrarse:", error);
      setErrores("Ocurrió un error en el registro");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Crear cuenta en MODEX
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
                  <IconButton onClick={toggleShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Fecha de nacimiento"
            type="date"
            {...register("fechaNacimiento")}
            error={!!errors.fechaNacimiento}
            helperText={errors.fechaNacimiento?.message}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* CAPTCHA */}
          <Box sx={{ mt: 2, mb: 2, display: "flex", justifyContent: "center" }}>
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={(value) => setCaptchaValue(value)}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: "#FF7D20" }}
          >
            Registrarse
          </Button>

          {errores && (
            <Typography color="error" align="center" variant="body2">
              {errores}
            </Typography>
          )}

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            ¿Ya tienes una cuenta? Haz clic <Link to="/login">Aquí</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
