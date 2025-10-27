// lib/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Slices
import authSlice from '../../store/slices/authSlice';

// RTK Query APIs
import { authApi } from '../../store/api/authApi';
import { userApi } from '../../store/api/userApi';
import { usersApi } from '../../store/api/usersApi';
import { depositApi } from '../../store/api/depositApi';
import { rouletteApi } from '../../store/api/rouletteApi';
import { adminDepositsApi } from '../../store/api/adminDepositsApi';
import { adminWithdrawalsApi } from '../../store/api/adminWithdrawalsApi';
import { withdrawalApi } from '../../store/api/withdrawalApi';

export const store = configureStore({
  reducer: {
    // Slices
    auth: authSlice,
    
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [depositApi.reducerPath]: depositApi.reducer,
    [rouletteApi.reducerPath]: rouletteApi.reducer,
    [adminDepositsApi.reducerPath]: adminDepositsApi.reducer,
    [adminWithdrawalsApi.reducerPath]: adminWithdrawalsApi.reducer,
    [withdrawalApi.reducerPath]: withdrawalApi.reducer,
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
    .concat(usersApi.middleware)
    .concat(depositApi.middleware)
    .concat(rouletteApi.middleware)
    .concat(adminDepositsApi.middleware)
    .concat(adminWithdrawalsApi.middleware)
    .concat(withdrawalApi.middleware),
});

// Configurar listeners para RTK Query
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
