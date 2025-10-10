// src/services/DepositService.ts
import Deposit, { DepositAttributes } from '@src/models/Deposit';
import SqlUser from '@src/models/SqlUser';
import '@src/models/associations';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '@src/config/database';
import { CreateDepositInput, UpdateDepositStatusInput } from '@src/validators/DepositValidator';
import { getCurrentUsdtRate } from './UsdtRateService';

export const createDeposit = async (data: CreateDepositInput): Promise<DepositAttributes> => {
  const { 
    username, 
    amount, 
    reference, 
    bank, 
    receiptUrl, 
    receiptPublicId, 
    receiptFormat, 
    receiptBytes,
    paymentMethod,
    usdtAmount,
    exchangeRate,
    walletAddress,
    transactionHash
  } = data;

  const user = await SqlUser.findOne({ where: { username } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Validación especial para depósitos USDT
  let finalAmount = amount;
  let finalExchangeRate = exchangeRate;
  let finalUsdtAmount = usdtAmount;

  if (paymentMethod === 'usdt') {
    // Obtener tasa actual de la API
    const currentRate = await getCurrentUsdtRate();
    if (!currentRate) {
      throw new Error('No se pudo obtener la tasa actual de USDT. Intente más tarde.');
    }

    const realRate = Number(currentRate.rate);
    const frontendRate = Number(exchangeRate);
    const frontendUsdtAmount = Number(usdtAmount);

    // Validar que la tasa del frontend no difiera más del 5% de la tasa real
    const rateDifference = Math.abs(realRate - frontendRate) / realRate * 100;
    if (rateDifference > 5) {
      throw new Error(`La tasa de cambio enviada (${frontendRate}) difiere demasiado de la tasa actual (${realRate}). Diferencia: ${rateDifference.toFixed(2)}%`);
    }

    // Recalcular amount con la tasa real de la API
    finalAmount = frontendUsdtAmount * realRate;
    finalExchangeRate = realRate;
    finalUsdtAmount = frontendUsdtAmount;

    console.log(`✅ Depósito USDT validado: ${frontendUsdtAmount} USDT × ${realRate} BS/USDT = ${finalAmount} BS`);
  }

  const deposit = await Deposit.create({
    username,
    fullName: user.fullName,
    amount: finalAmount,
    reference,
    bank,
    receiptUrl,
    receiptPublicId,
    receiptFormat,
    receiptBytes,
    paymentMethod,
    usdtAmount: finalUsdtAmount,
    exchangeRate: finalExchangeRate,
    walletAddress,
    transactionHash,
    status: 'pending',
  });

  return deposit.toJSON();
};

export const getDepositsByUsername = async (username: string): Promise<DepositAttributes[]> => {
  const deposits = await Deposit.findAll({
    where: { username },
    order: [['createdAt', 'DESC']],
  });
  return deposits.map(d => d.toJSON());
};

export const getPendingDeposits = async (): Promise<DepositAttributes[]> => {
  const deposits = await Deposit.findAll({
    where: { status: 'pending' },
    include: [{ model: SqlUser, as: 'user', attributes: ['fullName', 'email'] }],
    order: [['createdAt', 'ASC']],
  });
  return deposits.map(d => d.toJSON());
};

export const getAllDeposits = async (filters?: {
  status?: string;
  username?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<DepositAttributes[]> => {
  const whereClause: any = {};
  if (filters?.status) whereClause.status = filters.status;
  if (filters?.username) whereClause.username = { [Op.like]: `%${filters.username}%` };
  if (filters?.dateFrom || filters?.dateTo) {
    whereClause.createdAt = {};
    if (filters.dateFrom) whereClause.createdAt[Op.gte] = filters.dateFrom;
    if (filters.dateTo) whereClause.createdAt[Op.lte] = filters.dateTo;
  }

  const deposits = await Deposit.findAll({
    where: whereClause,
    include: [{ model: SqlUser, as: 'user', attributes: ['fullName', 'email'] }],
    order: [['createdAt', 'DESC']],
  });
  return deposits.map(d => d.toJSON());
};

export const updateDepositStatus = async (
  depositId: number,
  data: UpdateDepositStatusInput
): Promise<DepositAttributes> => {
  const { status, processedBy, notes } = data;

  return await sequelize.transaction(async (t: Transaction) => {
    const deposit = await Deposit.findByPk(depositId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!deposit) {
      throw new Error('Depósito no encontrado');
    }

    if (deposit.status !== 'pending') {
      throw new Error('Solo se pueden procesar depósitos pendientes');
    }

    if (status === 'approved') {
      const user = await SqlUser.findOne({ where: { username: deposit.username }, transaction: t, lock: t.LOCK.UPDATE });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const newBalance = (Number(user.balance) + Number(deposit.amount)).toString();
      await user.update({ balance: newBalance }, { transaction: t });
    }

    await deposit.update(
      {
        status,
        processedBy,
        processedAt: new Date(),
        notes: notes ?? '',
      },
      { transaction: t }
    );

    return deposit.toJSON();
  });
};


