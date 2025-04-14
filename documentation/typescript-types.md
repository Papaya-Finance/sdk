# TypeScript Types Reference

The Papaya SDK includes TypeScript type definitions to provide better development experience, code completion, and type safety. This document provides a reference for all the custom types and interfaces used in the SDK.

## Basic Types

### Network and Token Types

```typescript
/**
 * Valid network names supported by the SDK
 */
export type NetworkName = 'polygon' | 'bsc' | 'avalanche' | 'base' | 'scroll' | 'arbitrum' | 'mainnet' | 'sei' | 'zksync';

/**
 * Valid token symbols supported by the SDK
 */
export type TokenSymbol = 'USDT' | 'USDC' | 'PYUSD';
```

### SDK Configuration

```typescript
/**
 * Configuration options for creating a PapayaSDK instance
 */
export interface PapayaSDKOptions {
  /**
   * An ethers.js Provider or Signer instance
   */
  provider: ethers.Provider | ethers.Signer;
  
  /**
   * Optional network name (default: 'polygon')
   */
  network?: NetworkName;
  
  /**
   * Optional token symbol (default: 'USDT')
   */
  tokenSymbol?: TokenSymbol;
  
  /**
   * Optional contract version (defaults to the latest version for the network)
   */
  contractVersion?: string;
  
  /**
   * Optional contract address (override the address from the networks configuration)
   */
  contractAddress?: string;
  
  /**
   * Optional token address (override the address from the networks configuration)
   */
  tokenAddress?: string;
}
```

## User and Subscription Types

### User Information

```typescript
/**
 * User information from the Papaya contract
 */
export interface UserInfo {
  /**
   * User's balance in the Papaya protocol
   */
  balance: string;
  
  /**
   * Rate at which the user is receiving tokens from subscriptions (per second)
   */
  incomeRate: string;
  
  /**
   * Rate at which the user is paying tokens to subscriptions (per second)
   */
  outgoingRate: string;
  
  /**
   * Timestamp when the user's information was last updated
   */
  updated: string;
}
```

### Subscription Information

```typescript
/**
 * Subscription information
 */
export interface Subscription {
  /**
   * Address of the subscription recipient (creator)
   */
  recipient: string;
  
  /**
   * Rate at which the recipient is receiving tokens (per second)
   */
  incomeRate: number;
  
  /**
   * Rate at which the subscriber is paying tokens (per second)
   */
  outgoingRate: number;
  
  /**
   * Project ID associated with the subscription
   */
  projectId: number;
}
```

### Project Settings

```typescript
/**
 * Settings for a project
 */
export interface ProjectSettings {
  /**
   * Whether the project has been initialized
   */
  initialized: boolean;
  
  /**
   * Fee percentage for the project (in basis points, e.g. 250 = 2.5%)
   */
  projectFee: number;
}
```

## Rate Period Enum

```typescript
/**
 * Subscription period options
 */
export enum RatePeriod {
  /**
   * Rate is per second (1 second)
   */
  SECOND = 1,
  
  /**
   * Rate is per minute (60 seconds)
   */
  MINUTE = 60,
  
  /**
   * Rate is per hour (3,600 seconds)
   */
  HOUR = 3600,
  
  /**
   * Rate is per day (86,400 seconds)
   */
  DAY = 86400,
  
  /**
   * Rate is per week (604,800 seconds)
   */
  WEEK = 604800,
  
  /**
   * Rate is per month (2,592,000 seconds, ~30 days)
   */
  MONTH = 2592000,
  
  /**
   * Rate is per year (31,536,000 seconds, ~365 days)
   */
  YEAR = 31536000
}
```

## Internal Types

These types are used internally by the SDK and generally don't need to be used directly in your application code:

### TokenConfig

```typescript
/**
 * Configuration for a token on a specific network
 */
type TokenConfig = {
  /**
   * Contract version
   */
  version: string;
  
  /**
   * Papaya contract address
   */
  contractAddress: string;
  
  /**
   * Token contract address
   */
  tokenAddress: string;
  
  /**
   * Price feed address for the token
   */
  tokenPriceFeed: string;
  
  /**
   * Price feed address for the network's native coin
   */
  coinPriceFeed: string;
};
```

### BySig Traits

```typescript
/**
 * Options for building BySig traits
 */
interface BySigTraitsOptions {
  /**
   * Nonce type (0 = account nonce, 1 = custom nonce)
   */
  nonceType?: number;
  
  /**
   * Transaction deadline timestamp
   */
  deadline?: bigint;
  
  /**
   * Relayer address
   */
  relayer?: string;
  
  /**
   * Custom nonce value (when nonceType = 1)
   */
  nonce?: bigint;
}
```

## Using Types in Your Application

Here are some examples of how to use these types in your application:

### Working with SDK Options

```typescript
import { PapayaSDK, PapayaSDKOptions } from '@papaya_fi/sdk';
import { ethers } from 'ethers';

// Define SDK options
const sdkOptions: PapayaSDKOptions = {
  provider: new ethers.JsonRpcProvider('https://polygon-rpc.com'),
  network: 'polygon',
  tokenSymbol: 'USDT',
  contractVersion: '1.5'
};

// Create SDK instance with options
const papaya = new PapayaSDK(sdkOptions);
```

### Working with Subscriptions

```typescript
import { PapayaSDK, Subscription } from '@papaya_fi/sdk';

async function displaySubscriptions(papayaInstance: PapayaSDK) {
  // Get all subscriptions
  const subscriptions: Subscription[] = await papayaInstance.getSubscriptions();
  
  // Process each subscription
  subscriptions.forEach((sub: Subscription) => {
    console.log(`Subscription to: ${sub.recipient}`);
    console.log(`Rate: ${sub.outgoingRate} tokens per second`);
    console.log(`Project ID: ${sub.projectId}`);
    console.log('---');
  });
}
```

### Using Rate Periods

```typescript
import { PapayaSDK, RatePeriod } from '@papaya_fi/sdk';

async function subscribeMonthly(papayaInstance: PapayaSDK, creatorAddress: string, amountPerMonth: number) {
  // Subscribe with a monthly rate
  const tx = await papayaInstance.subscribe(
    creatorAddress,
    amountPerMonth,
    RatePeriod.MONTH,
    0 // projectId
  );
  
  await tx.wait();
  console.log('Monthly subscription created!');
}

async function subscribeDaily(papayaInstance: PapayaSDK, creatorAddress: string, amountPerDay: number) {
  // Subscribe with a daily rate
  const tx = await papayaInstance.subscribe(
    creatorAddress,
    amountPerDay,
    RatePeriod.DAY,
    0 // projectId
  );
  
  await tx.wait();
  console.log('Daily subscription created!');
}
```

### Working with User Info

```typescript
import { PapayaSDK, UserInfo } from '@papaya_fi/sdk';

async function displayUserInfo(papayaInstance: PapayaSDK, address?: string) {
  // Get user info
  const userInfo: UserInfo = await papayaInstance.getUserInfo(address);
  
  console.log('User Information:');
  console.log(`Balance: ${userInfo.balance}`);
  console.log(`Income Rate: ${userInfo.incomeRate} tokens per second`);
  console.log(`Outgoing Rate: ${userInfo.outgoingRate} tokens per second`);
  console.log(`Last Updated: ${new Date(Number(userInfo.updated) * 1000).toLocaleString()}`);
}
```

These type definitions help provide a safer and more productive development experience when using the Papaya SDK. 