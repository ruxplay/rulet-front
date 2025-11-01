// Servicio para manejar tasas de cambio USDT con margen
import { API_CONFIG } from '../api/config';

export interface ExchangeRateData {
  officialRate: number; // Tasa oficial del dólar en Venezuela
  marginPercentage: number; // Margen fijo (52.3%)
  finalRate: number; // Tasa final para el usuario
  lastUpdated: string;
}

class ExchangeRateService {
  private static instance: ExchangeRateService;
  private marginPercentage = 52.31; // Margen fijo del 52.31%
  private cache: ExchangeRateData | null = null;
  private cacheExpiry = 5 * 60 * 1000; // 5 minutos

  private constructor() {}

  public static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  /**
   * Obtiene la tasa oficial del dólar en Venezuela desde la API
   */
  private async fetchOfficialRate(): Promise<number> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USDT_RATES}/current`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.currentRate && (typeof data.currentRate === 'number' || typeof data.currentRate === 'string')) {
        const rate = Number(data.currentRate);
        return rate;
      }
      
      throw new Error('No rate data available in API response');
    } catch (error) {
      console.error('Error fetching official rate from API:', error);
      // Fallback a tasa por defecto
      return 195;
    }
  }

  /**
   * Calcula la tasa final con margen aplicado
   */
  private calculateFinalRate(officialRate: number): number {
    const marginAmount = officialRate * (this.marginPercentage / 100);
    const finalRate = officialRate + marginAmount;
    return Math.round(finalRate * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Obtiene la tasa de cambio actual (con cache)
   */
  public async getCurrentRate(): Promise<ExchangeRateData> {
    const now = Date.now();
    
    // Verificar si tenemos cache válido
    if (this.cache && (now - new Date(this.cache.lastUpdated).getTime()) < this.cacheExpiry) {
      return this.cache;
    }

    // Obtener nueva tasa
    const officialRate = await this.fetchOfficialRate();
    const finalRate = this.calculateFinalRate(officialRate);

    this.cache = {
      officialRate,
      marginPercentage: this.marginPercentage,
      finalRate,
      lastUpdated: new Date().toISOString()
    };

    return this.cache;
  }

  /**
   * Convierte USDT a RUX usando la tasa final
   */
  public async convertUsdtToRub(usdtAmount: number): Promise<number> {
    const rateData = await this.getCurrentRate();
    const rubAmount = usdtAmount * rateData.finalRate;
    return Math.round(rubAmount * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Convierte RUX a USDT usando la tasa final
   */
  public async convertRubToUsdt(rubAmount: number): Promise<number> {
    const rateData = await this.getCurrentRate();
    const usdtAmount = rubAmount / rateData.finalRate;
    return Math.round(usdtAmount * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Obtiene información detallada de la tasa
   */
  public async getRateInfo(): Promise<ExchangeRateData> {
    return await this.getCurrentRate();
  }

  /**
   * Fuerza la actualización de la tasa (ignora cache)
   */
  public async forceUpdate(): Promise<ExchangeRateData> {
    this.cache = null;
    return await this.getCurrentRate();
  }
}

// Exportar instancia singleton
export const exchangeRateService = ExchangeRateService.getInstance();

// Hook personalizado para React
export const useExchangeRate = () => {
  const [rateData, setRateData] = React.useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await exchangeRateService.getCurrentRate();
        setRateData(data);
      } catch (err) {
        setError('Error al obtener tasa de cambio');
        console.error('Error fetching exchange rate:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchRate, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const convertUsdtToRub = React.useCallback(async (usdtAmount: number) => {
    try {
      return await exchangeRateService.convertUsdtToRub(usdtAmount);
    } catch (err) {
      console.error('Error converting USDT to RUX:', err);
      return 0;
    }
  }, []);

  const convertRubToUsdt = React.useCallback(async (rubAmount: number) => {
    try {
      return await exchangeRateService.convertRubToUsdt(rubAmount);
    } catch (err) {
      console.error('Error converting RUX to USDT:', err);
      return 0;
    }
  }, []);

  const forceUpdate = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await exchangeRateService.forceUpdate();
      setRateData(data);
    } catch {
      setError('Error al actualizar tasa de cambio');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rateData,
    loading,
    error,
    convertUsdtToRub,
    convertRubToUsdt,
    forceUpdate
  };
};

// Importar React para el hook
import React from 'react';
