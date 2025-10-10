// src/models/UsdtRate.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@src/config/database';

export interface UsdtRateAttributes {
  id: number;
  rate: number;
  source: 'binance' | 'coingecko' | 'manual';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface UsdtRateCreationAttributes extends Optional<UsdtRateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UsdtRate extends Model<UsdtRateAttributes, UsdtRateCreationAttributes> implements UsdtRateAttributes {
  public id!: number;
  public rate!: number;
  public source!: 'binance' | 'coingecko' | 'manual';
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UsdtRate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rate: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
    },
    source: {
      type: DataTypes.ENUM('binance', 'coingecko', 'manual'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'usdt_rates',
    timestamps: true,
    underscored: true,
  }
);

export default UsdtRate;
