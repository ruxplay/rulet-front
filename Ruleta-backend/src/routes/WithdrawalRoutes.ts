// src/routes/WithdrawalRoutes.ts
import { Router } from 'express';
import {
  createWithdrawal,
  getWithdrawalsByUsername,
  getPendingWithdrawals,
  updateWithdrawalStatus,
  getAllWithdrawals
} from '@src/services/WithdrawalService';
import { CreateWithdrawalSchema, UpdateWithdrawalStatusSchema } from '@src/validators/WithdrawalValidator';

const router = Router();

// Crear solicitud de retiro
router.post('/request', async (req, res) => {
  try {
    const payload = CreateWithdrawalSchema.parse(req.body);
    const withdrawal = await createWithdrawal(payload);
    return res.status(201).json({ withdrawal });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Obtener retiros de un usuario
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const withdrawals = await getWithdrawalsByUsername(username);
    return res.status(200).json({ withdrawals });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Obtener retiros pendientes (admin)
router.get('/pending', async (req, res) => {
  try {
    const withdrawals = await getPendingWithdrawals();
    return res.status(200).json({ withdrawals });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Obtener todos los retiros (admin)
router.get('/all', async (req, res) => {
  try {
    const { status, username, dateFrom, dateTo } = req.query;
    const filters: any = {};
    if (status) filters.status = status as string;
    if (username) filters.username = username as string;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);

    const withdrawals = await getAllWithdrawals(filters);
    return res.status(200).json({ withdrawals });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Actualizar estado de retiro (admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = UpdateWithdrawalStatusSchema.parse(req.body);
    const withdrawal = await updateWithdrawalStatus(parseInt(id, 10), parsed);
    return res.status(200).json({ withdrawal });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

export default router;