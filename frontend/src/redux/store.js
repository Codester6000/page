import { configureStore } from "@reduxjs/toolkit";
import buildReducer from "./slices/buildSlice";

export const store = configureStore({
  reducer: {
    build: buildReducer,
  },
});
