# Papaya SDK API Reference

This document provides a comprehensive reference for all methods available in the Papaya SDK.

## Table of Contents

- [Factory Methods](#factory-methods)
- [Account Methods](#account-methods)
- [Deposit Methods](#deposit-methods)
- [Withdrawal Methods](#withdrawal-methods)
- [Subscription Methods](#subscription-methods)
- [Payment Methods](#payment-methods)
- [Multicall Methods](#multicall-methods)
- [Utility Methods](#utility-methods)

## Important Note on Rate Values

Most methods in the Papaya SDK that return subscription rates (like `getUserInfo()` or `getSubscriptions()`) return these values as **rates in their raw blockchain format**. To convert these to human-readable values such as monthly rates, you should use the utility functions provided by the SDK:

```typescript
import { formatOutput, convertRateToPeriod, RatePeriod } from '@papaya_fi/sdk';

// Example converting a raw rate to a monthly rate
const rawRate = userInfo.incomeRate; // Returned from getUserInfo()
const formattedRate = formatOutput(BigInt(rawRate), 18); // First convert from blockchain format
const monthlyRate = convertRateToPeriod(Number(formattedRate), RatePeriod.MONTH); // Then convert to monthly rate

console.log(`Monthly rate: ${monthlyRate} USDT`);
```

For more details on rate conversion, see the [Utility Functions](./utility-functions.md) documentation.

## Factory Methods

### `PapayaSDK.create()`

Creates a new instance of the Papaya SDK.

```typescript
static create(
  provider: ethers.Provider | ethers.Signer,
  network: NetworkName = 'polygon',
  tokenSymbol: TokenSymbol = 'USDT',
  contractVersion?: string
): PapayaSDK
```

**Parameters:**
- `provider`: An ethers.js Provider or Signer instance
- `network`: (Optional) The blockchain network to use (default: 'polygon')
- `tokenSymbol`: (Optional) The stablecoin to use (default: 'USDT')
- `contractVersion`: (Optional) Specific contract version to use (defaults to the latest version for the selected network)

**Returns:** A new `PapayaSDK` instance.

**Example:**
```typescript
const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
const papaya = PapayaSDK.create(provider, 'polygon', 'USDT');
```

### `PapayaSDK.getAvailableNetworks()`

Returns a list of all networks supported by the SDK.

```typescript
static getAvailableNetworks(): NetworkName[]
```

**Returns:** Array of network names.

**Example:**
```typescript
const networks = PapayaSDK.getAvailableNetworks();
console.log(networks); // ['polygon', 'bsc', 'avalanche', ...]
```

### `PapayaSDK.getAvailableTokens()`

Returns a list of tokens available for a specific network.

```typescript
static getAvailableTokens(network: NetworkName): TokenSymbol[]
```

**Parameters:**
- `network`: The network to check for available tokens

**Returns:** Array of token symbols available on the specified network.

**Example:**
```typescript
const tokens = PapayaSDK.getAvailableTokens('polygon');
console.log(tokens); // ['USDT', 'USDC']
```

## Account Methods

### `balanceOf()`

Retrieves the token balance of an account in the Papaya protocol.

```typescript
async balanceOf(account?: string): Promise<number>
```

**Parameters:**
- `account`: (Optional) The address to check the balance of. If not provided, uses the connected signer's address.

**Returns:** The account balance in its raw blockchain format. Use `formatOutput()` to convert to a human-readable number.

**Example:**
```typescript
// Get raw balance
const rawBalance = await papaya.balanceOf();

// Convert to human-readable format
const balance = formatOutput(BigInt(rawBalance), 18);
console.log(`My balance: ${balance} USDT`);
```

### `getUserInfo()`

Gets detailed information about a user's account.

```typescript
async getUserInfo(account?: string): Promise<UserInfo>
```

**Parameters:**
- `account`: (Optional) The address to get info for. If not provided, uses the connected signer's address.

**Returns:** A `UserInfo` object with the following properties:
- `balance`: The account balance in raw blockchain format
- `incomeRate`: The rate at which the account is receiving subscriptions (raw format)
- `outgoingRate`: The rate at which the account is paying subscriptions (raw format)
- `updated`: The timestamp when the account was last updated

**Note:** The `incomeRate` and `outgoingRate` values are rates in their raw blockchain format. You should use the utility functions to convert them to human-readable values, typically per month.

**Example:**
```typescript
// Get raw user info
const userInfo = await papaya.getUserInfo();

// Convert to human-readable format
const formattedUserInfo = {
  balance: formatOutput(BigInt(userInfo.balance), 18),
  incomeRate: convertRateToPeriod(Number(formatOutput(userInfo.incomeRate, 18)), RatePeriod.MONTH),
  outgoingRate: convertRateToPeriod(Number(formatOutput(userInfo.outgoingRate, 18)), RatePeriod.MONTH),
  updated: new Date(Number(userInfo.updated) * 1000).toLocaleString()
};

console.log(`Balance: ${formattedUserInfo.balance} USDT`);
console.log(`Income rate: ${formattedUserInfo.incomeRate} USDT per month`);
console.log(`Outgoing rate: ${formattedUserInfo.outgoingRate} USDT per month`);
console.log(`Last updated: ${formattedUserInfo.updated}`);
```

## Deposit Methods

### `deposit()`

Deposits tokens into the Papaya protocol.

```typescript
async deposit(amount: bigint | number, isPermit2: boolean = false): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `amount`: The amount of tokens to deposit, should be formatted using `formatInput()`
- `isPermit2`: (Optional) Whether to use Permit2 for the deposit (default: false)

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
// Format the amount correctly (10 USDT with 6 decimals)
const amount = formatInput('10', 6);

// Deposit
const tx = await papaya.deposit(amount);
await tx.wait();
console.log('Deposit successful');
```

### `depositBySig()`

Creates a deposit transaction that can be signed off-chain and executed by anyone.

```typescript
async depositBySig(amount: bigint | number, deadline: number): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `amount`: The amount of tokens to deposit, should be formatted using `formatInput()`
- `deadline`: Timestamp after which the transaction can't be executed

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
// Format the amount correctly (10 USDT with 6 decimals)
const amount = formatInput('10', 6);

// Set deadline to 1 hour from now
const deadline = Math.floor(Date.now() / 1000) + 3600;

// Create the depositBySig transaction
const tx = await papaya.depositBySig(amount, deadline);
await tx.wait();
```

### `depositFor()`

Deposits tokens into another account.

```typescript
async depositFor(amount: bigint | number, to: string, isPermit2: boolean = false): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `amount`: The amount of tokens to deposit, should be formatted using `formatInput()`
- `to`: The recipient address
- `isPermit2`: (Optional) Whether to use Permit2 for the deposit (default: false)

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
// Format the amount correctly (50 USDT with 6 decimals)
const amount = formatInput('50', 6);
const recipientAddress = '0x...';

// Deposit to the recipient
const tx = await papaya.depositFor(amount, recipientAddress);
await tx.wait();
```

### `depositAndSubscribe()`

Deposits tokens and creates a subscription in a single transaction using multicall. This method combines `deposit()` and `subscribe()` operations atomically, saving gas and improving user experience.

```typescript
async depositAndSubscribe(
  author: string,
  amount: string | number | bigint,
  rate: string | number | bigint,
  period: RatePeriod = RatePeriod.MONTH,
  projectId: number,
  isPermit2: boolean = false,
  decimals: number = 6
): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `author`: The address of the creator to subscribe to
- `amount`: The amount of tokens to deposit (in token units, e.g., "100" for $100)
- `rate`: The subscription rate per period (in token units, e.g., "100" for $100/month)
- `period`: (Optional) The subscription period (default: `RatePeriod.MONTH`)
- `projectId`: The project ID associated with the subscription
- `isPermit2`: (Optional) Whether to use Permit2 for deposit (default: false)
- `decimals`: (Optional) Token decimals (default: 6 for USDT/USDC)

**Returns:** An ethers.js `TransactionResponse` object.

**Benefits:**
- ✅ Saves gas by combining two operations into one transaction
- ✅ Atomic execution: both operations succeed or both fail
- ✅ Better UX: only one transaction confirmation needed

**Example:**
```typescript
const creatorAddress = '0x...';

// Deposit $100 and subscribe to $100/month in a single transaction
const tx = await papaya.depositAndSubscribe(
  creatorAddress,  // author
  '100',           // deposit amount ($100)
  '100',           // subscription rate ($100/month)
  RatePeriod.MONTH,
  0,               // projectId
  false,           // isPermit2
  6                // decimals (USDT/USDC)
);

await tx.wait();
console.log('Deposit and subscription completed in one transaction!');
```

**Note:** The order of operations is important - deposit is executed first, then subscribe. This ensures the account has sufficient balance before creating the subscription.

## Withdrawal Methods

### `withdraw()`

Withdraws tokens from the Papaya protocol.

```typescript
async withdraw(amount: bigint | number): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `amount`: The amount of tokens to withdraw, should be formatted using `formatInput()`

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
// Format the amount correctly (50 USDT with 18 decimals)
const amount = formatInput('50', 18);

// Withdraw
const tx = await papaya.withdraw(amount);
await tx.wait();
console.log('Withdrawal successful');
```

### `withdrawBySig()`

Creates a withdrawal transaction that can be signed off-chain and executed by anyone.

```typescript
async withdrawBySig(amount: bigint | number, deadline: number): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `amount`: The amount of tokens to withdraw, should be formatted using `formatInput()`
- `deadline`: Timestamp after which the transaction can't be executed

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
// Format the amount correctly (50 USDT with 18 decimals)
const amount = formatInput('50', 18);

// Set deadline to 1 hour from now
const deadline = Math.floor(Date.now() / 1000) + 3600;

// Create the withdrawBySig transaction
const tx = await papaya.withdrawBySig(amount, deadline);
await tx.wait();
```

### `withdrawTo()`

Withdraws tokens directly to another address.

```typescript
async withdrawTo(to: string, amount: bigint | number): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `to`: The recipient address
- `amount`: The amount of tokens to withdraw, should be formatted using `formatInput()`

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
const recipientAddress = '0x...';
// Format the amount correctly (25 USDT with 18 decimals)
const amount = formatInput('25', 18);

// Withdraw to the recipient
const tx = await papaya.withdrawTo(recipientAddress, amount);
await tx.wait();
```

## Subscription Methods

### `subscribe()`

Creates a new subscription to a creator.

```typescript
async subscribe(
  author: string, 
  amount: number | bigint,
  period: RatePeriod = RatePeriod.MONTH,
  projectId: number
): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `author`: The address of the creator to subscribe to
- `amount`: The amount of tokens for the subscription period
- `period`: (Optional) The subscription period (default: RatePeriod.MONTH)
- `projectId`: The project ID associated with the subscription

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
const creatorAddress = '0x...';
const tx = await papaya.subscribe(creatorAddress, 10, RatePeriod.MONTH, 0);
await tx.wait();
```

### `subscribeBySig()`

Creates a subscription transaction that can be signed off-chain and executed by anyone.

```typescript
async subscribeBySig(
  author: string, 
  amount: number | bigint,
  period: RatePeriod = RatePeriod.MONTH,
  projectId: number,
  deadline: number
): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `author`: The address of the creator to subscribe to
- `amount`: The amount of tokens for the subscription period
- `period`: (Optional) The subscription period (default: RatePeriod.MONTH)
- `projectId`: The project ID associated with the subscription
- `deadline`: Timestamp after which the transaction can't be executed

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
const creatorAddress = '0x...';
const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
const tx = await papaya.subscribeBySig(creatorAddress, 10, RatePeriod.MONTH, 0, deadline);
await tx.wait();
```

### `unsubscribe()`

Cancels a subscription to a creator.

```typescript
async unsubscribe(author: string): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `author`: The address of the creator to unsubscribe from

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
const creatorAddress = '0x...';
const tx = await papaya.unsubscribe(creatorAddress);
await tx.wait();
```

### `unsubscribeBySig()`

Creates an unsubscribe transaction that can be signed off-chain and executed by anyone.

```typescript
async unsubscribeBySig(author: string, deadline: number): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `author`: The address of the creator to unsubscribe from
- `deadline`: Timestamp after which the transaction can't be executed

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
const creatorAddress = '0x...';
const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
const tx = await papaya.unsubscribeBySig(creatorAddress, deadline);
await tx.wait();
```

### `getSubscriptions()`

Gets all subscriptions for an account.

```typescript
async getSubscriptions(account?: string): Promise<Subscription[]>
```

**Parameters:**
- `account`: (Optional) The address to get subscriptions for. If not provided, uses the connected signer's address.

**Returns:** Array of `Subscription` objects, each containing:
- `recipient`: The address receiving the subscription
- `incomeRate`: The rate at which the recipient is receiving tokens (raw format)
- `outgoingRate`: The rate at which the subscriber is paying tokens (raw format)
- `projectId`: The project ID associated with the subscription

**Note:** The `incomeRate` and `outgoingRate` values are per-second rates in their raw blockchain format. You should use the utility functions to convert them to human-readable values.

**Example:**
```typescript
// Get raw subscriptions
const subscriptions = await papaya.getSubscriptions();

// Format the subscription rates to human-readable monthly values
const formattedSubscriptions = subscriptions.map(sub => ({
  recipient: sub.recipient,
  incomeRate: convertRateToPeriod(formatOutput(sub.incomeRate, 18), RatePeriod.MONTH),
  outgoingRate: convertRateToPeriod(formatOutput(sub.outgoingRate, 18), RatePeriod.MONTH),
  projectId: sub.projectId
}));

// Display subscriptions
formattedSubscriptions.forEach(sub => {
  console.log(`Subscribed to ${sub.recipient} with rate ${sub.outgoingRate} USDT per month`);
});
```

### `isSubscribed()`

Checks if an account is subscribed to a specific creator.

```typescript
async isSubscribed(to: string, from?: string): Promise<{ isSubscribed: boolean; incomeRate: number; outgoingRate: number; projectId: number }>
```

**Parameters:**
- `to`: The creator's address
- `from`: (Optional) The subscriber's address. If not provided, uses the connected signer's address.

**Returns:** Object containing:
- `isSubscribed`: Boolean indicating if the subscription exists
- `incomeRate`: The rate at which the creator is receiving tokens (raw format)
- `outgoingRate`: The rate at which the subscriber is paying tokens (raw format)
- `projectId`: The project ID associated with the subscription

**Note:** The `incomeRate` and `outgoingRate` values are per-second rates in their raw blockchain format. You should use the utility functions to convert them to human-readable values.

**Example:**
```typescript
const creatorAddress = '0x...';
// Get raw subscription info
const subInfo = await papaya.isSubscribed(creatorAddress);

// Format the rates to human-readable monthly values
const formattedSubInfo = {
  isSubscribed: subInfo.isSubscribed,
  incomeRate: convertRateToPeriod(formatOutput(subInfo.incomeRate, 18), RatePeriod.MONTH),
  outgoingRate: convertRateToPeriod(formatOutput(subInfo.outgoingRate, 18), RatePeriod.MONTH),
  projectId: subInfo.projectId
};

if (formattedSubInfo.isSubscribed) {
  console.log(`Subscribed with rate: ${formattedSubInfo.outgoingRate} USDT per month`);
} else {
  console.log('Not subscribed');
}
```

## Payment Methods

### `pay()`

Makes a one-time payment to a recipient.

```typescript
async pay(receiver: string, amount: bigint | number): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `receiver`: The recipient's address
- `amount`: The amount of tokens to pay, should be formatted using `formatInput()`

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
const recipientAddress = '0x...';
// Format the amount correctly (20 USDT with 6 decimals)
const amount = formatInput('20', 6);

// Make the payment
const tx = await papaya.pay(recipientAddress, amount);
await tx.wait();
```

## Multicall Methods

Multicall allows you to execute multiple contract calls in a single transaction, which can save gas and improve user experience by reducing the number of transactions needed.

### `multicall()`

Executes multiple contract calls in a single transaction.

```typescript
async multicall(data: string[]): Promise<ethers.TransactionResponse>
```

**Parameters:**
- `data`: Array of encoded function call data (bytes). Each element should be the result of `contract.interface.encodeFunctionData()`.

**Returns:** An ethers.js `TransactionResponse` object.

**Example:**
```typescript
// Encode deposit call
const depositData = papaya.contract.interface.encodeFunctionData("deposit", [
  formatInput('100', 6),  // amount
  false                    // isPermit2
]);

// Encode subscribe call
const subscribeData = papaya.contract.interface.encodeFunctionData("subscribe", [
  '0x...',              // author address
  convertRatePerSecond('100', RatePeriod.MONTH),  // rate per second
  0                      // projectId
]);

// Execute both operations in one transaction
// Order is important: deposit first, then subscribe
const tx = await papaya.multicall([depositData, subscribeData]);
await tx.wait();
console.log('Multicall transaction completed!');
```

**Use Cases:**
- Combining deposit and subscribe operations
- Batch operations for better UX
- Atomic execution of multiple related operations

**Note:** The order of operations in the array matters. Make sure dependent operations come after their prerequisites (e.g., deposit before subscribe).

## Utility Methods

### `getTokenSymbol()`

Gets the current token symbol used by the SDK instance.

```typescript
getTokenSymbol(): TokenSymbol
```

**Returns:** The current token symbol.

**Example:**
```typescript
const token = papaya.getTokenSymbol();
console.log(`Using token: ${token}`); // 'USDT'
```

For more information on utility functions for rate conversion and data formatting, see the [Utility Functions](./utility-functions.md) documentation. 