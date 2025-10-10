import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@src/config/database';

export interface IUserAttributes {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string | null;
  balance: string; // DECIMAL como string
  wins: number;
  losses: number;
  role: 'user'|'admin';
  lastLogin?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserCreation = Optional<
  IUserAttributes,
  'id'|'phone'|'balance'|'wins'|'losses'|'role'|'lastLogin'|'createdAt'|'updatedAt'
>;

export class SqlUser extends Model<IUserAttributes, IUserCreation> implements IUserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public passwordHash!: string;
  public fullName!: string;
  public phone!: string | null;
  public balance!: string;
  public wins!: number;
  public losses!: number;
  public role!: 'user'|'admin';
  public lastLogin!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SqlUser.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING(100), allowNull: false, field: 'password_hash' },
    fullName: { type: DataTypes.STRING(120), allowNull: false, field: 'full_name' },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    balance: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: '0' },
    wins: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    losses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    role: { type: DataTypes.ENUM('user','admin'), allowNull: false, defaultValue: 'user' },
    lastLogin: { type: DataTypes.DATE, allowNull: true, field: 'last_login' },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
  },
  { sequelize, tableName: 'users', modelName: 'User', timestamps: true, underscored: true }
);

export default SqlUser;