// src/services/UsdtRateService.ts
import UsdtRate, { UsdtRateAttributes } from '@src/models/UsdtRate';
import { Op } from 'sequelize';
import { CreateUsdtRateInput, UpdateUsdtRateInput, UsdtRateQueryInput } from '@src/validators/UsdtRateValidator';
import { getSystemConfigValue } from './SystemConfigService';

// API endpoints for rate fetching
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDT';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd';
const EXCHANGERATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const FIXER_API_URL = 'https://api.fixer.io/latest?access_key=YOUR_KEY&base=USD&symbols=VES';
const CURRENCYLAYER_API_URL = 'https://api.currencylayer.com/live?access_key=YOUR_KEY&currencies=VES';
const FREE_CURRENCY_API_URL = 'https://api.freecurrencyapi.com/v1/latest?apikey=YOUR_KEY&currencies=VES';
const EXCHANGE_RATES_API_URL = 'https://api.exchangerates.io/latest?base=USD&symbols=VES';

export const createUsdtRate = async (data: CreateUsdtRateInput): Promise<UsdtRateAttributes> => {
  // Deactivate previous rates
  await UsdtRate.update(
    { status: 'inactive' },
    { where: { status: 'active' } }
  );

  const rate = await UsdtRate.create({
    rate: data.rate,
    source: data.source,
    status: 'active',
  });

  return rate.toJSON();
};

export const getCurrentUsdtRate = async (): Promise<UsdtRateAttributes | null> => {
  const rate = await UsdtRate.findOne({
    where: { status: 'active' },
    order: [['createdAt', 'DESC']],
  });

  return rate ? rate.toJSON() : null;
};

export const getUsdtRateHistory = async (filters: UsdtRateQueryInput): Promise<UsdtRateAttributes[]> => {
  const { limit, offset, source, status } = filters;
  
  const whereClause: any = {};
  if (source) whereClause.source = source;
  if (status) whereClause.status = status;

  const rates = await UsdtRate.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return rates.map(rate => rate.toJSON());
};

export const updateUsdtRate = async (rateId: number, data: UpdateUsdtRateInput): Promise<UsdtRateAttributes> => {
  const rate = await UsdtRate.findByPk(rateId);
  if (!rate) {
    throw new Error('Tasa USDT no encontrada');
  }

  await rate.update(data);
  return rate.toJSON();
};

// API Integration functions
export const fetchRateFromBinance = async (): Promise<number | null> => {
  try {
    const response = await fetch(BINANCE_API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log(`Binance API response status: ${response.status}`);
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Binance API response:', data);
    
    // USDTUSDT should be ~1, but let's use it as base
    const usdtUsdRate = parseFloat(data.price);
    if (usdtUsdRate && usdtUsdRate > 0.9 && usdtUsdRate < 1.1) {
      // Get USD/VES rate from multiple sources
      const usdVesRate = await fetchUSDVESRate();
      if (usdVesRate) {
        return usdVesRate; // USDT ≈ USD, so USDT/VES ≈ USD/VES
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching rate from Binance:', error);
    return null;
  }
};

export const fetchRateFromCoinGecko = async (): Promise<number | null> => {
  try {
    const response = await fetch(COINGECKO_API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log(`CoinGecko API response status: ${response.status}`);
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('CoinGecko API response:', data);
    
    const usdtUsdRate = data.tether?.usd;
    if (usdtUsdRate && usdtUsdRate > 0.9 && usdtUsdRate < 1.1) {
      // Get USD/VES rate from multiple sources
      const usdVesRate = await fetchUSDVESRate();
      if (usdVesRate) {
        return usdVesRate;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching rate from CoinGecko:', error);
    return null;
  }
};

export const fetchUSDVESRate = async (): Promise<number | null> => {
  // Try multiple sources for USD/VES rate
  const sources = [
    { name: 'ExchangeRate-API', url: EXCHANGERATE_API_URL, parser: (data: any) => data.rates?.VES },
    { name: 'ExchangeRates.io', url: EXCHANGE_RATES_API_URL, parser: (data: any) => data.rates?.VES },
    { name: 'Fixer.io', url: FIXER_API_URL, parser: (data: any) => data.rates?.VES },
    { name: 'CurrencyLayer', url: CURRENCYLAYER_API_URL, parser: (data: any) => data.quotes?.USDVES },
    { name: 'FreeCurrencyAPI', url: FREE_CURRENCY_API_URL, parser: (data: any) => data.data?.VES },
  ];

  for (const source of sources) {
    try {
      console.log(`Trying ${source.name} for USD/VES rate...`);
      
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.log(`${source.name} API response status: ${response.status}`);
        continue; // Try next source
      }
      
      const data = await response.json();
      console.log(`${source.name} API response:`, data);
      
      const usdVesRate = source.parser(data);
      if (usdVesRate && typeof usdVesRate === 'number' && usdVesRate > 0) {
        console.log(`✅ ${source.name} USD/VES rate: ${usdVesRate}`);
        return usdVesRate;
      }
      
    } catch (error) {
      console.error(`Error fetching USD/VES rate from ${source.name}:`, error);
      continue; // Try next source
    }
  }
  
  console.error('All USD/VES sources failed');
  return null;
};

export const updateRateFromAPI = async (): Promise<UsdtRateAttributes | null> => {
  // Try Binance first
  let newRate = await fetchRateFromBinance();
  let source: 'binance' | 'coingecko' | 'manual' = 'binance';

  // Fallback to CoinGecko if Binance fails
  if (!newRate) {
    newRate = await fetchRateFromCoinGecko();
    source = 'coingecko';
  }

  // Final fallback: get manual rate from system config
  if (!newRate) {
    console.warn('All APIs failed, using fallback manual rate from system config');
    newRate = await getSystemConfigValue('default_usdt_rate', 200.0);
    source = 'manual';
  }

  // Validate rate change (get max change percent from system config)
  const currentRate = await getCurrentUsdtRate();
  const maxChangePercent = await getSystemConfigValue('max_rate_change_percent', 10);
  
  if (currentRate) {
    const changePercent = Math.abs((newRate - Number(currentRate.rate)) / Number(currentRate.rate)) * 100;
    if (changePercent > maxChangePercent) {
      console.warn(`Rate change too large: ${changePercent.toFixed(2)}%. Max allowed: ${maxChangePercent}%. Skipping update.`);
      return null;
    }
  }

  // Create new rate
  return await createUsdtRate({
    rate: newRate,
    source,
  });
};

export const initializeDefaultRate = async (): Promise<void> => {
  const existingRate = await getCurrentUsdtRate();
  if (!existingRate) {
    console.log('No USDT rate found, initializing with default rate from system config...');
    const defaultRate = await getSystemConfigValue('default_usdt_rate', 200.0);
    await createUsdtRate({
      rate: defaultRate,
      source: 'manual',
    });
    console.log('✅ Default USDT rate initialized');
  }
};

export const getRateStatus = async (): Promise<{
  currentRate: UsdtRateAttributes | null;
  lastUpdate: Date | null;
  isStale: boolean;
  source: string;
}> => {
  const currentRate = await getCurrentUsdtRate();
  
  if (!currentRate) {
    return {
      currentRate: null,
      lastUpdate: null,
      isStale: true,
      source: 'none',
    };
  }

  const lastUpdate = new Date(currentRate.createdAt);
  const now = new Date();
  const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  const isStale = minutesSinceUpdate > 30; // Consider stale after 30 minutes

  return {
    currentRate,
    lastUpdate,
    isStale,
    source: currentRate.source,
  };
};
