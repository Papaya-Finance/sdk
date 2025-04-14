/**
 * Utility for handling rate conversions with different time periods
 */
import { ethers } from "ethers";
/**
 * Enum for time period units used in subscription rates
 */
export enum RatePeriod {
  SECOND = 'second',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year'
}

/**
 * Conversion factors to normalize different rate periods to per-second rates
 * These represent how many seconds are in each period
 */
const PERIOD_TO_SECONDS = {
  [RatePeriod.SECOND]: 1,
  [RatePeriod.HOUR]: 3600, // 60 * 60
  [RatePeriod.DAY]: 86400, // 24 * 60 * 60
  [RatePeriod.WEEK]: 604800, // 7 * 24 * 60 * 60
  [RatePeriod.MONTH]: 2628000, // ~30.42 days in a month (365 / 12 * 24 * 60 * 60)
  [RatePeriod.YEAR]: 31536000 // 365 * 24 * 60 * 60
};

/**
 * Converts a rate amount to a per-second rate
 * 
 * @param amount - The rate amount
 * @param period - The time period
 * @returns The equivalent per-second rate
 */
export function convertRatePerSecond(amount: string, period: RatePeriod): number {
  const amountNum = parseFloat(amount);
  const periodFactor = PERIOD_TO_SECONDS[period];

  const amountInSmallestUnit = BigInt(Math.floor(amountNum * 1e6)) * BigInt(1e12);
  const ratePerSecond = amountInSmallestUnit / BigInt(periodFactor);

  return Number(ratePerSecond);
}

/**
 * Converts a per-second rate to a rate for a given period
 * 
 * @param ratePerSecond - The per-second rate
 * @param period - The time period
 * @returns The rate for the given period
 */
export function convertRateToPeriod(ratePerSecond: number, period: RatePeriod): number {
  const periodFactor = PERIOD_TO_SECONDS[period];
  return ratePerSecond * periodFactor;
}


/**
 * Decodes a bigint value into income rate, outgoing rate, and project ID
 * 
 * @param encodedRates - The encoded rates as a bigint
 * @returns An object containing the decoded incomeRate, outgoingRate, and projectId
 */
export function decodeRates(encodedRates: bigint): { incomeRate: number; outgoingRate: number; projectId: number } {
  return {
    incomeRate: Number(encodedRates & BigInt("0xffffffffffffffff")),
    outgoingRate: Number((encodedRates >> BigInt(96)) & BigInt("0xffffffffffffffff")),
    projectId: Number(encodedRates >> BigInt(192)),
  };
}

/**
 * Formats an amount string into a bigint using ethers.js
 * 
 * @param amount - The amount to format
 * @param unit - The unit of the amount (e.g. "18" for 18 decimal places)
 * @returns The formatted bigint amount
 */
export function formatInput(amount: string, unit?: string | ethers.Numeric): bigint {
  const formattedAmount = ethers.parseUnits(amount, unit);
  return formattedAmount;
}

/**
 * Formats an amount bigint into a string using ethers.js
 * 
 * @param amount - The amount to format
 * @param unit - The unit of the amount (e.g. "18" for 18 decimal places)
 * @returns The formatted string amount
 */
export function formatOutput(amount: ethers.BigNumberish, unit?: string | ethers.Numeric): number {
  const formattedAmount = ethers.formatUnits(amount, unit);
  return Number(formattedAmount);
}