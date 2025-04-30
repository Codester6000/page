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
    ram: [], // pensado para múltiples memorias
  },
  total: 0,
  watts: 0,
  order: "ASC", // Normalizado en mayúscula como en el front
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
      state.order = action.payload.toUpperCase(); // siempre en mayúscula
    },
    selectPart: (state, action) => {
      const { category, part } = action.payload;

      if (category === "ram") {
        // Permitir múltiples rams sin duplicar
        if (!state.selectedParts.ram.includes(part)) {
          state.selectedParts.ram.push(part);
        }
      } else {
        state.selectedParts[category] = part;
      }
    },
    removePart: (state, action) => {
      const { category, part } = action.payload;

      if (category === "ram") {
        // Si es RAM, eliminar el módulo específico
        state.selectedParts.ram = state.selectedParts.ram.filter(
          (id) => id !== part
        );
      } else {
        // En otras categorías, simplemente setear a null
        state.selectedParts[category] = null;
      }
    },
    clearBuild: (state) => {
      // Limpia toda la selección
      state.selectedParts = {
        cpu: null,
        motherboard: null,
        ram: [],
        // otras categorías si agregás...
      };
      state.total = 0;
      state.watts = 0;
    },
  },
});

export const {
  setProductos,
  setTotal,
  setWatts,
  setOrder,
  selectPart,
  removePart,
  clearBuild,
} = armadorSlice.actions;

export default armadorSlice.reducer;
