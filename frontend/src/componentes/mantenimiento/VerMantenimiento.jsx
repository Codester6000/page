import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  HourglassEmpty,
  Search,
  Build,
  CheckCircle,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useAuth } from '../../Auth.jsx';

const iconMap = {
  Reloj: <HourglassEmpty />,
  Lupa: <Search />,
  Llave: <Build />,
  Check: <CheckCircle />,
};

const iconOptions = ['Reloj', 'Lupa', 'Llave', 'Check'];

export default function VerMantenimiento() {
  const { sesion } = useAuth();
  const [dni, setDni] = useState('');
  const [ficha, setFicha] = useState('');
  const [datos, setDatos] = useState(null);
  const [pasos, setPasos] = useState([]);
  const [pasoActual, setPasoActual] = useState(0);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);

  const buscarFicha = async () => {
    setError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_URL_BACK}/api/mantenimientos/consulta?dni=${dni}&ficha=${ficha}`
      );
      if (!res.ok) throw new Error('No encontrado');
      const data = await res.json();
      setDatos(data);
      const estados = typeof data.detalles === 'string'
        ? JSON.parse(data.detalles || '[]')
        : data.detalles || [];
      setPasos(estados);
      setPasoActual(estados.findIndex((e) => !e.completado));
    } catch (err) {
      setError('Ficha no encontrada o datos incorrectos.');
    }
  };

  const avanzarPaso = async () => {
    if (!datos) return;

    const payload = {
      estado: pasoActual + 1,
      observaciones: datos.observaciones || '',
      pasoIndex: pasoActual,
      nuevoComentario: comentario,
    };

    const res = await fetch(
      `${import.meta.env.VITE_URL_BACK}/api/mantenimientos/actualizar-estado/${datos.id_mantenimiento}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      const copia = [...pasos];
      copia[pasoActual].comentario = comentario;
      copia[pasoActual].completado = true;
      setComentario('');
      setPasoActual(pasoActual + 1);
      setPasos(copia);
    } else {
      alert('No se pudo avanzar el paso');
    }
  };

  const editarPaso = (index, campo, valor) => {
    const copia = [...pasos];
    copia[index][campo] = valor;
    setPasos(copia);
  };

  const handleCheckPaso = async (index, valor) => {
    try {
      const nuevosPasos = [...pasos];
      nuevosPasos[index].completado = valor;
      const finalizado = nuevosPasos.some(p => p.icono === 'Check' && p.completado)
        && nuevosPasos.filter(p => p.completado).length >= 2;

      await fetch(`${import.meta.env.VITE_URL_BACK}/api/mantenimientos/actualizar-estado/${datos.id_mantenimiento}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({
          detalles: nuevosPasos,
          observaciones: datos.observaciones,
          estado: finalizado ? 1 : datos.estado,
        }),
      });

      setPasos(nuevosPasos);
    } catch (error) {
      console.error("Error al actualizar paso:", error);
      alert("No se pudo actualizar el paso");
    }
  };

  const handleFoto = async (index, file) => {
    if (!file || !datos?.numero_ficha || !datos?.nombre_producto) return;

    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('numero_ficha', datos.numero_ficha);
    formData.append('tipo_producto', datos.nombre_producto);
    formData.append('orden_paso', index);

    try {
      const res = await fetch(`${import.meta.env.VITE_URL_BACK}/api/mantenimientos/subir-imagen-paso`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sesion.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir imagen');

      const copia = [...pasos];
      copia[index].foto = `${import.meta.env.VITE_URL_BACK}${data.url}`;
      setPasos(copia);
    } catch (err) {
      console.error('❌ Error al subir imagen del paso:', err);
      alert('No se pudo subir la imagen');
    }
  };

  const guardarCambios = async () => {
    if (!datos) return;
    const finalizado = pasos.some(p => p.icono === 'Check' && p.completado)
      && pasos.filter(p => p.completado).length >= 2;

    const payload = {
      estado: finalizado ? 1 : pasoActual,
      observaciones: '',
      detalles: pasos,
    };

    const res = await fetch(
      `${import.meta.env.VITE_URL_BACK}/api/mantenimientos/actualizar-estado/${datos.id_mantenimiento}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        title: finalizado ? '¡Mantenimiento Finalizado!' : 'Cambios guardados',
        text: finalizado
          ? 'Todos los pasos están completos. El mantenimiento ha sido marcado como finalizado.'
          : 'Los cambios fueron guardados correctamente.',
        icon: 'success',
      });
    } else {
      alert("No se pudieron guardar los cambios");
    }
  };

  const agregarPaso = () => {
    setPasos([
      ...pasos,
      {
        titulo: 'Nuevo paso',
        icono: 'Llave',
        comentario: '',
        completado: false,
        foto: null,
      },
    ]);
  };

  return (
    <Box p={3} display="flex" justifyContent="center">
      {!datos ? (
        <Paper sx={{ p: 3, width: '100%', maxWidth: 500 }}>
          <Typography variant="h6" mb={2} textAlign="center">
            Consultar estado de mantenimiento
          </Typography>
          <TextField fullWidth label="DNI" value={dni} onChange={(e) => setDni(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth label="Número de ficha" value={ficha} onChange={(e) => setFicha(e.target.value)} sx={{ mb: 2 }} />
          {error && <Typography color="error" textAlign="center" mb={2}>{error}</Typography>}
          <Button fullWidth variant="contained" onClick={buscarFicha}>Ver mi mantenimiento</Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, width: '100%', maxWidth: 700, borderRadius: 3, boxShadow: 5, backgroundColor: '#fafafa' }}>
          <Typography variant="h6" align="center" fontWeight="bold" mb={1}>
            FICHA N° {datos.numero_ficha}
          </Typography>

          {datos.estado === 1 && (
            <Typography variant="body2" align="center" color="success.main" mb={2}>
              Finalizado el: {new Date(datos.fecha_finalizacion).toLocaleDateString()}
            </Typography>
          )}

          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">Estado de mantenimiento</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {pasos.map((paso, i) => (
                <Box key={i} mt={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box color={paso.completado ? 'green' : 'gray'}>
                      {iconMap[paso.icono] || <Build />}
                    </Box>

                    {sesion?.rol === 'admin' || sesion?.rol === 2 ? (
                      <>
                        <TextField value={paso.titulo} onChange={(e) => editarPaso(i, 'titulo', e.target.value)} variant="standard" sx={{ width: 200 }} />
                        <FormControl size="small" sx={{ ml: 2 }}>
                          <InputLabel>Icono</InputLabel>
                          <Select value={paso.icono} label="Icono" onChange={(e) => editarPaso(i, 'icono', e.target.value)}>
                            {iconOptions.map((icon) => (
                              <MenuItem key={icon} value={icon}>{icon}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {paso.icono === 'Check' && pasos.filter(p => p.completado).length >= 2 && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={paso.completado}
                                onChange={(e) => handleCheckPaso(i, e.target.checked)}
                              />
                            }
                            label="Finalizado"
                            sx={{ ml: 2 }}
                          />
                        )}
                      </>
                    ) : (
                      <Typography>{paso.titulo}</Typography>
                    )}
                  </Box>

                  {paso.comentario && (
                    <Paper elevation={2} sx={{ p: 2, mt: 1, backgroundColor: '#f5f5f5', borderLeft: '4px solid #2196f3' }}>
                      <Typography fontWeight="bold">Comentario del técnico:</Typography>
                      <Typography>{paso.comentario}</Typography>
                    </Paper>
                  )}

                  {paso.foto && (
                    <Box mt={1}>
                      <img src={paso.foto} alt="Foto del paso" style={{ maxWidth: '50%', borderRadius: 8 }} />
                    </Box>
                  )}

                  {(sesion?.rol === 'admin' || sesion?.rol === 2) && (
                    <Box mt={1}>
                      <input type="file" accept="image/*" onChange={(e) => handleFoto(i, e.target.files[0])} />
                    </Box>
                  )}
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          {(sesion?.rol === 'admin' || sesion?.rol === 2) && (
            <Box mt={4}>
              <TextField fullWidth multiline label="Comentario del técnico" value={comentario} onChange={(e) => setComentario(e.target.value)} />
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="outlined" color="warning" onClick={() => window.location.reload()}>Volver</Button>
                <Box>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={guardarCambios}>Guardar cambios</Button>
                  <Button variant="outlined" sx={{ mr: 2 }} onClick={agregarPaso}>Agregar paso</Button>
                  <Button variant="contained" color="success" onClick={avanzarPaso}>Avanzar</Button>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}