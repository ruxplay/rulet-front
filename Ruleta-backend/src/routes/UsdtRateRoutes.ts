// src/routes/UsdtRateRoutes.ts
import { Router } from 'express';
import { CreateUsdtRateSchema, UpdateUsdtRateSchema, UsdtRateQuerySchema } from '@src/validators/UsdtRateValidator';
import {
  createUsdtRate,
  getCurrentUsdtRate,
  getUsdtRateHistory,
  updateUsdtRate,
  updateRateFromAPI,
  getRateStatus,
} from '@src/services/UsdtRateService';

const router = Router();

// Get current USDT rate (public endpoint)
router.get('/current', async (req, res) => {
  try {
    const rateStatus = await getRateStatus();
    return res.status(200).json(rateStatus);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Get rate history (admin)
router.get('/history', async (req, res) => {
  try {
    const filters = UsdtRateQuerySchema.parse(req.query);
    const rates = await getUsdtRateHistory(filters);
    return res.status(200).json({ rates });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Create manual rate (admin)
router.post('/', async (req, res) => {
  try {
    const payload = CreateUsdtRateSchema.parse(req.body);
    const rate = await createUsdtRate(payload);
    return res.status(201).json({ rate });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Update rate (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = UpdateUsdtRateSchema.parse(req.body);
    const rate = await updateUsdtRate(parseInt(id, 10), payload);
    return res.status(200).json({ rate });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Force rate update from API (admin)
router.post('/update-from-api', async (req, res) => {
  try {
    const rate = await updateRateFromAPI();
    if (!rate) {
      return res.status(400).json({ error: 'No se pudo obtener la tasa desde las APIs' });
    }
    return res.status(200).json({ rate });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
