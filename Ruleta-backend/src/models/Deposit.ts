// src/models/Deposit.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@src/config/database';

export interface DepositAttributes {
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
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentMethod: 'bank_transfer' | 'usdt';
  usdtAmount?: number | null;
  exchangeRate?: number | null;
  walletAddress?: string | null;
  transactionHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date | null;
  processedBy?: string | null;
  notes?: string | null;
}

export interface DepositCreationAttributes extends Optional<DepositAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'processedAt' | 'processedBy' | 'notes' | 'fullName' | 'usdtAmount' | 'exchangeRate' | 'walletAddress' | 'transactionHash'> {}

class Deposit extends Model<DepositAttributes, DepositCreationAttributes> implements DepositAttributes {
  public id!: number;
  public username!: string;
  public fullName!: string | null;
  public amount!: number;
  public reference!: string;
  public bank!: string;
  public receiptUrl!: string;
  public receiptPublicId!: string;
  public receiptFormat!: string;
  public receiptBytes!: number;
  public status!: 'pending' | 'approved' | 'rejected' | 'completed';
  public paymentMethod!: 'bank_transfer' | 'usdt';
  public usdtAmount!: number | null;
  public exchangeRate!: number | null;
  public walletAddress!: string | null;
  public transactionHash!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
  public processedAt?: Date | null;
  public processedBy?: string | null;
  public notes?: string | null;
}

Deposit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: 'full_name',
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    bank: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    receiptUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'receipt_url',
    },
    receiptPublicId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'receipt_public_id',
    },
    receiptFormat: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'receipt_format',
    },
    receiptBytes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'receipt_bytes',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.ENUM('bank_transfer', 'usdt'),
      allowNull: false,
      defaultValue: 'bank_transfer',
      field: 'payment_method',
    },
    usdtAmount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
      field: 'usdt_amount',
    },
    exchangeRate: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      field: 'exchange_rate',
    },
    walletAddress: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'wallet_address',
    },
    transactionHash: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'transaction_hash',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'processed_at',
    },
    processedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'processed_by',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'deposits',
    timestamps: true,
    underscored: true,
  }
);

export default Deposit;


