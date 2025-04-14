# Utility Functions

The Papaya SDK includes several utility functions that help convert between different rate formats, format numbers, and process raw blockchain data into more human-readable forms.

## Table of Contents

- [Rate Conversion Functions](#rate-conversion-functions)
- [Formatting Functions](#formatting-functions)
- [Decoding Functions](#decoding-functions)
- [Usage Examples](#usage-examples)

## Rate Conversion Functions

The Papaya Protocol stores subscription rates as per-second values (raw), but in applications, you'll typically want to display these as more human-readable periods like per month or per year.

### Rate Periods

The SDK exports a `RatePeriod` enum to represent different time periods:

```typescript
export enum RatePeriod {
  SECOND = 'second',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year'
}
```

These period values correspond to the following conversion factors (in seconds):

| Period | Seconds |
|--------|---------|
| SECOND | 1       |
| HOUR   | 3,600   |
| DAY    | 86,400  |
| WEEK   | 604,800 |
| MONTH  | 2,628,000 (≈30.42 days) |
| YEAR   | 31,536,000 (365 days) |

### `convertRatePerSecond()`

Converts an amount for a specific period (e.g., 10 USDT per month) to a per-second rate.

```typescript
function convertRatePerSecond(amount: string, period: RatePeriod): number
```

**Parameters:**
- `amount`: The rate amount as a string
- `period`: The time period for the rate (e.g., `RatePeriod.MONTH`)

**Returns:** The equivalent per-second rate as a number.

**Example:**
```typescript
// Convert 10 USDT per month to a per-second rate
const perSecondRate = convertRatePerSecond('10', RatePeriod.MONTH);
console.log(perSecondRate); // Very small number representing tokens per second
```

### `convertRateToPeriod()`

Converts a per-second rate to a rate for a specified period.

```typescript
function convertRateToPeriod(ratePerSecond: number, period: RatePeriod): number
```

**Parameters:**
- `ratePerSecond`: The per-second rate as a number
- `period`: The target time period (e.g., `RatePeriod.MONTH`)

**Returns:** The rate for the target period as a number.

**Example:**
```typescript
// Convert a per-second rate to a monthly rate
const monthlyRate = convertRateToPeriod(perSecondRate, RatePeriod.MONTH);
console.log(monthlyRate); // Approximately 10 (if perSecondRate was from previous example)
```

## Formatting Functions

The SDK provides functions to format amounts between different representations.

### `formatInput()`

Converts a human-readable amount into a bigint for use in blockchain transactions.

```typescript
function formatInput(amount: string, unit?: string | ethers.Numeric): bigint
```

**Parameters:**
- `amount`: The amount as a string
- `unit`: (Optional) The unit of the amount (e.g., "18" for 18 decimal places)

**Returns:** The formatted bigint amount.

**Example:**
```typescript
// Format 10 USDT (with 6 decimals) for a contract call
const formattedAmount = formatInput('10', 6);
console.log(formattedAmount); // 10000000n (10 * 10^6)
```

### `formatOutput()`

Converts a blockchain bigint amount into a human-readable number.

```typescript
function formatOutput(amount: ethers.BigNumberish, unit?: string | ethers.Numeric): number
```

**Parameters:**
- `amount`: The blockchain amount
- `unit`: (Optional) The unit of the amount (e.g., "18" for 18 decimal places)

**Returns:** The formatted number.

**Example:**
```typescript
// Format a raw blockchain amount (e.g., balance) to a human-readable number
const readableBalance = formatOutput(BigInt('1000000000'), 6);
console.log(readableBalance); // 1000 (10^9 / 10^6)
```

## Decoding Functions

### `decodeRates()`

Decodes a bigint value containing encoded subscription rate information.

```typescript
function decodeRates(encodedRates: bigint): { incomeRate: number; outgoingRate: number; projectId: number }
```

**Parameters:**
- `encodedRates`: The encoded rates as a bigint

**Returns:** An object containing:
- `incomeRate`: The income rate (per second)
- `outgoingRate`: The outgoing rate (per second)
- `projectId`: The project ID associated with the subscription

**Example:**
```typescript
// Decode rates from a subscription
const decodedRates = decodeRates(encodedRatesFromContract);
console.log(decodedRates); // { incomeRate: 0.00001, outgoingRate: 0.00001, projectId: 0 }
```

## Usage Examples

### Converting Raw Blockchain Rates to Human-Readable Values

Here's how to convert the raw per-second rates returned by the SDK methods to more human-readable monthly rates:

```typescript
import { PapayaSDK, formatOutput, convertRateToPeriod, RatePeriod } from '@papaya_fi/sdk';

async function displayUserInfo() {
  const papaya = PapayaSDK.create(provider, 'polygon', 'USDT');
  
  // Get user info with raw rates
  const userInfo = await papaya.getUserInfo();
  
  // Format the raw values to human-readable format
  const formattedUserInfo = {
    balance: formatOutput(BigInt(userInfo.balance), 18),
    incomeRate: convertRateToPeriod(Number(formatOutput(userInfo.incomeRate, 18)), RatePeriod.MONTH),
    outgoingRate: convertRateToPeriod(Number(formatOutput(userInfo.outgoingRate, 18)), RatePeriod.MONTH),
    updated: new Date(Number(userInfo.updated) * 1000).toLocaleString()
  };
  
  console.log(`Balance: ${formattedUserInfo.balance} USDT`);
  console.log(`Total Income Rate: ${formattedUserInfo.incomeRate} per month`);
  console.log(`Total Outgoing Rate: ${formattedUserInfo.outgoingRate} per month`);
}
```

### Formatting Subscription Data

When working with subscriptions, you'll typically need to format the rates:

```typescript
import { PapayaSDK, formatOutput, convertRateToPeriod, RatePeriod } from '@papaya_fi/sdk';

async function displaySubscriptions() {
  const papaya = PapayaSDK.create(provider, 'polygon', 'USDT');
  
  // Get all subscriptions
  const subscriptions = await papaya.getSubscriptions();
  
  // Format the subscription rates to human-readable values
  const formattedSubscriptions = subscriptions.map(sub => ({
    recipient: sub.recipient,
    incomeRate: convertRateToPeriod(formatOutput(sub.incomeRate, 18), RatePeriod.MONTH),
    outgoingRate: convertRateToPeriod(formatOutput(sub.outgoingRate, 18), RatePeriod.MONTH),
    projectId: sub.projectId
  }));
  
  // Display each subscription
  formattedSubscriptions.forEach(sub => {
    console.log(`Subscription to: ${sub.recipient}`);
    console.log(`Monthly rate: ${sub.outgoingRate} USDT`);
    console.log(`Project ID: ${sub.projectId}`);
    console.log('---');
  });
}
```

### Preparing Input Values for Transactions

When creating a subscription or making a deposit, you'll need to format the input values:

```typescript
import { PapayaSDK, formatInput } from '@papaya_fi/sdk';

async function subscribeToCreator() {
  const papaya = PapayaSDK.create(signer, 'polygon', 'USDT');
  const creatorAddress = '0x...';
  
  // User wants to subscribe with 10 USDT per month
  const amount = '10';
  
  // Format the amount correctly for the blockchain transaction
  // For USDT which has 6 decimals
  const formattedAmount = formatInput(amount, 6);
  
  // Create the subscription
  const tx = await papaya.subscribe(creatorAddress, formattedAmount);
  await tx.wait();
  
  console.log('Successfully subscribed!');
}
```

Using these utility functions correctly ensures that your application displays human-readable values to users while handling the raw blockchain data appropriately in transactions. 