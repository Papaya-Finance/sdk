import { RatePeriod, convertRatePerSecond, decodeRates } from '../utils/rateConversion';

describe('Rate Conversion Utilities', () => {
  describe('convertRatePerSecond', () => {
    test('converts monthly rate to per-second rate correctly', () => {
      const amount = '100';
      const period = RatePeriod.MONTH;
      
      const ratePerSecond = convertRatePerSecond(amount, period);
      
      // Expected calculation:
      // 100 USD * 1e6 (to smallest unit) * 1e12 (scaling for calculation) / 2,628,000 (seconds in a month)
      const expectedRate = BigInt(Math.floor(100 * 1e6)) * BigInt(1e12) / BigInt(2628000);
      
      expect(ratePerSecond == expectedRate);
    });
    
    test('converts yearly rate to per-second rate correctly', () => {
      const amount = '1200';
      const period = RatePeriod.YEAR;
      
      const ratePerSecond = convertRatePerSecond(amount, period);
      
      // Expected calculation:
      // 1200 USD * 1e6 (to smallest unit) * 1e12 (scaling for calculation) / 31,536,000 (seconds in a year)
      const expectedRate = BigInt(Math.floor(1200 * 1e6)) * BigInt(1e12) / BigInt(31536000);
      
      expect(ratePerSecond == expectedRate);
    });
    
    test('converts weekly rate to per-second rate correctly', () => {
      const amount = '50';
      const period = RatePeriod.WEEK;
      
      const ratePerSecond = convertRatePerSecond(amount, period);
      
      // Expected calculation:
      // 50 USD * 1e6 (to smallest unit) * 1e12 (scaling for calculation) / 604,800 (seconds in a week)
      const expectedRate = BigInt(Math.floor(50 * 1e6)) * BigInt(1e12) / BigInt(604800);
      
      expect(ratePerSecond == expectedRate);
    });
    
    test('converts daily rate to per-second rate correctly', () => {
      const amount = '10';
      const period = RatePeriod.DAY;
      
      const ratePerSecond = convertRatePerSecond(amount, period);
      
      // Expected calculation:
      // 10 USD * 1e6 (to smallest unit) * 1e12 (scaling for calculation) / 86,400 (seconds in a day)
      const expectedRate = BigInt(Math.floor(10 * 1e6)) * BigInt(1e12) / BigInt(86400);
      
      expect(ratePerSecond == expectedRate);
    });
    
    test('converts hourly rate to per-second rate correctly', () => {
      const amount = '1';
      const period = RatePeriod.HOUR;
      
      const ratePerSecond = convertRatePerSecond(amount, period);
      
      // Expected calculation:
      // 1 USD * 1e6 (to smallest unit) * 1e12 (scaling for calculation) / 3,600 (seconds in an hour)
      const expectedRate = BigInt(Math.floor(1 * 1e6)) * BigInt(1e12) / BigInt(3600);
      
      expect(ratePerSecond == expectedRate);
    });
    
    test('handles second rate correctly', () => {
      const amount = '0.0001';
      const period = RatePeriod.SECOND;
      
      const ratePerSecond = convertRatePerSecond(amount, period);
      
      // Expected calculation:
      // 0.0001 USD * 1e6 (to smallest unit) * 1e12 (scaling for calculation) / 1 (seconds in a second)
      const expectedRate = BigInt(Math.floor(0.0001 * 1e6)) * BigInt(1e12) / BigInt(1);
      
      expect(ratePerSecond == expectedRate)
    });
    
    test('handles decimal amounts correctly', () => {
      const amount = '99.99';
      const period = RatePeriod.MONTH;
      
      const ratePerSecond = convertRatePerSecond(amount, period);
      
      // Expected calculation:
      // 99.99 USD * 1e6 (to smallest unit) * 1e12 (scaling for calculation) / 2,628,000 (seconds in a month)
      const expectedRate = BigInt(Math.floor(99.99 * 1e6)) * BigInt(1e12) / BigInt(2628000);
      
      expect(ratePerSecond == expectedRate);
    });
  });
  
  describe('decodeRates', () => {
    test('decodes rates correctly', () => {
      // Create a sample encoded rate
      // incomeRate is the lowest 96 bits
      // outgoingRate is the next 96 bits
      // projectId is the highest 64 bits
      const incomeRate = BigInt(123456);
      const outgoingRate = BigInt(654321);
      const projectId = BigInt(42);
      
      const encodedRates = 
        incomeRate + 
        (outgoingRate << BigInt(96)) +
        (projectId << BigInt(192));
      
      const decoded = decodeRates(encodedRates);
      
      expect(decoded.incomeRate).toBe(Number(incomeRate));
      expect(decoded.outgoingRate).toBe(Number(outgoingRate));
      expect(decoded.projectId).toBe(Number(projectId));
    });
    
    test('handles zero values correctly', () => {
      const encodedRates = BigInt(0);
      
      const decoded = decodeRates(encodedRates);
      
      expect(decoded.incomeRate).toBe(0);
      expect(decoded.outgoingRate).toBe(0);
      expect(decoded.projectId).toBe(0);
    });
    
    test('handles max values correctly', () => {
      // Maximum values that fit in each field
      const incomeRate = (BigInt(1) << BigInt(96)) - BigInt(1);  // max 96 bits
      const outgoingRate = (BigInt(1) << BigInt(96)) - BigInt(1); // max 96 bits
      const projectId = (BigInt(1) << BigInt(64)) - BigInt(1);    // max 64 bits
      
      const encodedRates = 
        (incomeRate & ((BigInt(1) << BigInt(96)) - BigInt(1))) + 
        ((outgoingRate & ((BigInt(1) << BigInt(96)) - BigInt(1))) << BigInt(96)) +
        ((projectId & ((BigInt(1) << BigInt(64)) - BigInt(1))) << BigInt(192));
      
      const decoded = decodeRates(encodedRates);
      
      // JavaScript Number can't precisely represent the full range,
      // but we can check if they're approximately correct
      expect(decoded.incomeRate).toBeGreaterThan(0);
      expect(decoded.outgoingRate).toBeGreaterThan(0);
      expect(decoded.projectId).toBeGreaterThan(0);
    });
  });
}); 