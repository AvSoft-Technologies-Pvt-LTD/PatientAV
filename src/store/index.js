import { configureStore } from '@reduxjs/toolkit';
import healthDataReducer from './slices/healthDataSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    healthData: healthDataReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store; 