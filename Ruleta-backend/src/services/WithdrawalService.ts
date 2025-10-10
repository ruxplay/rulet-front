// src/services/WithdrawalService.ts
import Withdrawal, { WithdrawalAttributes } from '@src/models/Withdrawal';
import SqlUser from '@src/models/SqlUser';
import '@src/models/associations';
import { Op } from 'sequelize';
import { CreateWithdrawalInput, UpdateWithdrawalStatusInput } from '@src/validators/WithdrawalValidator';

export const createWithdrawal = async (data: CreateWithdrawalInput): Promise<WithdrawalAttributes> => {
  const { username, cedula, telefono, banco, monto } = data;

  // Validar que el usuario existe
  const user = await SqlUser.findOne({ where: { username } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Validar saldo suficiente
  if (Number(user.balance) < Number(monto)) {
    throw new Error('Saldo insuficiente');
  }

  // Validar monto mínimo
  if (monto < 150) {
    throw new Error('El monto mínimo para retirar es de 150 Bs');
  }

  // Verificar si ya tiene un retiro pendiente
  const pendingWithdrawal = await Withdrawal.findOne({
    where: {
      username,
      status: 'pending'
    }
  });

  if (pendingWithdrawal) {
    throw new Error('Ya tienes una solicitud de retiro en proceso');
  }

  // Crear el retiro
  const withdrawal = await Withdrawal.create({
    username,
    cedula,
    telefono,
    banco,
    monto,
    status: 'pending'
  });

  return withdrawal.toJSON();
};

export const getWithdrawalsByUsername = async (username: string): Promise<WithdrawalAttributes[]> => {
  const withdrawals = await Withdrawal.findAll({
    where: { username },
    order: [['createdAt', 'DESC']]
  });

  return withdrawals.map(w => w.toJSON());
};

export const getPendingWithdrawals = async (): Promise<WithdrawalAttributes[]> => {
  const withdrawals = await Withdrawal.findAll({
    where: { status: 'pending' },
    include: [{
      model: SqlUser,
      as: 'user',
      attributes: ['fullName', 'email']
    }],
    order: [['createdAt', 'ASC']]
  });

  return withdrawals.map(w => w.toJSON());
};

export const updateWithdrawalStatus = async (
  withdrawalId: number, 
  data: UpdateWithdrawalStatusInput
): Promise<WithdrawalAttributes> => {
  const { status, processedBy, notes } = data;

  const withdrawal = await Withdrawal.findByPk(withdrawalId);
  if (!withdrawal) {
    throw new Error('Retiro no encontrado');
  }

  if (withdrawal.status !== 'pending') {
    throw new Error('Solo se pueden procesar retiros pendientes');
  }

  // Si se aprueba, descontar del balance del usuario
  if (status === 'approved') {
    const user = await SqlUser.findOne({ where: { username: withdrawal.username } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (Number(user.balance) < Number(withdrawal.monto)) {
      throw new Error('El usuario no tiene suficiente saldo');
    }

    await user.update({
      balance: (Number(user.balance) - Number(withdrawal.monto)).toString()
    });
  }

  // Actualizar el retiro
  await withdrawal.update({
    status,
    processedBy,
    processedAt: new Date(),
    notes: notes ?? ''
  });

  return withdrawal.toJSON();
};

export const getAllWithdrawals = async (filters?: {
  status?: string;
  username?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<WithdrawalAttributes[]> => {
  const whereClause: any = {};

  if (filters?.status) {
    whereClause.status = filters.status;
  }

  if (filters?.username) {
    whereClause.username = { [Op.like]: `%${filters.username}%` };
  }

  if (filters?.dateFrom || filters?.dateTo) {
    whereClause.createdAt = {};
    if (filters.dateFrom) {
      whereClause.createdAt[Op.gte] = filters.dateFrom;
    }
    if (filters.dateTo) {
      whereClause.createdAt[Op.lte] = filters.dateTo;
    }
  }

  const withdrawals = await Withdrawal.findAll({
    where: whereClause,
    include: [{
      model: SqlUser,
      as: 'user',
      attributes: ['fullName', 'email']
    }],
    order: [['createdAt', 'DESC']]
  });

  return withdrawals.map(w => w.toJSON());
};