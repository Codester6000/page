import { configureStore } from "@reduxjs/toolkit";
import buildReducer from "./slices/buildSlice"; // Solo una importación

export const store = configureStore({
  reducer: {
    build: buildReducer,
  },
});
