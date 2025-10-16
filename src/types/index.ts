export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    balance: number | string;
    wins: number;
    losses: number;
    role: 'user' | 'admin';
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }
  
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===== TIPOS PARA RULETA =====

export type RouletteType = '150' | '300';
export type RouletteStatus = 'open' | 'spinning' | 'closed';

export interface RouletteSector {
  username: string;
  bet: number;
  sectorIndex: number;
}

export interface RouletteMesa {
  mesaId: string;
  status: RouletteStatus;
  filledCount: number;
  sectors: Array<RouletteSector | null>;
  houseEarnings: number;
}

export interface RouletteWinner {
  username: string;
  bet: number;
  prize: number;
  index: number;
}

export interface RouletteWinners {
  mesaId: string;
  seed: string;
  main: RouletteWinner;
  left: RouletteWinner;
  right: RouletteWinner;
  totals: {
    totalApostado: number;
    premioPrincipal: number;
    premioSecundario: number;
    gananciasCasa: number;
    percentages: {
      main: number;
      secondary: number;
      house: number;
    };
  };
  house: {
    percentage: number;
    amount: number;
  };
}

export interface PlaceBetRequest {
  username: string;
  sectorIndex: number;
}

export interface PlaceBetResponse {
  mesaId: string;
  filledCount: number;
  status: RouletteStatus;
  balance?: number | string; // Balance actualizado después de la apuesta
}

export interface SpinMesaRequest {
  mesaId: string;
}

export interface SpinMesaResponse {
  mesaId: string;
  winners: RouletteWinners;
  finalRotation: number;
  normalizedRotation: number;
}

export interface AdvanceMesaRequest {
  closedMesaId?: string;
}

export interface AdvanceMesaResponse {
  currentMesaId: string;
  nextMesaId: string;
}

export interface RouletteHouseReport {
  type: RouletteType;
  dateFrom: Date;
  dateTo: Date;
  totalHouse: number;
  mesas: number;
}

export interface RouletteWinnerHistory {
  mesaId: string;
  type: RouletteType;
  closedAt: Date;
  winners: RouletteWinners;
  houseEarnings: number;
}

// ===== EVENTOS SSE =====

export interface RouletteEvent<T = unknown> {
  type: string;
  payload: T;
}

// Evento SSE para balance de usuario actualizado
export interface UserBalanceUpdatedEvent {
  type: 'user.balance.updated';
  payload: {
    username: string;
    balance: number | string;
    reason?: 'bet' | 'spin_prize' | 'deposit' | 'withdrawal' | string;
    type?: RouletteType;
    prize?: number;
  };
}

export interface RouletteSnapshotEvent {
  type: 'snapshot';
  payload: {
    '150'?: { type: '150'; mesa: RouletteMesa | null };
    '300'?: { type: '300'; mesa: RouletteMesa | null };
  };
}

export interface RouletteBetPlacedEvent {
  type: 'bet.placed';
  payload: {
    type: RouletteType;
    mesaId: string;
    username: string;
    sectorIndex: number;
    bet: number;
    filledCount: number;
    status: RouletteStatus;
  };
}

export interface RouletteMesaSpinningEvent {
  type: 'mesa.spinning';
  payload: {
    type: RouletteType;
    mesaId: string;
  };
}

export interface RouletteMesaClosedEvent {
  type: 'mesa.closed';
  payload: {
    type: RouletteType;
    mesaId: string;
    winners: RouletteWinners;
    finalRotation: number;
    normalizedRotation: number;
  };
}

export interface RouletteMesaAdvancedEvent {
  type: 'mesa.advanced';
  payload: {
    type: RouletteType;
    currentMesaId: string;
    nextMesaId: string;
  };
}

export interface RouletteMesaUpdatedEvent {
  type: 'mesa.updated';
  payload: {
    type: RouletteType;
    mesaId: string;
    filledCount: number;
  };
}