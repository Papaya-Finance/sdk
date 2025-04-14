# Advanced Usage

This document covers advanced usage patterns and features of the Papaya SDK that allow for more sophisticated integrations and optimizations.

## Table of Contents

1. [BySig Methods](#bysig-methods)
2. [Gas Optimization](#gas-optimization)
3. [Working with Custom Contract Versions](#working-with-custom-contract-versions)
4. [Multiple Network Support](#multiple-network-support)
5. [Project Integrations](#project-integrations)
6. [Relayer Services](#relayer-services)
7. [Error Handling and Recovery](#error-handling-and-recovery)

## BySig Methods

The Papaya SDK provides "BySig" methods that allow for gasless transactions. These methods work by having users sign messages off-chain, which can then be submitted to the blockchain by anyone (typically a relayer service).

### How BySig Methods Work

1. The user signs a message containing the transaction data and a deadline
2. The signature and data are sent to a relayer
3. The relayer calls the corresponding BySig method on the contract, passing the signed data
4. The contract verifies the signature and executes the transaction as if the user had sent it directly

### Available BySig Methods

The SDK provides these BySig methods:

- `depositBySig()`: Deposit tokens without paying gas
- `withdrawBySig()`: Withdraw tokens without paying gas
- `subscribeBySig()`: Create a subscription without paying gas
- `unsubscribeBySig()`: Cancel a subscription without paying gas

### Example: Implementing a BySig Flow

```typescript
import { ethers } from 'ethers';
import { PapayaSDK } from '@papaya_fi/sdk';

// Example function to implement a gasless deposit
async function performGaslessDeposit(
  signer: ethers.Signer,
  amount: number,
  relayerUrl: string
) {
  // Create SDK instance
  const papaya = PapayaSDK.create(signer, 'polygon', 'USDT');
  
  // Set deadline to 1 hour from now
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  
  try {
    // Get transaction data with signature
    const tx = await papaya.depositBySig(amount, deadline);
    
    // In a real implementation, send the transaction to your relayer:
    const response = await fetch(relayerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txData: tx,
        chainId: await signer.getChainId(),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Relayer error: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.txHash; // Transaction hash from the relayer
  } catch (error) {
    console.error('Error in gasless deposit:', error);
    throw error;
  }
}
```

### Security Considerations for BySig Methods

When using BySig methods, be aware of these security considerations:

1. **Deadline**: Always include a reasonable deadline to prevent replay attacks.
2. **Relayer Trust**: Your relayer service should be trusted, as it could potentially withhold transactions.
3. **Signature Scope**: Signatures are specific to a network and contract. Make sure your relayer submits to the correct network.

## Gas Optimization

### Batching Transactions

If you need to perform multiple operations, consider batching them to minimize gas costs:

```typescript
import { ethers } from 'ethers';
import { PapayaSDK } from '@papaya_fi/sdk';

async function optimizedOperations(signer: ethers.Signer) {
  const papaya = PapayaSDK.create(signer, 'polygon', 'USDT');
  
  // Instead of multiple separate transactions:
  // await papaya.deposit(100);
  // await papaya.subscribe(creator1, 10);
  // await papaya.subscribe(creator2, 5);
  
  // Batch the operations in your UI/UX flow
  // First deposit enough tokens for everything
  const depositTx = await papaya.deposit(115); // 100 + 10 + 5
  await depositTx.wait();
  
  // Then do the subscriptions
  const [tx1, tx2] = await Promise.all([
    papaya.subscribe(creator1, 10),
    papaya.subscribe(creator2, 5)
  ]);
  
  await Promise.all([tx1.wait(), tx2.wait()]);
}
```

### Using isPermit2 for Deposits

The Papaya SDK supports using Permit2 for approving and depositing tokens in a single transaction, which saves gas:

```typescript
import { PapayaSDK } from '@papaya_fi/sdk';

async function depositWithPermit2(papaya: PapayaSDK, amount: number) {
  // Set isPermit2 to true to use Permit2 for approval and deposit in one transaction
  const tx = await papaya.deposit(amount, true);
  await tx.wait();
  console.log('Deposit with Permit2 completed successfully');
}
```

## Working with Custom Contract Versions

The Papaya SDK supports multiple contract versions for each network and token.

### Specifying a Contract Version

```typescript
import { PapayaSDK } from '@papaya_fi/sdk';

// Using a specific contract version
const papayaV1 = PapayaSDK.create(provider, 'polygon', 'USDT', '1');

// Using the latest version (default)
const papaya = PapayaSDK.create(provider, 'polygon', 'USDT');
```

### Working with Custom Contracts

You can also specify custom contract and token addresses:

```typescript
import { PapayaSDK, PapayaSDKOptions } from '@papaya_fi/sdk';

// Using custom addresses
const options: PapayaSDKOptions = {
  provider: signer,
  network: 'polygon',
  tokenSymbol: 'USDT',
  contractAddress: '0xCustomContractAddress',
  tokenAddress: '0xCustomTokenAddress'
};

const papaya = new PapayaSDK(options);
```

## Multiple Network Support

### Working with Multiple Networks Simultaneously

For applications that need to work with multiple networks, you can create multiple SDK instances:

```typescript
import { ethers } from 'ethers';
import { PapayaSDK, NetworkName } from '@papaya_fi/sdk';

// Function to create SDK instances for multiple networks
async function createMultiNetworkSDKs(privateKey: string) {
  const networks: NetworkName[] = ['polygon', 'bsc', 'mainnet'];
  const sdkInstances = {};
  
  for (const network of networks) {
    // Create provider for each network
    const provider = new ethers.JsonRpcProvider(getRpcUrl(network));
    const signer = new ethers.Wallet(privateKey, provider);
    
    // Create SDK instance
    sdkInstances[network] = PapayaSDK.create(signer, network, 'USDT');
  }
  
  return sdkInstances;
}

// Helper function to get RPC URL for a network
function getRpcUrl(network: NetworkName): string {
  const rpcUrls = {
    polygon: 'https://polygon-rpc.com',
    bsc: 'https://bsc-dataseed.binance.org',
    mainnet: 'https://eth.llamarpc.com',
    // Add more networks as needed
  };
  
  return rpcUrls[network] || rpcUrls['polygon']; // Default to polygon
}
```

### Dynamically Switching Networks

For applications that need to switch networks dynamically:

```typescript
import { ethers } from 'ethers';
import { PapayaSDK, NetworkName, TokenSymbol } from '@papaya_fi/sdk';

class NetworkManager {
  private signer: ethers.Signer;
  private currentSDK: PapayaSDK | null = null;
  private currentNetwork: NetworkName | null = null;
  
  constructor(signer: ethers.Signer) {
    this.signer = signer;
  }
  
  async switchNetwork(network: NetworkName, token: TokenSymbol = 'USDT') {
    if (network === this.currentNetwork) return this.currentSDK;
    
    try {
      // For browser wallet integration, you might need to request network switch
      if (window.ethereum) {
        const chainId = getChainId(network);
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      }
      
      // Create new SDK instance for the selected network
      this.currentSDK = PapayaSDK.create(this.signer, network, token);
      this.currentNetwork = network;
      
      return this.currentSDK;
    } catch (error) {
      console.error(`Error switching to network ${network}:`, error);
      throw error;
    }
  }
  
  getCurrentSDK(): PapayaSDK {
    if (!this.currentSDK) {
      throw new Error('No network selected. Call switchNetwork first.');
    }
    return this.currentSDK;
  }
}

// Helper function to get chain ID for a network
function getChainId(network: NetworkName): number {
  const chainIds = {
    polygon: 137,
    bsc: 56,
    avalanche: 43114,
    base: 8453,
    scroll: 534352,
    arbitrum: 42161,
    mainnet: 1,
    sei: 32741,
    zksync: 324
  };
  
  return chainIds[network] || 137; // Default to polygon
}
```

## Project Integrations

The Papaya SDK supports project-based subscriptions, which can be used to build creator platforms with revenue sharing.

### Creating a Subscription with Project ID

```typescript
import { PapayaSDK, RatePeriod } from '@papaya_fi/sdk';

async function subscribeToProject(
  papaya: PapayaSDK,
  creatorAddress: string,
  amount: number,
  projectId: number
) {
  // Subscribe to the creator with a specific project ID
  const tx = await papaya.subscribe(
    creatorAddress,
    amount,
    RatePeriod.MONTH,
    projectId
  );
  
  await tx.wait();
  console.log(`Subscribed to creator ${creatorAddress} for project ${projectId}`);
}
```

### Project Fee Distribution

When a subscription includes a project ID, a portion of the subscription payment can be automatically distributed to the project owner according to the project fee percentage.

For example, if a project has a 5% fee and a user subscribes for 100 USDT per month:
- 95 USDT goes to the creator
- 5 USDT goes to the project owner

## Relayer Services

To fully leverage BySig methods, you'll need a relayer service to submit the signed transactions to the blockchain.

### Building a Simple Relayer

Here's a basic example of how to build a simple relayer service using Node.js and Express:

```typescript
// relayer.ts
import express from 'express';
import { ethers } from 'ethers';
import { PapayaSDK } from '@papaya_fi/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const NETWORKS = {
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed.binance.org',
  mainnet: 'https://eth.llamarpc.com',
  // Add more networks as needed
};

// Initialize providers and signers for each network
const providers = {};
const signers = {};
const sdkInstances = {};

Object.entries(NETWORKS).forEach(([network, rpcUrl]) => {
  providers[network] = new ethers.JsonRpcProvider(rpcUrl);
  signers[network] = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, providers[network]);
  sdkInstances[network] = PapayaSDK.create(signers[network], network as any, 'USDT');
});

// Endpoint to handle gasless deposits
app.post('/api/relay/deposit', async (req, res) => {
  try {
    const { txData, chainId } = req.body;
    
    // Determine network from chain ID
    const network = getNetworkFromChainId(chainId);
    if (!network || !sdkInstances[network]) {
      return res.status(400).json({ 
        success: false, 
        error: 'Unsupported network' 
      });
    }
    
    // Submit the transaction
    const provider = providers[network];
    const signer = signers[network];
    
    // Here you would extract the necessary data from txData
    // and call the contract's bySig method directly
    
    // For a complete implementation, you would:
    // 1. Extract user address, amount, deadline, and signature from txData
    // 2. Call the contract directly with these parameters
    // 3. Return the transaction hash
    
    // Simplified example (this is not complete and would need adaptation):
    const tx = await signer.sendTransaction(txData);
    const receipt = await tx.wait();
    
    return res.json({
      success: true,
      txHash: receipt.hash
    });
  } catch (error) {
    console.error('Relayer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Relayer error: ' + error.message
    });
  }
});

function getNetworkFromChainId(chainId: number): string | null {
  const chainIdMap = {
    1: 'mainnet',
    56: 'bsc',
    137: 'polygon',
    // Add more as needed
  };
  
  return chainIdMap[chainId] || null;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Relayer service running on port ${PORT}`);
});
```

### Gasless Deposit Example with curl

```typescript
// Set variables for easier reuse
RELAYER_URL="https://your-relayer-service.com/api/relay/deposit"
CHAIN_ID=137  # Polygon network

// Create the JSON payload
// This would typically contain the signed transaction data from papaya.depositBySig()
curl -X POST $RELAYER_URL \
  -H "Content-Type: application/json" \
  -d '{
    "txData": {
      "from": "0xYourWalletAddress",
      "amount": "10000000",
      "deadline": 1719161600,
      "signature": "0x123abc...signature_data_here",
      "nonce": 1
    },
    "chainId": '$CHAIN_ID'
  }'
```

### Complete Example Workflow

Here's a more complete example showing the entire workflow:
1. First, you would use the SDK in your application to create the signed transaction:

```typescript
// In your frontend application
const amount = formatInput('10', 6); // 10 USDT
const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
const signedTx = await papaya.depositBySig(amount, deadline);

// Store the transaction data to send to your relayer
const txData = {
  from: await signer.getAddress(),
  amount: amount.toString(),
  deadline: deadline,
  signature: signedTx.signature,
  nonce: signedTx.nonce
};
```

2. Then use curl to send this data to your relayer: 

```bash
curl -X POST https://your-relayer-service.com/api/relay/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "txData": {
      "from": "0x123...yourAddress",
      "amount": "10000000",
      "deadline": 1719161600,
      "signature": "0xabc...signatureData",
      "nonce": 1
    },
    "chainId": 137
  }'
```

3. The relayer service would respond with the transaction hash:

```json
{
  "success": true,
  "txHash": "0x456...transactionHash"
}
```

### Relayer Security Considerations

When building a relayer service, consider these security measures:

1. **Rate Limiting**: Implement rate limiting to prevent DoS attacks.
2. **Signature Verification**: Verify signatures before submitting transactions.
3. **Deadline Enforcement**: Reject transactions with expired deadlines.
4. **Nonce Management**: Track used nonces to prevent replay attacks.
5. **Gas Price Management**: Implement dynamic gas pricing to ensure transactions are processed efficiently.

## Error Handling and Recovery

### Common Errors and Solutions

| Error | Potential Cause | Solution |
|-------|----------------|----------|
| "Insufficient allowance" | Token approval needed | Call the token's approve method before depositing |
| "Insufficient balance" | User doesn't have enough tokens | Inform user to get more tokens |
| "Transaction underpriced" | Gas price too low | Increase gas price or wait for network congestion to decrease |
| "Nonce too low" | Transaction with same nonce already processed | Reset nonce or use the next available nonce |
| "Deadline expired" | BySig transaction submitted after deadline | Generate a new signature with a future deadline |

### Implementing Robust Error Handling

```typescript
import { PapayaSDK } from '@papaya_fi/sdk';
import { ethers } from 'ethers';

async function robustDeposit(papaya: PapayaSDK, amount: number): Promise<boolean> {
  try {
    const tx = await papaya.deposit(amount);
    await tx.wait();
    return true;
  } catch (error) {
    // Handle specific errors
    if (error.message.includes('insufficient allowance')) {
      console.warn('Token approval needed. Attempting to approve...');
      try {
        // Attempt to approve tokens and retry
        // This would require implementing an approveTokens function
        await approveTokens(papaya, amount);
        
        // Retry deposit
        const tx = await papaya.deposit(amount);
        await tx.wait();
        return true;
      } catch (approvalError) {
        console.error('Failed to approve tokens:', approvalError);
        throw new Error('Token approval failed. Please approve tokens manually.');
      }
    } else if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient balance. Please add more tokens to your wallet.');
    } else {
      // Generic error handling
      console.error('Deposit error:', error);
      throw error;
    }
  }
}

// Example function to approve tokens (implementation would depend on your setup)
async function approveTokens(papaya: PapayaSDK, amount: number) {
  // Implementation would depend on how you access the token contract
  // This is just a placeholder
  const tokenContract = getTokenContract();
  const tx = await tokenContract.approve(papaya.getContractAddress(), amount);
  await tx.wait();
}
```

### Transaction Monitoring and Recovery

For critical operations, implement transaction monitoring and recovery:

```typescript
import { PapayaSDK } from '@papaya_fi/sdk';
import { ethers } from 'ethers';

async function monitorTransaction(
  txHash: string,
  provider: ethers.Provider,
  maxAttempts: number = 10
): Promise<ethers.TransactionReceipt> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt) {
        // Check if transaction was successful
        if (receipt.status === 1) {
          return receipt;
        } else {
          throw new Error('Transaction failed');
        }
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    } catch (error) {
      if (attempts >= maxAttempts) {
        throw error;
      }
      
      // Wait longer before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
  }
  
  throw new Error('Transaction not confirmed after maximum attempts');
}

// Usage example
async function safeDeposit(papaya: PapayaSDK, amount: number) {
  try {
    const tx = await papaya.deposit(amount);
    console.log(`Transaction sent: ${tx.hash}`);
    
    // Monitor transaction
    const receipt = await monitorTransaction(tx.hash, papaya.getProvider());
    console.log(`Deposit confirmed in block ${receipt.blockNumber}`);
    
    return receipt;
  } catch (error) {
    console.error('Deposit failed:', error);
    // Implement recovery logic here if needed
    throw error;
  }
}
```

These advanced techniques will help you build robust applications that leverage the full power of the Papaya SDK while ensuring optimal performance and user experience. 