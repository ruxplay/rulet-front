import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role?: 'user' | 'admin';
  balance?: number | string; // Balance puede venir como string desde el backend
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ✅ Establece usuario y limpia errores previos
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    // 🚪 Limpia completamente el estado de sesión
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    // ⏳ Control del estado de carga
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // ⚠️ Manejo de errores
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // 🧹 Limpia el error sin tocar sesión
    clearError: (state) => {
      state.error = null;
    },

    // 🔄 Actualiza solo el balance del usuario autenticado
    updateUserBalance: (state, action: PayloadAction<number | string>) => {
      if (state.user) {
        state.user.balance = action.payload;
      }
    },
  },
});

export const { setUser, clearUser, setLoading, setError, clearError, updateUserBalance } = authSlice.actions;
export default authSlice.reducer;
