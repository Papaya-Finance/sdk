# Papaya SDK (@papaya_fi/sdk)

## Overview

The Papaya SDK provides a simple and efficient way to interact with the Papaya Protocol, a subscription and payment platform built on various blockchain networks. This SDK abstracts away the complexity of direct blockchain interactions, making it easy to integrate Papaya's functionality into your applications.

## Features

- Simple interface for interacting with the Papaya Protocol
- Support for multiple networks (Polygon, BSC, Avalanche, Ethereum Mainnet, etc.)
- Multiple stablecoin support (USDT, USDC, PYUSD)
- Typed definitions for better development experience
- Multiple contract version support
- BySig methods for gasless transactions
- Comprehensive transaction handling
- Utility functions for rate conversions and data formatting

## Installation

```bash
npm install @papaya_fi/sdk
# or
yarn add @papaya_fi/sdk
```

## Quick Start

```typescript
import { ethers } from 'ethers';
import { PapayaSDK, formatOutput, convertRateToPeriod, RatePeriod } from '@papaya_fi/sdk';

// Create an Ethereum provider
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');

// Create a signer if you need to send transactions
const privateKey = 'YOUR_PRIVATE_KEY';
const signer = new ethers.Wallet(privateKey, provider);

// Create a Papaya SDK instance
const papaya = PapayaSDK.create(
  signer,      // Or provider if you only need read-only operations
  'polygon',   // Network name (default is 'polygon')
  'USDT'       // Token symbol (default is 'USDT')
);

// Now you can use the SDK to interact with the Papaya Protocol
async function getBalance() {
  const rawBalance = await papaya.balanceOf();
  // Convert raw balance to readable format
  const readableBalance = formatOutput(BigInt(rawBalance), 18);
  console.log(`Your balance: ${readableBalance} USDT`);
}

// Example subscription
async function subscribeToAuthor() {
  const authorAddress = '0x...';  // The address to subscribe to
  const amountPerMonth = 10;      // Amount in tokens per month
  
  const tx = await papaya.subscribe(authorAddress, amountPerMonth);
  await tx.wait();
  console.log('Successfully subscribed!');
}

// Example getting user info with rate conversion
async function getUserInfo() {
  const userInfo = await papaya.getUserInfo();
  
  // Convert raw blockchain data to human-readable format
  const formattedInfo = {
    balance: formatOutput(BigInt(userInfo.balance), 18),
    // Convert per-second rates to monthly rates
    incomeRate: convertRateToPeriod(Number(formatOutput(userInfo.incomeRate, 18)), RatePeriod.MONTH),
    outgoingRate: convertRateToPeriod(Number(formatOutput(userInfo.outgoingRate, 18)), RatePeriod.MONTH),
    updated: new Date(Number(userInfo.updated) * 1000).toISOString()
  };
  
  console.log(`Balance: ${formattedInfo.balance} USDT`);
  console.log(`Monthly income: ${formattedInfo.incomeRate} USDT`);
  console.log(`Monthly outgoing: ${formattedInfo.outgoingRate} USDT`);
}
```

## Documentation

Explore the full documentation for detailed information on all available methods and features:

- [Getting Started](./documentation/getting-started.md)
- [API Reference](./documentation/api-reference.md)
- [Network Support](./documentation/network-support.md)
- [Utility Functions](./documentation/utility-functions.md)
- [Examples](./documentation/examples.md)
- [TypeScript Types](./documentation/typescript-types.md)
- [Advanced Usage](./documentation/advanced-usage.md)
- [Publishing Guide](./documentation/publish.md)

## Support

For questions, issues or feature requests, please open an issue on our GitHub repository or contact us at support@papaya.finance.

## License

This SDK is released under the MIT License. 