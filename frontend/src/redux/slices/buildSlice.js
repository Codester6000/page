import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productos: {
    procesadores: [],
    mothers: [],
    placas: [],
    almacenamiento: [],
    memorias: [],
    fuentes: [],
    gabinetes: [],
    coolers: [],
    monitores: [],
  },
  selectedParts: {
    cpu: null,
    motherboard: null,
    ram: [],
    // Agrega más si necesitas...
  },
  total: 0,
  watts: 0,
  order: "asc",
};

const armadorSlice = createSlice({
  name: "armador",
  initialState,
  reducers: {
    setProductos: (state, action) => {
      state.productos = action.payload;
    },
    setTotal: (state, action) => {
      state.total = action.payload;
    },
    setWatts: (state, action) => {
      state.watts = action.payload;
    },
    setOrder: (state, action) => {
      state.order = action.payload;
    },
    selectPart: (state, action) => {
      const { category, part } = action.payload;
      if (category === "ram") {
        state.selectedParts[category] = [part]; // Si ram permite múltiples, podrías manejar un array
      } else {
        state.selectedParts[category] = part;
      }
    },
  },
});

export const { setProductos, setTotal, setWatts, setOrder, selectPart } =
  armadorSlice.actions;
export default armadorSlice.reducer;
