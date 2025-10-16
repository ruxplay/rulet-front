// lib/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Slices
import authSlice from '../../store/slices/authSlice';

// RTK Query APIs
import { authApi } from '../../store/api/authApi';
import { userApi } from '../../store/api/userApi';
import { depositApi } from '../../store/api/depositApi';
import { rouletteApi } from '../../store/api/rouletteApi';

export const store = configureStore({
  reducer: {
    // Slices
    auth: authSlice,
    
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [depositApi.reducerPath]: depositApi.reducer,
    [rouletteApi.reducerPath]: rouletteApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignorar acciones de RTK Query
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
      },
    })
    .concat(authApi.middleware)
    .concat(userApi.middleware)
    .concat(depositApi.middleware)
    .concat(rouletteApi.middleware),
});

// Configurar listeners para RTK Query
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
