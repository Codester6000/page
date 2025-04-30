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
    gpu: null,
    ram: [],
    storage: null,
    psu: null,
    case: null,
    cooler: null,
    monitor: null,
  },
  total: 0,
  watts: 0,
  order: "ASC",
};

const armadorSlice = createSlice({
  name: "build",
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
      state.order = action.payload.toUpperCase();
    },
    selectPart: (state, action) => {
      const { category, part } = action.payload;

      if (category === "ram") {
        if (!state.selectedParts.ram.includes(part)) {
          state.selectedParts.ram.push(part);
        }
      } else if (category === "cpu") {
        state.selectedParts.cpu = part;

        // Resetear motherboard si cambia de plataforma
        const cpuSeleccionado = (state.productos.procesadores || []).find(
          (p) => p.id_producto === part
        );

        const motherActual = (state.productos.mothers || []).find(
          (mb) => mb.id_producto === state.selectedParts.motherboard
        );

        if (cpuSeleccionado && motherActual) {
          const cpuNombre = cpuSeleccionado.nombre.toLowerCase();
          const motherSocket = motherActual.socket?.toLowerCase() || "";

          const isAMD = cpuNombre.includes("amd");
          const isCompatible = isAMD
            ? motherSocket.includes("am4") || motherSocket.includes("am5")
            : motherSocket.includes("lga");

          if (!isCompatible) {
            state.selectedParts.motherboard = null;
          }
        }
      } else {
        state.selectedParts[category] = part;
      }
    },
    removePart: (state, action) => {
      const { category, part } = action.payload;

      if (category === "ram") {
        state.selectedParts.ram = state.selectedParts.ram.filter(
          (id) => id !== part
        );
      } else {
        state.selectedParts[category] = null;
      }
    },
    clearBuild: (state) => {
      state.selectedParts = {
        cpu: null,
        motherboard: null,
        gpu: null,
        ram: [],
        storage: null,
        psu: null,
        case: null,
        cooler: null,
        monitor: null,
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
