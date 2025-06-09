import { useState } from "react";
import { TextField, Button, Container } from "@mui/material";

export default function TesteoForm() {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado desde test:", input);
    alert("Submit funcionó");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Probando"
          value={input}
          fullWidth
          onChange={(e) => setInput(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth>
          Enviar
        </Button>
      </form>
    </Container>
  );
}
