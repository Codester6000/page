import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { useContext } from "react";
import { SearchContext } from "../searchContext";
import { useNavigate } from "react-router-dom";

export default function CustomizedInputBase() {
  const navigate = useNavigate();
  const { setSearchTerm } = useContext(SearchContext);

  return (
    <Paper
      component="form"
      sx={{
        flexGrow: 1,
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: 550,
        height: 55,
        borderRadius: "20px",
      }}
    >
      <IconButton sx={{ p: "10px" }} aria-label="menu"></IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Busca tu Producto"
        inputProps={{ "aria-label": "busca tu producto" }}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            navigate("/busqueda");
          }
        }}
      />
      <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
        <SearchIcon />
      </IconButton>
      {/* sx={{ flexGrow: 1 }} */}
    </Paper>
  );
}
