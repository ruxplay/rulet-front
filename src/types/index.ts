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
    balance: string;        // Balance actualizado
    blockedBalance?: string; // Balance bloqueado (para retiros)
    losses: number;         // Pérdidas totales
    wins: number;          // Victorias totales
    reason: 'deposit_approved' | 'bet' | 'spin_prize' | 'withdrawal_approved' | 'withdrawal_rejected' | string;
    
    // Solo para depósitos
    depositId?: number;
    depositAmount?: number;
    
    // Solo para apuestas
    betAmount?: number;
    type?: '150' | '300';
    
    // Solo para premios
    prize?: number;
    
    // Solo para retiros
    withdrawalId?: number;
    withdrawalAmount?: number;
  };
}

// ===== EVENTOS SSE PARA DEPÓSITOS =====

export type DepositPaymentMethod = 'bank_transfer' | 'usdt' | 'pago_movil';
export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositEventPayload {
  id: number;
  username: string;
  fullName?: string | null;
  amount: number;
  reference: string;
  bank: string;
  receiptUrl: string;
  receiptPublicId: string;
  receiptFormat: string;
  receiptBytes: number;
  status: DepositStatus;
  paymentMethod: DepositPaymentMethod;
  usdtAmount?: number | null;
  exchangeRate?: number | null;
  walletAddress?: string | null;
  transactionHash?: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt?: string | null;
  processedBy?: string | null;
  notes?: string | null;
}

export interface DepositCreatedEvent {
  type: 'deposit.created';
  payload: DepositEventPayload;
}

export interface DepositApprovedEvent {
  type: 'deposit.approved';
  payload: DepositEventPayload;
}

export interface DepositRejectedEvent {
  type: 'deposit.rejected';
  payload: DepositEventPayload;
}

export interface DepositStatusChangedEvent {
  type: 'deposit.status_changed';
  payload: {
    deposit: DepositEventPayload;
    oldStatus: DepositStatus;
    newStatus: DepositStatus;
  };
}

// ===== EVENTOS SSE PARA RETIROS =====

export interface WithdrawalEventPayload {
  id: number;
  username: string;
  cedula: string;
  telefono: string;
  banco: string;
  monto: number;
  status: WithdrawalStatus;
  payment_method: WithdrawalPaymentMethod;
  createdAt: string;
  updatedAt: string;
  processedAt?: string | null;
  processedBy?: string | null;
  notes?: string | null;
}

export interface WithdrawalCreatedEvent {
  type: 'withdrawal.created';
  payload: WithdrawalEventPayload;
}

export interface WithdrawalApprovedEvent {
  type: 'withdrawal.approved';
  payload: WithdrawalEventPayload;
}

export interface WithdrawalRejectedEvent {
  type: 'withdrawal.rejected';
  payload: WithdrawalEventPayload;
}

export interface WithdrawalStatusChangedEvent {
  type: 'withdrawal.status_changed';
  payload: {
    withdrawal: WithdrawalEventPayload;
    oldStatus: WithdrawalStatus;
    newStatus: WithdrawalStatus;
  };
}

// Eventos SSE para ruleta física
export interface MesaWaitingForResultEvent {
  type: 'mesa.waiting_for_result';
  payload: {
    mesaId: string;
    type: RouletteType;
    filledCount: number;
    status: 'waiting_for_result';
  };
}

export interface MesaResultSubmittedEvent {
  type: 'mesa.result_submitted';
  payload: {
    mesaId: string;
    type: RouletteType;
    winningSector: number;
    operatorId: string;
    timestamp: string;
  };
}

// Request para enviar resultado de ruleta física
export interface SubmitSpinResultRequest {
  mesaId: string;
  winningSector: number;
  operatorId: string;
  timestamp: string;
}

// Response del submit-result
export interface SubmitSpinResultResponse {
  success: boolean;
  mesaId: string;
  winningSector: number;
  message: string;
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

// ===== TIPOS PARA RETIROS (WITHDRAWALS) =====

export type WithdrawalPaymentMethod = 'usdt' | 'bank_transfer' | 'pago_movil';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface Withdrawal {
  id: number;
  username: string;
  cedula: string;
  telefono: string;
  banco: string;
  monto: number;
  payment_method: WithdrawalPaymentMethod;
  status: WithdrawalStatus;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  processedBy: string | null;
  notes: string | null;
}

export interface CreateWithdrawalRequest {
  username: string;
  cedula: string;
  telefono: string;
  banco: string;
  monto: number;
  payment_method: WithdrawalPaymentMethod;
}

export interface CreateWithdrawalResponse {
  withdrawal: Withdrawal;
}

export interface WithdrawalEligibilityResponse {
  eligible: boolean;
  allowedMethods?: string[];
  balance?: number;
  blockedBalance?: number;
  availableBalance?: number;
  wins?: number;
  reason?: string;
}

export interface AllowedMethodsResponse {
  allowedMethods: WithdrawalPaymentMethod[];
}

export interface GetWithdrawalsResponse {
  withdrawals: Withdrawal[];
}