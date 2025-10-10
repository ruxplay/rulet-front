// src/services/RateScheduler.ts
import { updateRateFromAPI, initializeDefaultRate } from './UsdtRateService';

class RateScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.log('Rate scheduler is already running');
      return;
    }

    console.log(`Starting USDT rate scheduler (every ${intervalMinutes} minutes)`);
    this.isRunning = true;

    // Initialize default rate if none exists
    this.initializeDefaultRate();

    // Run immediately on start
    this.updateRate();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.updateRate();
    }, intervalMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('USDT rate scheduler stopped');
    }
  }

  private async initializeDefaultRate(): Promise<void> {
    try {
      await initializeDefaultRate();
    } catch (error) {
      console.error('Error initializing default rate:', error);
    }
  }

  private async updateRate(): Promise<void> {
    try {
      console.log('Updating USDT rate from API...');
      const rate = await updateRateFromAPI();
      
      if (rate) {
        console.log(`✅ USDT rate updated: ${rate.rate} Bs/USDT (source: ${rate.source})`);
      } else {
        console.log('❌ Failed to update USDT rate from API');
      }
    } catch (error) {
      console.error('Error updating USDT rate:', error);
    }
  }

  getStatus(): { isRunning: boolean; intervalMinutes?: number } {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.intervalId ? 5 : undefined,
    };
  }
}

// Singleton instance
export const rateScheduler = new RateScheduler();

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  rateScheduler.start(5); // Update every 5 minutes
}
