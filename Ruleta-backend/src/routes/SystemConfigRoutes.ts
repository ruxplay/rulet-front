// src/routes/SystemConfigRoutes.ts
import { Router } from 'express';
import { 
  CreateSystemConfigSchema, 
  UpdateSystemConfigSchema, 
  SystemConfigQuerySchema,
  BulkUpdateSystemConfigSchema 
} from '@src/validators/SystemConfigValidator';
import {
  createSystemConfig,
  getAllSystemConfigs,
  getSystemConfigByKey,
  updateSystemConfig,
  bulkUpdateSystemConfigs,
  deleteSystemConfig,
  getSystemConfigValue,
  getSystemConfigsByCategory,
  CONFIG_CATEGORIES
} from '@src/services/SystemConfigService';

const router = Router();

// Get all configurations (admin)
router.get('/', async (req, res) => {
  try {
    const filters = SystemConfigQuerySchema.parse(req.query);
    const configs = await getAllSystemConfigs(filters);
    return res.status(200).json({ configs });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Get configuration by key (admin)
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const config = await getSystemConfigByKey(key);
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    return res.status(200).json({ config });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Get configuration value (public, parsed)
router.get('/:key/value', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await getSystemConfigValue(key);
    return res.status(200).json({ key, value });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Get configurations by category (admin)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const configs = await getSystemConfigsByCategory(category);
    return res.status(200).json({ category, configs });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Create new configuration (admin)
router.post('/', async (req, res) => {
  try {
    const payload = CreateSystemConfigSchema.parse(req.body);
    const config = await createSystemConfig(payload);
    return res.status(201).json({ config });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Update configuration (admin)
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const payload = UpdateSystemConfigSchema.parse(req.body);
    const config = await updateSystemConfig(key, payload);
    return res.status(200).json({ config });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Bulk update configurations (admin)
router.put('/bulk', async (req, res) => {
  try {
    const payload = BulkUpdateSystemConfigSchema.parse(req.body);
    const configs = await bulkUpdateSystemConfigs(payload);
    return res.status(200).json({ configs });
  } catch (error: any) {
    const message = error?.issues ? JSON.stringify(error.issues) : error.message;
    return res.status(400).json({ error: message });
  }
});

// Delete configuration (admin)
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    await deleteSystemConfig(key);
    return res.status(200).json({ message: 'Configuration deleted successfully' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// Get available categories (admin)
router.get('/meta/categories', async (req, res) => {
  try {
    return res.status(200).json({ categories: CONFIG_CATEGORIES });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
