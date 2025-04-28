import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedParts: {
    cpu: null,
    gpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    psu: null,
    case: null,
  },
};

export const buildSlice = createSlice({
  name: "build",
  initialState,
  reducers: {
    selectPart: (state, action) => {
      const { category, part } = action.payload;
      state.selectedParts[category] = part;
    },
    clearBuild: (state) => {
      state.selectedParts = initialState.selectedParts;
    },
  },
});

export const { selectPart, clearBuild } = buildSlice.actions;
export default buildSlice.reducer;
