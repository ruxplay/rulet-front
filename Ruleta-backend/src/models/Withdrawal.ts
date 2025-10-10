// src/models/Withdrawal.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@src/config/database';

export interface WithdrawalAttributes {
  id: number;
  username: string;
  cedula: string;
  telefono: string;
  banco: string;
  monto: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  notes?: string;
}

export interface WithdrawalCreationAttributes extends Optional<WithdrawalAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Withdrawal extends Model<WithdrawalAttributes, WithdrawalCreationAttributes> implements WithdrawalAttributes {
  public id!: number;
  public username!: string;
  public cedula!: string;
  public telefono!: string;
  public banco!: string;
  public monto!: number;
  public status!: 'pending' | 'approved' | 'rejected' | 'completed';
  public createdAt!: Date;
  public updatedAt!: Date;
  public processedAt?: Date;
  public processedBy?: string;
  public notes?: string;
}

Withdrawal.init(
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
    cedula: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    banco: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'withdrawals',
    timestamps: true,
  }
);

export default Withdrawal;