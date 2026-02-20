import { configureStore } from "@reduxjs/toolkit";

// Example slice can be added here and combined in reducer
export const store = configureStore({
  reducer: {},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
