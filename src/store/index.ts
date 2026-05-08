import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import sysAdminReducer from "./slices/sysAdminSlice";
import orgAdminReducer from "./slices/orgAdminSlice";
import orgHeadReducer from "./slices/orgHeadSlice";
import deptHeadReducer from "./slices/deptHeadSlice";
import deptAdminReducer from "./slices/deptAdminSlice";
import notificationsReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sysAdmin: sysAdminReducer,
    orgAdmin: orgAdminReducer,
    orgHead: orgHeadReducer,
    deptHead: deptHeadReducer,
    deptAdmin: deptAdminReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
