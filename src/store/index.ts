import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// Example slice can be added here and combined in reducer
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
