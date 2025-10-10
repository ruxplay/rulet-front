// src/routes/DepositRoutes.ts
import { Router } from 'express';
import { CreateDepositSchema, UpdateDepositStatusSchema } from '@src/validators/DepositValidator';
import { createDeposit, getDepositsByUsername, getPendingDeposits, getAllDeposits, updateDepositStatus } from '@src/services/DepositService';
import { getCurrentUsdtRate } from '@src/services/UsdtRateService';

const router = Router();

// Crear depósito
router.post('/', async (req, res) => {
  try {
    const payload = CreateDepositSchema.parse(req.body);
    const deposit = await createDeposit(payload);
    return res.status(201).json({ deposit });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Obtener depósitos por usuario
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const deposits = await getDepositsByUsername(username);
    return res.status(200).json({ deposits });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Pendientes (admin)
router.get('/pending', async (_req, res) => {
  try {
    const deposits = await getPendingDeposits();
    return res.status(200).json({ deposits });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Todos (admin) con filtros
router.get('/all', async (req, res) => {
  try {
    const { status, username, dateFrom, dateTo } = req.query;
    const filters: any = {};
    if (status) filters.status = status as string;
    if (username) filters.username = username as string;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);

    const deposits = await getAllDeposits(filters);
    return res.status(200).json({ deposits });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Actualizar estado (admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = UpdateDepositStatusSchema.parse(req.body);
    const deposit = await updateDepositStatus(parseInt(id, 10), parsed);
    return res.status(200).json({ deposit });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Endpoint de prueba para validar tasas USDT
router.get('/test-usdt-rate', async (req, res) => {
  try {
    const currentRate = await getCurrentUsdtRate();
    if (!currentRate) {
      return res.status(400).json({ error: 'No hay tasa USDT disponible' });
    }

    const testUsdtAmount = 10; // 10 USDT de prueba
    const calculatedAmount = testUsdtAmount * Number(currentRate.rate);

    return res.status(200).json({
      message: 'Tasa USDT obtenida correctamente',
      currentRate: {
        rate: currentRate.rate,
        source: currentRate.source,
        createdAt: currentRate.createdAt
      },
      testCalculation: {
        usdtAmount: testUsdtAmount,
        exchangeRate: currentRate.rate,
        calculatedAmount: calculatedAmount,
        formula: `${testUsdtAmount} USDT × ${currentRate.rate} BS/USDT = ${calculatedAmount} BS`
      }
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;


