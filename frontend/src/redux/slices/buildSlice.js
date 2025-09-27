import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productos: {
    procesadores: [],
    motherboards: [],
    gpus: [],
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
    storage: [],
    fuentes: null,
    case: null,
    cooler: null,
    monitor: null,
  },
  // Nueva información de compatibilidad
  compatibilidad: {
    socket_requerido: null,
    ram_requerida: null,
    consumo_total: 0,
    fuente_minima: 0,
  },
  // Estado de validación
  validationStatus: {
    isValid: true,
    errors: [],
    warnings: [],
    lastValidated: null,
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

    // Nueva acción para actualizar compatibilidad
    setCompatibilidad: (state, action) => {
      state.compatibilidad = {
        ...state.compatibilidad,
        ...action.payload,
      };
    },

    // Nueva acción para actualizar estado de validación
    setValidationStatus: (state, action) => {
      state.validationStatus = {
        ...state.validationStatus,
        ...action.payload,
        lastValidated: Date.now(),
      };
    },

    selectPart: (state, action) => {
      const { category, part } = action.payload;

      if (category === "ram") {
        if (state.selectedParts.ram.length < 4) {
          state.selectedParts.ram.push(part);
        }
      } else if (category === "storage") {
        if (state.selectedParts.storage.length < 4) {
          state.selectedParts.storage.push(part);
        }
      } else if (category === "cpu") {
        const previousCpu = state.selectedParts.cpu;
        state.selectedParts.cpu = part;

        // Lógica de compatibilidad mejorada para CPU
        const cpuSeleccionado = (state.productos.procesadores || []).find(
          (p) => p.id_producto === part
        );

        if (cpuSeleccionado) {
          const cpuNombre = cpuSeleccionado.nombre.toLowerCase();

          // Detectar socket del CPU
          let socketCpu = null;
          if (cpuNombre.includes("am4")) socketCpu = "am4";
          else if (cpuNombre.includes("am5")) socketCpu = "am5";
          else if (cpuNombre.includes("1200") || cpuNombre.includes("lga1200"))
            socketCpu = "1200";
          else if (cpuNombre.includes("1700") || cpuNombre.includes("lga1700"))
            socketCpu = "1700";
          else if (cpuNombre.includes("1151") || cpuNombre.includes("lga1151"))
            socketCpu = "1151";
          else if (cpuNombre.includes("1851") || cpuNombre.includes("lga1851"))
            socketCpu = "1851";

          // Actualizar compatibilidad requerida
          if (socketCpu) {
            state.compatibilidad.socket_requerido = socketCpu;
          }

          // Verificar compatibilidad con motherboard actual
          const motherActual = (state.productos.motherboards || []).find(
            (mb) => mb.id_producto === state.selectedParts.motherboard
          );

          if (motherActual && socketCpu) {
            const motherNombre = motherActual.nombre.toLowerCase();
            const motherCompatible = motherNombre.includes(socketCpu);

            // Si no es compatible, limpiar motherboard
            if (!motherCompatible) {
              state.selectedParts.motherboard = null;
            }
          }

          // Calcular consumo estimado del procesador
          let consumoEstimado = cpuSeleccionado.consumo || 0;
          if (consumoEstimado === 0) {
            // Estimación basada en el modelo
            if (cpuNombre.includes("ryzen") || cpuNombre.includes("core")) {
              if (cpuNombre.includes("9") || cpuNombre.includes("i9"))
                consumoEstimado = 210;
              else if (cpuNombre.includes("7") || cpuNombre.includes("i7"))
                consumoEstimado = 160;
              else if (cpuNombre.includes("5") || cpuNombre.includes("i5"))
                consumoEstimado = 90;
              else if (cpuNombre.includes("3") || cpuNombre.includes("i3"))
                consumoEstimado = 65;
              else consumoEstimado = 65;
            }
          }

          // Actualizar consumo total
          const consumoGpu = state.selectedParts.gpu
            ? (state.productos.gpus || []).find(
                (g) => g.id_producto === state.selectedParts.gpu
              )?.consumo || 0
            : 0;

          state.compatibilidad.consumo_total = consumoEstimado + consumoGpu;
          state.compatibilidad.fuente_minima = Math.ceil(
            state.compatibilidad.consumo_total * 1.85
          );
        }

        // Si cambió el CPU, limpiar estado de validación
        if (previousCpu !== part) {
          state.validationStatus.errors = [];
          state.validationStatus.warnings = [];
        }
      } else if (category === "motherboard") {
        const previousMotherboard = state.selectedParts.motherboard;
        state.selectedParts.motherboard = part;

        // Lógica de compatibilidad para motherboard
        const motherSeleccionada = (state.productos.motherboards || []).find(
          (mb) => mb.id_producto === part
        );

        if (motherSeleccionada) {
          const motherNombre = motherSeleccionada.nombre.toLowerCase();

          // Detectar socket de la motherboard
          let socketMother = null;
          if (motherNombre.includes("am4")) socketMother = "am4";
          else if (motherNombre.includes("am5")) socketMother = "am5";
          else if (
            motherNombre.includes("1200") ||
            motherNombre.includes("lga1200")
          )
            socketMother = "1200";
          else if (
            motherNombre.includes("1700") ||
            motherNombre.includes("lga1700")
          )
            socketMother = "1700";
          else if (
            motherNombre.includes("1151") ||
            motherNombre.includes("lga1151")
          )
            socketMother = "1151";
          else if (
            motherNombre.includes("1851") ||
            motherNombre.includes("lga1851")
          )
            socketMother = "1851";

          // Detectar tipo de RAM soportada
          let ramSoportada = null;
          if (motherNombre.includes("ddr5")) ramSoportada = "DDR5";
          else if (motherNombre.includes("ddr4")) ramSoportada = "DDR4";
          else if (motherNombre.includes("ddr3")) ramSoportada = "DDR3";

          // Actualizar compatibilidad requerida
          if (socketMother) {
            state.compatibilidad.socket_requerido = socketMother;
          }
          if (ramSoportada) {
            state.compatibilidad.ram_requerida = ramSoportada;
          }

          // Verificar compatibilidad con CPU actual
          const cpuActual = (state.productos.procesadores || []).find(
            (p) => p.id_producto === state.selectedParts.cpu
          );

          if (cpuActual && socketMother) {
            const cpuNombre = cpuActual.nombre.toLowerCase();
            const cpuCompatible = cpuNombre.includes(socketMother);

            // Si no es compatible, limpiar CPU
            if (!cpuCompatible) {
              state.selectedParts.cpu = null;
              state.compatibilidad.consumo_total = 0;
              state.compatibilidad.fuente_minima = 0;
            }
          }

          // Verificar compatibilidad con RAM actual
          if (ramSoportada && state.selectedParts.ram.length > 0) {
            const ramIncompatible = state.selectedParts.ram.some((ramId) => {
              const ramProducto = (state.productos.memorias || []).find(
                (r) => r.id_producto === ramId
              );
              if (ramProducto) {
                const ramNombre = ramProducto.nombre.toLowerCase();
                return !ramNombre.includes(ramSoportada.toLowerCase());
              }
              return false;
            });

            // Si hay RAM incompatible, limpiarla
            if (ramIncompatible) {
              state.selectedParts.ram = [];
            }
          }
        }

        // Si cambió la motherboard, limpiar estado de validación
        if (previousMotherboard !== part) {
          state.validationStatus.errors = [];
          state.validationStatus.warnings = [];
        }
      } else if (category === "gpu") {
        state.selectedParts.gpu = part;

        // Actualizar consumo total con GPU
        const gpuSeleccionada = (state.productos.gpus || []).find(
          (g) => g.id_producto === part
        );

        if (gpuSeleccionada) {
          const consumoGpu = gpuSeleccionada.consumo || 0;
          const cpuActual = (state.productos.procesadores || []).find(
            (p) => p.id_producto === state.selectedParts.cpu
          );

          let consumoCpu = 0;
          if (cpuActual) {
            consumoCpu = cpuActual.consumo || 0;
            if (consumoCpu === 0) {
              const cpuNombre = cpuActual.nombre.toLowerCase();
              if (cpuNombre.includes("9") || cpuNombre.includes("i9"))
                consumoCpu = 210;
              else if (cpuNombre.includes("7") || cpuNombre.includes("i7"))
                consumoCpu = 160;
              else if (cpuNombre.includes("5") || cpuNombre.includes("i5"))
                consumoCpu = 90;
              else if (cpuNombre.includes("3") || cpuNombre.includes("i3"))
                consumoCpu = 65;
              else consumoCpu = 65;
            }
          }

          state.compatibilidad.consumo_total = consumoCpu + consumoGpu;
          state.compatibilidad.fuente_minima = Math.ceil(
            state.compatibilidad.consumo_total * 1.85
          );
        }
      } else if (category === "psu") {
        state.selectedParts.psu = part;

        // Verificar si la fuente es suficiente
        const fuenteSeleccionada = (state.productos.fuentes || []).find(
          (f) => f.id_producto === part
        );

        if (fuenteSeleccionada && state.compatibilidad.fuente_minima > 0) {
          const potenciaFuente = fuenteSeleccionada.consumo || 0;

          if (potenciaFuente < state.compatibilidad.fuente_minima) {
            state.validationStatus.warnings = [
              `La fuente de ${potenciaFuente}W puede ser insuficiente. Se recomienda mínimo ${state.compatibilidad.fuente_minima}W`,
            ];
          } else {
            // Limpiar advertencias de fuente si ahora es suficiente
            state.validationStatus.warnings =
              state.validationStatus.warnings.filter(
                (w) => !w.includes("fuente")
              );
          }
        }
      } else {
        // Para otras categorías (case, cooler, monitor)
        state.selectedParts[category] = part;
      }
    },

    removePart: (state, action) => {
      const { category, part } = action.payload;

      if (category === "ram") {
        state.selectedParts.ram = state.selectedParts.ram.filter(
          (id) => id !== part
        );
      } else if (category === "storage") {
        state.selectedParts.storage = state.selectedParts.storage.filter(
          (id) => id !== part
        );
      } else {
        state.selectedParts[category] = null;
      }

      // Limpiar restricciones si se remueven componentes críticos
      if (category === "cpu") {
        state.compatibilidad.socket_requerido = null;
        state.compatibilidad.consumo_total = 0;
        state.compatibilidad.fuente_minima = 0;
      } else if (category === "motherboard") {
        state.compatibilidad.socket_requerido = null;
        state.compatibilidad.ram_requerida = null;
      } else if (category === "gpu") {
        // Recalcular consumo sin GPU
        const cpuActual = (state.productos.procesadores || []).find(
          (p) => p.id_producto === state.selectedParts.cpu
        );

        if (cpuActual) {
          let consumoCpu = cpuActual.consumo || 65;
          state.compatibilidad.consumo_total = consumoCpu;
          state.compatibilidad.fuente_minima = Math.ceil(consumoCpu * 1.85);
        } else {
          state.compatibilidad.consumo_total = 0;
          state.compatibilidad.fuente_minima = 0;
        }
      }

      // Limpiar errores y advertencias relacionados
      state.validationStatus.errors = [];
      state.validationStatus.warnings = [];
    },

    clearBuild: (state) => {
      state.selectedParts = {
        cpu: null,
        motherboard: null,
        gpu: null,
        ram: [],
        storage: [],
        psu: null,
        case: null,
        cooler: null,
        monitor: null,
      };
      state.compatibilidad = {
        socket_requerido: null,
        ram_requerida: null,
        consumo_total: 0,
        fuente_minima: 0,
      };
      state.validationStatus = {
        isValid: true,
        errors: [],
        warnings: [],
        lastValidated: null,
      };
      state.total = 0;
      state.watts = 0;
    },

    // Acción para validar configuración completa
    validateConfiguration: (state) => {
      const errors = [];
      const warnings = [];

      // Verificar componentes mínimos
      if (!state.selectedParts.cpu) {
        errors.push("Debe seleccionar un procesador");
      }
      if (!state.selectedParts.motherboard) {
        errors.push("Debe seleccionar una placa madre");
      }
      if (state.selectedParts.ram.length === 0) {
        warnings.push("Se recomienda seleccionar memoria RAM");
      }
      if (state.selectedParts.storage.length === 0) {
        warnings.push("Se recomienda seleccionar almacenamiento");
      }

      // Verificar compatibilidad de socket
      if (state.selectedParts.cpu && state.selectedParts.motherboard) {
        const cpu = (state.productos.procesadores || []).find(
          (p) => p.id_producto === state.selectedParts.cpu
        );
        const motherboard = (state.productos.motherboards || []).find(
          (mb) => mb.id_producto === state.selectedParts.motherboard
        );

        if (cpu && motherboard) {
          const cpuSocket = state.compatibilidad.socket_requerido;
          const mbNombre = motherboard.nombre.toLowerCase();

          if (cpuSocket && !mbNombre.includes(cpuSocket)) {
            errors.push(
              `El procesador (${cpuSocket}) no es compatible con la placa madre`
            );
          }
        }
      }

      // Verificar fuente
      if (state.selectedParts.psu && state.compatibilidad.fuente_minima > 0) {
        const fuente = (state.productos.fuentes || []).find(
          (f) => f.id_producto === state.selectedParts.psu
        );

        if (fuente) {
          const potencia = fuente.consumo || 0;
          if (potencia < state.compatibilidad.fuente_minima) {
            errors.push(
              `Fuente insuficiente: ${potencia}W < ${state.compatibilidad.fuente_minima}W requeridos`
            );
          }
        }
      }

      state.validationStatus = {
        isValid: errors.length === 0,
        errors,
        warnings,
        lastValidated: Date.now(),
      };
    },

    // Acción para cargar configuración guardada
    loadSavedConfiguration: (state, action) => {
      const savedConfig = action.payload;
      return {
        ...state,
        selectedParts: { ...savedConfig.selectedParts },
        compatibilidad: { ...savedConfig.compatibilidad },
        total: savedConfig.total || 0,
        watts: savedConfig.watts || 0,
      };
    },
  },
});

// Selectores mejorados
export const selectBuildSummary = (state) => ({
  selectedParts: state.build.selectedParts,
  total: state.build.total,
  watts: state.build.watts,
  compatibilidad: state.build.compatibilidad,
  validationStatus: state.build.validationStatus,
});

export const selectCompatibilityInfo = (state) => state.build.compatibilidad;

export const selectValidationStatus = (state) => state.build.validationStatus;

export const selectSelectedComponentsCount = (state) => {
  const { selectedParts } = state.build;
  let count = 0;

  Object.values(selectedParts).forEach((value) => {
    if (Array.isArray(value)) {
      count += value.length;
    } else if (value !== null) {
      count += 1;
    }
  });

  return count;
};

export const selectIsConfigurationValid = (state) => {
  const { selectedParts, validationStatus } = state.build;

  const hasRequiredComponents = selectedParts.cpu && selectedParts.motherboard;

  return hasRequiredComponents && validationStatus.isValid;
};

export const selectPowerRequirements = (state) => {
  const { watts, compatibilidad } = state.build;
  return {
    currentConsumption: watts,
    estimatedConsumption: compatibilidad.consumo_total,
    recommendedPSU: compatibilidad.fuente_minima,
    efficiency:
      compatibilidad.fuente_minima > 0
        ? (
            (compatibilidad.consumo_total / compatibilidad.fuente_minima) *
            100
          ).toFixed(1)
        : 0,
  };
};

export const {
  setProductos,
  setTotal,
  setWatts,
  setOrder,
  setCompatibilidad,
  setValidationStatus,
  selectPart,
  removePart,
  clearBuild,
  validateConfiguration,
  loadSavedConfiguration,
} = armadorSlice.actions;

export default armadorSlice.reducer;
