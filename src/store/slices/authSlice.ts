import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role?: 'user' | 'admin';
  balance?: number | string; // Balance puede venir como string desde el backend
  wins?: number; // Total de ganancias
  losses?: number; // Total de pérdidas
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
      state.user = {
        ...action.payload,
        wins: action.payload.wins || 0, // Inicializar wins si no existe
        losses: action.payload.losses || 0, // Inicializar losses si no existe
      };
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
      console.log('🔄 updateUserBalance ejecutado:', action.payload);
      if (state.user) {
        state.user.balance = action.payload;
        console.log('✅ Balance actualizado en Redux:', state.user.balance);
      }
    },

    // 🏆 Actualiza ganancias del usuario
    updateUserWins: (state, action: PayloadAction<number>) => {
      console.log('🏆 updateUserWins ejecutado:', action.payload);
      if (state.user) {
        state.user.wins = (state.user.wins || 0) + action.payload;
        console.log('✅ Wins actualizado en Redux:', state.user.wins);
      }
    },

    // 💸 Actualiza pérdidas del usuario
    updateUserLosses: (state, action: PayloadAction<number>) => {
      console.log('💸 updateUserLosses ejecutado:', action.payload);
      if (state.user) {
        state.user.losses = (state.user.losses || 0) + action.payload;
        console.log('✅ Losses actualizado en Redux:', state.user.losses);
      }
    },

    // 🔧 Inicializa campos wins y losses si no existen
    initializeUserStats: (state) => {
      if (state.user) {
        if (state.user.wins === undefined) {
          state.user.wins = 0;
        }
        if (state.user.losses === undefined) {
          state.user.losses = 0;
        }
        console.log('🔧 Stats inicializados:', { wins: state.user.wins, losses: state.user.losses });
      }
    },

    // 🔄 Actualiza múltiples campos del usuario de una vez
    updateUserStats: (state, action: PayloadAction<{ balance?: number | string; wins?: number; losses?: number }>) => {
      console.log('🔧 updateUserStats ejecutado:', action.payload);
      if (state.user) {
        if (action.payload.balance !== undefined) {
          state.user.balance = action.payload.balance;
          console.log('✅ Balance actualizado en Redux:', state.user.balance);
        }
        if (action.payload.wins !== undefined) {
          state.user.wins = action.payload.wins;
          console.log('✅ Wins actualizado en Redux:', state.user.wins);
        }
        if (action.payload.losses !== undefined) {
          state.user.losses = action.payload.losses;
          console.log('✅ Losses actualizado en Redux:', state.user.losses);
        }
      }
    },
  },
});

export const { setUser, clearUser, setLoading, setError, clearError, updateUserBalance, updateUserWins, updateUserLosses, initializeUserStats, updateUserStats } = authSlice.actions;
export default authSlice.reducer;
