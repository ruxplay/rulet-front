// src/models/SystemConfig.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@src/config/database';

export interface SystemConfigAttributes {
  id: number;
  key: string;
  value: string;
  description?: string | null;
  category: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isEditable: boolean;
  validationRules?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemConfigCreationAttributes extends Optional<SystemConfigAttributes, 'id' | 'description' | 'validationRules' | 'createdAt' | 'updatedAt'> {}

class SystemConfig extends Model<SystemConfigAttributes, SystemConfigCreationAttributes> implements SystemConfigAttributes {
  public id!: number;
  public key!: string;
  public value!: string;
  public description!: string | null;
  public category!: string;
  public dataType!: 'string' | 'number' | 'boolean' | 'json';
  public isEditable!: boolean;
  public validationRules!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SystemConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    dataType: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      allowNull: false,
      field: 'data_type',
    },
    isEditable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_editable',
    },
    validationRules: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'validation_rules',
    },
  },
  {
    sequelize,
    tableName: 'system_config',
    timestamps: true,
    underscored: true,
  }
);

export default SystemConfig;

