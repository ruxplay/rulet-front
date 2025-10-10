// src/services/ConfigInitializationService.ts
import SystemConfig from '@src/models/SystemConfig';
import { CONFIG_CATEGORIES } from './SystemConfigService';

export const initializeSystemConfig = async (): Promise<void> => {
  console.log('🔧 Initializing system configuration...');

  const defaultConfigs = [
    // USDT Rate Configuration
    {
      key: 'default_usdt_rate',
      value: '180.0',
      description: 'Default USDT rate in Bs when APIs fail',
      category: CONFIG_CATEGORIES.USDT_RATES,
      dataType: 'number' as const,
      isEditable: true,
      validationRules: JSON.stringify({ min: 1, max: 1000 }),
    },
    {
      key: 'max_rate_change_percent',
      value: '10',
      description: 'Maximum allowed rate change percentage',
      category: CONFIG_CATEGORIES.USDT_RATES,
      dataType: 'number' as const,
      isEditable: true,
      validationRules: JSON.stringify({ min: 1, max: 100 }),
    },
    {
      key: 'rate_update_interval_minutes',
      value: '5',
      description: 'Rate update interval in minutes',
      category: CONFIG_CATEGORIES.USDT_RATES,
      dataType: 'number' as const,
      isEditable: true,
      validationRules: JSON.stringify({ min: 1, max: 60 }),
    },

    // System Configuration
    {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Enable maintenance mode',
      category: CONFIG_CATEGORIES.SYSTEM,
      dataType: 'boolean' as const,
      isEditable: true,
    },
    {
      key: 'app_name',
      value: 'Ruleta Backend',
      description: 'Application name',
      category: CONFIG_CATEGORIES.SYSTEM,
      dataType: 'string' as const,
      isEditable: true,
      validationRules: JSON.stringify({ minLength: 1, maxLength: 100 }),
    },
    {
      key: 'app_version',
      value: '1.0.0',
      description: 'Application version',
      category: CONFIG_CATEGORIES.SYSTEM,
      dataType: 'string' as const,
      isEditable: true,
      validationRules: JSON.stringify({ minLength: 1, maxLength: 20 }),
    },

    // API Configuration
    {
      key: 'api_timeout_seconds',
      value: '30',
      description: 'API request timeout in seconds',
      category: CONFIG_CATEGORIES.API,
      dataType: 'number' as const,
      isEditable: true,
      validationRules: JSON.stringify({ min: 5, max: 300 }),
    },
    {
      key: 'max_api_retries',
      value: '3',
      description: 'Maximum API retry attempts',
      category: CONFIG_CATEGORIES.API,
      dataType: 'number' as const,
      isEditable: true,
      validationRules: JSON.stringify({ min: 1, max: 10 }),
    },

    // Security Configuration
    {
      key: 'session_timeout_hours',
      value: '24',
      description: 'User session timeout in hours',
      category: CONFIG_CATEGORIES.SECURITY,
      dataType: 'number' as const,
      isEditable: true,
      validationRules: JSON.stringify({ min: 1, max: 168 }),
    },
    {
      key: 'max_login_attempts',
      value: '5',
      description: 'Maximum login attempts before lockout',
      category: CONFIG_CATEGORIES.SECURITY,
      dataType: 'number' as const,
      isEditable: true,
      validationRules: JSON.stringify({ min: 3, max: 20 }),
    },

    // Notifications Configuration
    {
      key: 'email_notifications_enabled',
      value: 'false',
      description: 'Enable email notifications',
      category: CONFIG_CATEGORIES.NOTIFICATIONS,
      dataType: 'boolean' as const,
      isEditable: true,
    },
    {
      key: 'notification_email',
      value: 'admin@ruleta.com',
      description: 'Admin notification email',
      category: CONFIG_CATEGORIES.NOTIFICATIONS,
      dataType: 'string' as const,
      isEditable: true,
      validationRules: JSON.stringify({ pattern: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$' }),
    },
  ];

  for (const config of defaultConfigs) {
    try {
      const existingConfig = await SystemConfig.findOne({ where: { key: config.key } });
      if (!existingConfig) {
        await SystemConfig.create(config);
        console.log(`✅ Created config: ${config.key}`);
      } else {
        console.log(`⏭️  Config already exists: ${config.key}`);
      }
    } catch (error) {
      console.error(`❌ Error creating config ${config.key}:`, error);
    }
  }

  console.log('🎉 System configuration initialization completed');
};

export const getSystemConfigSummary = async (): Promise<{
  totalConfigs: number;
  categories: Record<string, number>;
  editableConfigs: number;
}> => {
  const totalConfigs = await SystemConfig.count();
  const editableConfigs = await SystemConfig.count({ where: { isEditable: true } });
  
  const categories: Record<string, number> = {};
  const configs = await SystemConfig.findAll({ attributes: ['category'] });
  
  for (const config of configs) {
    categories[config.category] = (categories[config.category] || 0) + 1;
  }

  return {
    totalConfigs,
    categories,
    editableConfigs,
  };
};

