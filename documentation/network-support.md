# Network and Token Support

The Papaya SDK supports multiple blockchain networks and stablecoin tokens. This document provides details on which networks and tokens are supported, along with their contract addresses and versions.

## Supported Networks

The SDK currently supports the following networks:

| Network | Chain ID | Description |
|---------|----------|-------------|
| `polygon` | 137 | Polygon mainnet, a popular Ethereum scaling solution |
| `bsc` | 56 | Binance Smart Chain, Binance's EVM-compatible blockchain |
| `avalanche` | 43114 | Avalanche C-Chain, an EVM-compatible blockchain |
| `base` | 8453 | Base, an Ethereum L2 scaling solution by Coinbase |
| `scroll` | 534352 | Scroll, an Ethereum L2 zk-rollup scaling solution |
| `arbitrum` | 42161 | Arbitrum, an Ethereum L2 optimistic rollup scaling solution |
| `mainnet` | 1 | Ethereum mainnet |
| `sei` | 32741 | Sei EVM, a high-performance EVM-compatible blockchain |
| `zksync` | 324 | zkSync Era, an Ethereum L2 zk-rollup scaling solution |

You can get a list of all supported networks programmatically using:

```typescript
import { PapayaSDK } from '@papaya_fi/sdk';

const networks = PapayaSDK.getAvailableNetworks();
console.log(networks);
```

## Supported Tokens

The SDK supports the following stablecoin tokens:

| Token | Description |
|-------|-------------|
| `USDT` | Tether USD, a widely used stablecoin |
| `USDC` | USD Coin, a fully-collateralized stablecoin |
| `PYUSD` | PayPal USD, a stablecoin issued by PayPal (only on Ethereum mainnet) |

Not all tokens are available on all networks. You can check which tokens are available on a specific network using:

```typescript
import { PapayaSDK } from '@papaya_fi/sdk';

const polygonTokens = PapayaSDK.getAvailableTokens('polygon');
console.log(polygonTokens); // ['USDT', 'USDC']
```

## Network and Token Availability Matrix

Below is a matrix showing which tokens are available on which networks:

| Network | USDT | USDC | PYUSD |
|---------|------|------|-------|
| polygon | ✅   | ✅   | ❌    |
| bsc     | ✅   | ✅   | ❌    |
| avalanche | ✅ | ✅   | ❌    |
| base    | ❌   | ✅   | ❌    |
| scroll  | ✅   | ✅   | ❌    |
| arbitrum | ✅  | ✅   | ❌    |
| mainnet | ✅   | ✅   | ✅    |
| sei     | ✅   | ✅   | ❌    |
| zksync  | ✅   | ❌   | ❌    |

## Contract Versions

The SDK supports multiple contract versions for each token on each network. By default, it will use the latest available version, but you can specify a particular version if needed.

For example, on Polygon, both USDT and USDC have versions "1" and "1.5" available.

When creating a new SDK instance, you can specify a particular version:

```typescript
import { PapayaSDK } from '@papaya_fi/sdk';

// Using the latest version (default)
const papaya = PapayaSDK.create(provider, 'polygon', 'USDT');

// Specifying a particular version
const papayaV1 = PapayaSDK.create(provider, 'polygon', 'USDT', '1');
```

## RPC Providers

To use the Papaya SDK, you'll need access to an RPC endpoint for the network you're targeting. Here are some public RPC endpoints for the supported networks:

| Network | Example RPC URL |
|---------|----------------|
| polygon | `https://polygon-rpc.com` |
| bsc | `https://bsc-dataseed.binance.org` |
| avalanche | `https://api.avax.network/ext/bc/C/rpc` |
| base | `https://mainnet.base.org` |
| scroll | `https://rpc.scroll.io` |
| arbitrum | `https://arb1.arbitrum.io/rpc` |
| mainnet | `https://eth.llamarpc.com` |
| sei | `https://evm-rpc.sei.io` |
| zksync | `https://mainnet.era.zksync.io` |

For production use, we recommend using a dedicated RPC provider service like Infura, Alchemy, or QuickNode.

## Default Fallback Behavior

If you specify a network that is not supported, the SDK will fall back to the Polygon network. Similarly, if you specify a token that is not supported on the chosen network, it will try to fall back to USDT, then USDC, and finally to the first available token for that network.

```typescript
// If 'fantom' is not supported, this will use 'polygon' instead
const papaya = PapayaSDK.create(provider, 'fantom', 'USDT');

// If 'PYUSD' is not supported on 'polygon', this will use 'USDT' instead
const papaya = PapayaSDK.create(provider, 'polygon', 'PYUSD');
```

This fallback behavior ensures that the SDK can always create a valid instance, but it will log warning messages to the console to inform you of these automatic adjustments. 