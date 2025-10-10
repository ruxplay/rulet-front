// src/services/SystemConfigService.ts
import SystemConfig, { SystemConfigAttributes } from '@src/models/SystemConfig';
import { Op } from 'sequelize';
import { 
  CreateSystemConfigInput, 
  UpdateSystemConfigInput, 
  SystemConfigQueryInput,
  BulkUpdateSystemConfigInput 
} from '@src/validators/SystemConfigValidator';

export const createSystemConfig = async (data: CreateSystemConfigInput): Promise<SystemConfigAttributes> => {
  const config = await SystemConfig.create(data);
  return config.toJSON();
};

export const getAllSystemConfigs = async (filters: SystemConfigQueryInput): Promise<SystemConfigAttributes[]> => {
  const { category, isEditable, limit, offset } = filters;
  
  const whereClause: any = {};
  if (category) whereClause.category = category;
  if (isEditable !== undefined) whereClause.isEditable = isEditable;

  const configs = await SystemConfig.findAll({
    where: whereClause,
    order: [['category', 'ASC'], ['key', 'ASC']],
    limit,
    offset,
  });

  return configs.map(config => config.toJSON());
};

export const getSystemConfigByKey = async (key: string): Promise<SystemConfigAttributes | null> => {
  const config = await SystemConfig.findOne({ where: { key } });
  return config ? config.toJSON() : null;
};

export const updateSystemConfig = async (key: string, data: UpdateSystemConfigInput): Promise<SystemConfigAttributes> => {
  const config = await SystemConfig.findOne({ where: { key } });
  if (!config) {
    throw new Error(`Configuration key '${key}' not found`);
  }

  if (!config.isEditable) {
    throw new Error(`Configuration key '${key}' is not editable`);
  }

  // Validate value based on data type
  const validatedValue = validateConfigValue(config.dataType, data.value, config.validationRules);
  
  await config.update({
    value: validatedValue,
    description: data.description ?? config.description,
    validationRules: data.validationRules ?? config.validationRules,
  });

  return config.toJSON();
};

export const bulkUpdateSystemConfigs = async (data: BulkUpdateSystemConfigInput): Promise<SystemConfigAttributes[]> => {
  const results: SystemConfigAttributes[] = [];
  
  for (const configData of data.configs) {
    const config = await SystemConfig.findOne({ where: { key: configData.key } });
    if (!config) {
      throw new Error(`Configuration key '${configData.key}' not found`);
    }

    if (!config.isEditable) {
      throw new Error(`Configuration key '${configData.key}' is not editable`);
    }

    const validatedValue = validateConfigValue(config.dataType, configData.value, config.validationRules);
    
    await config.update({ value: validatedValue });
    results.push(config.toJSON());
  }

  return results;
};

export const deleteSystemConfig = async (key: string): Promise<void> => {
  const config = await SystemConfig.findOne({ where: { key } });
  if (!config) {
    throw new Error(`Configuration key '${key}' not found`);
  }

  await config.destroy();
};

export const getSystemConfigValue = async (key: string, defaultValue?: any): Promise<any> => {
  const config = await SystemConfig.findOne({ where: { key } });
  if (!config) {
    return defaultValue;
  }

  return parseConfigValue(config.dataType, config.value);
};

export const getSystemConfigsByCategory = async (category: string): Promise<Record<string, any>> => {
  const configs = await SystemConfig.findAll({ 
    where: { category },
    order: [['key', 'ASC']]
  });

  const result: Record<string, any> = {};
  for (const config of configs) {
    result[config.key] = parseConfigValue(config.dataType, config.value);
  }

  return result;
};

// Helper functions
function validateConfigValue(dataType: string, value: string, validationRules?: string | null): string {
  switch (dataType) {
    case 'number':
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        throw new Error('Value must be a valid number');
      }
      
      if (validationRules) {
        const rules = JSON.parse(validationRules);
        if (rules.min !== undefined && numValue < rules.min) {
          throw new Error(`Value must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && numValue > rules.max) {
          throw new Error(`Value must be at most ${rules.max}`);
        }
      }
      break;

    case 'boolean':
      if (!['true', 'false'].includes(value.toLowerCase())) {
        throw new Error('Value must be true or false');
      }
      break;

    case 'json':
      try {
        JSON.parse(value);
      } catch {
        throw new Error('Value must be valid JSON');
      }
      break;

    case 'string':
    default:
      if (validationRules) {
        const rules = JSON.parse(validationRules);
        if (rules.minLength && value.length < rules.minLength) {
          throw new Error(`Value must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          throw new Error(`Value must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
          throw new Error(`Value does not match required pattern`);
        }
      }
      break;
  }

  return value;
}

function parseConfigValue(dataType: string, value: string): any {
  switch (dataType) {
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return value.toLowerCase() === 'true';
    case 'json':
      return JSON.parse(value);
    case 'string':
    default:
      return value;
  }
}

// Configuration categories
export const CONFIG_CATEGORIES = {
  USDT_RATES: 'usdt_rates',
  SYSTEM: 'system',
  API: 'api',
  SECURITY: 'security',
  NOTIFICATIONS: 'notifications',
} as const;

