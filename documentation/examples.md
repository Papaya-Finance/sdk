# Papaya SDK Examples

This document provides practical examples of how to use the Papaya SDK in various scenarios.

## Table of Contents

1. [Browser Integration](#browser-integration)
2. [Node.js Server Integration](#nodejs-server-integration)
3. [Creator Subscription Platform](#creator-subscription-platform)
4. [Quick Subscription with Multicall](#quick-subscription-with-multicall)
5. [Content Monetization](#content-monetization)
6. [Streaming Payments](#streaming-payments)
7. [Gasless Transactions](#gasless-transactions)
8. [Advanced Subscription Management](#advanced-subscription-management)

## Browser Integration

This example demonstrates how to integrate the Papaya SDK with a browser-based web application using a browser wallet like MetaMask.

```typescript
// App.tsx or App.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PapayaSDK } from '@papaya_fi/sdk';

function App() {
  const [papaya, setPapaya] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  
  // Initialize SDK when the component mounts
  useEffect(() => {
    async function initializePapaya() {
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          
          // Create Papaya SDK instance
          const papayaInstance = PapayaSDK.create(signer, 'polygon', 'USDT');
          
          // Get user balance
          const userBalance = await papayaInstance.balanceOf();
          
          setPapaya(papayaInstance);
          setAccount(userAddress);
          setBalance(userBalance.toString());
          setLoading(false);
        } catch (error) {
          console.error('Error initializing Papaya SDK:', error);
          setLoading(false);
        }
      } else {
        console.log('Please install MetaMask!');
        setLoading(false);
      }
    }
    
    initializePapaya();
  }, []);
  
  // Function to handle deposits
  async function handleDeposit() {
    if (!papaya) return;
    
    try {
      const tx = await papaya.deposit(10); // Deposit 10 USDT
      await tx.wait();
      
      // Update balance
      const newBalance = await papaya.balanceOf();
      setBalance(newBalance.toString());
      
      alert('Deposit successful!');
    } catch (error) {
      console.error('Error depositing funds:', error);
      alert('Error depositing funds. See console for details.');
    }
  }
  
  return (
    <div className="App">
      <h1>Papaya SDK Demo</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Connected account: {account}</p>
          <p>Your balance: {balance} USDT</p>
          
          <button onClick={handleDeposit}>
            Deposit 10 USDT
          </button>
        </>
      )}
    </div>
  );
}

export default App;
```

## Node.js Server Integration

This example shows how to integrate the Papaya SDK in a Node.js backend application for server-side operations.

```typescript
// server.ts
import express from 'express';
import { ethers } from 'ethers';
import { PapayaSDK } from '@papaya_fi/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Initialize the SDK
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const privateKey = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);
const papaya = PapayaSDK.create(signer, 'polygon', 'USDT');

// Endpoint to get user info
app.get('/api/user/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const userInfo = await papaya.getUserInfo(address);
    
    res.json({
      success: true,
      data: {
        balance: userInfo.balance,
        incomeRate: userInfo.incomeRate,
        outgoingRate: userInfo.outgoingRate,
        updated: userInfo.updated
      }
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user info'
    });
  }
});

// Endpoint to deposit tokens for a user
app.post('/api/deposit', async (req, res) => {
  try {
    const { address, amount } = req.body;
    
    if (!address || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Address and amount are required'
      });
    }
    
    const tx = await papaya.depositFor(amount, address);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      data: {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    });
  } catch (error) {
    console.error('Error depositing funds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deposit funds'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Creator Subscription Platform

This example demonstrates how to build a simple creator subscription platform using the Papaya SDK.

```typescript
// CreatorProfile.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PapayaSDK, RatePeriod, formatInput, formatOutput, convertRateToPeriod } from '@papaya_fi/sdk';

interface CreatorProfileProps {
  creatorAddress: string;
  projectId: number;
}

function CreatorProfile({ creatorAddress, projectId }: CreatorProfileProps) {
  const [papaya, setPapaya] = useState<PapayaSDK | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionRate, setSubscriptionRate] = useState(0);
  const [amount, setAmount] = useState(5); // Default subscription amount
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  
  useEffect(() => {
    async function initializeAndCheckSubscription() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const papayaInstance = PapayaSDK.create(signer, 'polygon', 'USDT');
          setPapaya(papayaInstance);
          
          // Check if user is already subscribed
          const subInfo = await papayaInstance.isSubscribed(creatorAddress);
          setIsSubscribed(subInfo.isSubscribed);
          setSubscriptionRate(subInfo.outgoingRate);
          
          setLoading(false);
        } catch (error) {
          console.error('Error:', error);
          setLoading(false);
        }
      } else {
        alert('Please install MetaMask to use this feature!');
        setLoading(false);
      }
    }
    
    initializeAndCheckSubscription();
  }, [creatorAddress]);
  
  async function handleSubscribe() {
    if (!papaya) return;
    
    setSubscribing(true);
    
    try {
      const tx = await papaya.subscribe(
        creatorAddress,
        amount,
        RatePeriod.MONTH,
        projectId
      );
      
      await tx.wait();
      
      // Update subscription status
      const subInfo = await papaya.isSubscribed(creatorAddress);
      setIsSubscribed(subInfo.isSubscribed);
      setSubscriptionRate(subInfo.outgoingRate);
      
      alert('Successfully subscribed!');
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe. See console for details.');
    } finally {
      setSubscribing(false);
    }
  }
  
  async function handleUnsubscribe() {
    if (!papaya) return;
    
    setSubscribing(true);
    
    try {
      const tx = await papaya.unsubscribe(creatorAddress);
      await tx.wait();
      
      setIsSubscribed(false);
      setSubscriptionRate(0);
      
      alert('Successfully unsubscribed!');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Failed to unsubscribe. See console for details.');
    } finally {
      setSubscribing(false);
    }
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="creator-profile">
      <h2>Creator Profile</h2>
      <p>Creator Address: {creatorAddress}</p>
      
      {isSubscribed ? (
        <>
          <p>You are currently subscribed at a rate of {subscriptionRate} tokens per second.</p>
          <button 
            onClick={handleUnsubscribe}
            disabled={subscribing}
          >
            {subscribing ? 'Processing...' : 'Unsubscribe'}
          </button>
        </>
      ) : (
        <>
          <p>Subscribe to this creator:</p>
          <div>
            <label>
              Amount per month:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1"
              />
            </label>
          </div>
          <button 
            onClick={handleSubscribe}
            disabled={subscribing}
          >
            {subscribing ? 'Processing...' : 'Subscribe'}
          </button>
        </>
      )}
    </div>
  );
}

export default CreatorProfile;
```

## Quick Subscription with Multicall

This example demonstrates how to use the `depositAndSubscribe()` method to combine deposit and subscription operations in a single transaction, saving gas and improving user experience.

```typescript
// QuickSubscribe.tsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { PapayaSDK, RatePeriod } from '@papaya_fi/sdk';

interface QuickSubscribeProps {
  creatorAddress: string;
  projectId: number;
}

function QuickSubscribe({ creatorAddress, projectId }: QuickSubscribeProps) {
  const [papaya, setPapaya] = useState<PapayaSDK | null>(null);
  const [depositAmount, setDepositAmount] = useState('100');
  const [subscriptionRate, setSubscriptionRate] = useState('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize SDK
  React.useEffect(() => {
    async function initialize() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const papayaInstance = PapayaSDK.create(signer, 'polygon', 'USDT');
          setPapaya(papayaInstance);
        } catch (error) {
          console.error('Error initializing SDK:', error);
          setError('Failed to initialize. Please make sure MetaMask is connected.');
        }
      } else {
        setError('Please install MetaMask!');
      }
    }
    
    initialize();
  }, []);
  
  // Handle quick subscription (deposit + subscribe in one transaction)
  async function handleQuickSubscribe() {
    if (!papaya) {
      setError('SDK not initialized');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Deposit and subscribe in a single transaction
      const tx = await papaya.depositAndSubscribe(
        creatorAddress,        // author
        depositAmount,         // deposit amount ($100)
        subscriptionRate,      // subscription rate ($100/month)
        RatePeriod.MONTH,     // period
        projectId,            // projectId
        false,                // isPermit2
        6                     // decimals (USDT/USDC)
      );
      
      logOutput(`Transaction sent: ${tx.hash}`);
      logOutput('Waiting for confirmation...');
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        logOutput('✅ Success! Deposit and subscription completed in one transaction!');
        logOutput(`Transaction confirmed in block: ${receipt.blockNumber}`);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error in quick subscribe:', error);
      setError(error.message || 'Failed to complete quick subscription');
    } finally {
      setLoading(false);
    }
  }
  
  // Helper function for logging
  function logOutput(message: string) {
    console.log(message);
    // In a real app, you might want to display this in the UI
  }
  
  if (error && !papaya) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="quick-subscribe">
      <h2>Quick Subscribe</h2>
      <p className="info">
        Deposit and subscribe in a single transaction to save gas and improve UX.
      </p>
      
      <div className="form-group">
        <label>
          Deposit Amount (USDT):
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="100"
            min="1"
          />
        </label>
        <small>Amount to deposit into your Papaya account</small>
      </div>
      
      <div className="form-group">
        <label>
          Subscription Rate (USDT/month):
          <input
            type="number"
            value={subscriptionRate}
            onChange={(e) => setSubscriptionRate(e.target.value)}
            placeholder="100"
            min="1"
          />
        </label>
        <small>Monthly subscription rate</small>
      </div>
      
      <div className="form-group">
        <label>
          Creator Address:
          <input
            type="text"
            value={creatorAddress}
            readOnly
            disabled
          />
        </label>
      </div>
      
      <div className="form-group">
        <label>
          Project ID:
          <input
            type="number"
            value={projectId}
            readOnly
            disabled
          />
        </label>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <button
        onClick={handleQuickSubscribe}
        disabled={loading || !papaya}
        className="primary-button"
      >
        {loading ? 'Processing...' : 'Deposit & Subscribe'}
      </button>
      
      <div className="benefits">
        <h3>Benefits of using depositAndSubscribe:</h3>
        <ul>
          <li>✅ Saves gas by combining two operations into one transaction</li>
          <li>✅ Atomic execution: both operations succeed or both fail</li>
          <li>✅ Better UX: only one transaction confirmation needed</li>
          <li>✅ Faster: no need to wait for deposit confirmation before subscribing</li>
        </ul>
      </div>
    </div>
  );
}

export default QuickSubscribe;
```

### Using Multicall Directly

If you need more control or want to combine different operations, you can use the `multicall()` method directly:

```typescript
// CustomMulticall.ts
import { ethers } from 'ethers';
import { PapayaSDK, formatInput, convertRatePerSecond, RatePeriod } from '@papaya_fi/sdk';

async function customMulticallExample(papaya: PapayaSDK) {
  const creatorAddress = '0x...';
  const depositAmount = '100';
  const subscriptionRate = '100';
  const projectId = 0;
  
  // Encode deposit call
  const depositData = papaya.contract.interface.encodeFunctionData("deposit", [
    formatInput(depositAmount, 6),  // amount in wei
    false                            // isPermit2
  ]);
  
  // Encode subscribe call
  const subscribeData = papaya.contract.interface.encodeFunctionData("subscribe", [
    creatorAddress,
    convertRatePerSecond(subscriptionRate, RatePeriod.MONTH),
    projectId
  ]);
  
  // Execute both operations in one transaction
  // Order is important: deposit first, then subscribe
  const tx = await papaya.multicall([depositData, subscribeData]);
  
  const receipt = await tx.wait();
  
  if (receipt.status === 1) {
    console.log('Multicall transaction successful!');
    console.log(`Block: ${receipt.blockNumber}`);
  } else {
    throw new Error('Transaction failed');
  }
}
```

## Content Monetization

This example shows how to implement a simple content access system based on Papaya subscriptions.

```typescript
// ProtectedContent.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PapayaSDK } from '@papaya_fi/sdk';

interface ProtectedContentProps {
  creatorAddress: string;
  content: React.ReactNode;
  subscriptionRequired: boolean;
}

function ProtectedContent({ creatorAddress, content, subscriptionRequired }: ProtectedContentProps) {
  const [papaya, setPapaya] = useState<PapayaSDK | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!subscriptionRequired) {
      setLoading(false);
      return;
    }
    
    async function checkSubscription() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const papayaInstance = PapayaSDK.create(signer, 'polygon', 'USDT');
          setPapaya(papayaInstance);
          
          // Check if user is subscribed
          const subInfo = await papayaInstance.isSubscribed(creatorAddress);
          setIsSubscribed(subInfo.isSubscribed);
          
          setLoading(false);
        } catch (error) {
          console.error('Error checking subscription:', error);
          setLoading(false);
        }
      } else {
        console.log('Please install MetaMask!');
        setLoading(false);
      }
    }
    
    checkSubscription();
  }, [creatorAddress, subscriptionRequired]);
  
  // One-time payment to access content
  async function handleOneTimePayment() {
    if (!papaya) return;
    
    try {
      // Pay 2 tokens to access content
      const tx = await papaya.pay(creatorAddress, 2);
      await tx.wait();
      
      // Grant access after payment
      setIsSubscribed(true);
      
      alert('Payment successful! You now have access to the content.');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. See console for details.');
    }
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If subscription is not required or user is subscribed, show content
  if (!subscriptionRequired || isSubscribed) {
    return <div className="content-container">{content}</div>;
  }
  
  // Otherwise, show subscription options
  return (
    <div className="content-restricted">
      <h3>Subscribe to Access Content</h3>
      <p>This content is available exclusively to subscribers.</p>
      
      <div className="payment-options">
        <button onClick={() => window.location.href = `/subscribe/${creatorAddress}`}>
          Subscribe Monthly
        </button>
        <button onClick={handleOneTimePayment}>
          Pay 2 USDT for One-time Access
        </button>
      </div>
    </div>
  );
}

export default ProtectedContent;
```

## Streaming Payments

This example demonstrates how to use the Papaya SDK for streaming payments in a service that requires continuous payment.

```typescript
// StreamingService.ts
import { ethers } from 'ethers';
import { PapayaSDK, RatePeriod } from '@papaya_fi/sdk';

export class StreamingService {
  private papaya: PapayaSDK | null = null;
  private serviceAddress: string;
  private streamingRatePerHour: number;
  private projectId: number;
  
  constructor(serviceAddress: string, ratePerHour: number, projectId: number = 0) {
    this.serviceAddress = serviceAddress;
    this.streamingRatePerHour = ratePerHour;
    this.projectId = projectId;
  }
  
  // Initialize the SDK
  async initialize() {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      this.papaya = PapayaSDK.create(signer, 'polygon', 'USDT');
      return true;
    } else {
      throw new Error('Ethereum provider not found');
    }
  }
  
  // Check if streaming is active
  async isStreamingActive(): Promise<boolean> {
    if (!this.papaya) throw new Error('SDK not initialized');
    
    const subInfo = await this.papaya.isSubscribed(this.serviceAddress);
    return subInfo.isSubscribed;
  }
  
  // Start streaming payment
  async startStreaming(): Promise<string> {
    if (!this.papaya) throw new Error('SDK not initialized');
    
    // Convert hourly rate to monthly for the subscription
    const monthlyRate = this.streamingRatePerHour * 24 * 30;
    
    const tx = await this.papaya.subscribe(
      this.serviceAddress,
      monthlyRate,
      RatePeriod.MONTH,
      this.projectId
    );
    
    const receipt = await tx.wait();
    return receipt.hash;
  }
  
  // Stop streaming payment
  async stopStreaming(): Promise<string> {
    if (!this.papaya) throw new Error('SDK not initialized');
    
    const tx = await this.papaya.unsubscribe(this.serviceAddress);
    const receipt = await tx.wait();
    return receipt.hash;
  }
  
  // Get current streaming stats
  async getStreamingStats(): Promise<{
    isActive: boolean;
    currentRate: number;
    totalPaid: number;
  }> {
    if (!this.papaya) throw new Error('SDK not initialized');
    
    const subInfo = await this.papaya.isSubscribed(this.serviceAddress);
    
    // TODO: Calculate total paid based on start time and rate
    // This would require additional tracking of when the stream started
    
    return {
      isActive: subInfo.isSubscribed,
      currentRate: subInfo.outgoingRate,
      totalPaid: 0 // Placeholder, would need additional tracking
    };
  }
}

// Usage example
/*
const streamingService = new StreamingService('0xServiceAddress', 0.5); // 0.5 USDT per hour
await streamingService.initialize();

// To start streaming
try {
  await streamingService.startStreaming();
  console.log('Streaming started!');
} catch (error) {
  console.error('Failed to start streaming:', error);
}

// Later, to stop streaming
try {
  await streamingService.stopStreaming();
  console.log('Streaming stopped!');
} catch (error) {
  console.error('Failed to stop streaming:', error);
}
*/
```

## Gasless Transactions

This example demonstrates how to use the BySig methods to enable gasless transactions in the Papaya SDK.

```typescript
// GaslessTransactions.ts
import { ethers } from 'ethers';
import { PapayaSDK, RatePeriod } from '@papaya_fi/sdk';

export class GaslessService {
  private papaya: PapayaSDK | null = null;
  private relayerEndpoint: string;
  
  constructor(relayerEndpoint: string) {
    this.relayerEndpoint = relayerEndpoint;
  }
  
  async initialize() {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      this.papaya = PapayaSDK.create(signer, 'polygon', 'USDT');
      return true;
    } else {
      throw new Error('Ethereum provider not found');
    }
  }
  
  // Deposit tokens without paying gas
  async gaslessDeposit(amount: number): Promise<string> {
    if (!this.papaya) throw new Error('SDK not initialized');
    
    try {
      // Set deadline for 1 hour from now
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Use depositBySig to get the transaction data
      const tx = await this.papaya.depositBySig(amount, deadline);
      
      // In a real implementation, we would send the signed transaction
      // to a relayer service that would execute it on behalf of the user
      
      // For this example, we're simulating the relayer response
      // In a real app, you would send the tx data to your relayer
      const relayerResponse = await this.simulateRelayerSubmission(tx);
      
      return relayerResponse.txHash;
    } catch (error) {
      console.error('Error in gasless deposit:', error);
      throw error;
    }
  }
  
  // Subscribe without paying gas
  async gaslessSubscribe(
    creatorAddress: string,
    amount: number,
    period: RatePeriod = RatePeriod.MONTH,
    projectId: number = 0
  ): Promise<string> {
    if (!this.papaya) throw new Error('SDK not initialized');
    
    try {
      // Set deadline for 1 hour from now
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Use subscribeBySig to get the transaction data
      const tx = await this.papaya.subscribeBySig(
        creatorAddress,
        amount,
        period,
        projectId,
        deadline
      );
      
      // In a real implementation, we would send the signed transaction
      // to a relayer service that would execute it on behalf of the user
      
      // For this example, we're simulating the relayer response
      const relayerResponse = await this.simulateRelayerSubmission(tx);
      
      return relayerResponse.txHash;
    } catch (error) {
      console.error('Error in gasless subscribe:', error);
      throw error;
    }
  }
  
  // Unsubscribe without paying gas
  async gaslessUnsubscribe(creatorAddress: string): Promise<string> {
    if (!this.papaya) throw new Error('SDK not initialized');
    
    try {
      // Set deadline for 1 hour from now
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Use unsubscribeBySig to get the transaction data
      const tx = await this.papaya.unsubscribeBySig(creatorAddress, deadline);
      
      // For this example, we're simulating the relayer response
      const relayerResponse = await this.simulateRelayerSubmission(tx);
      
      return relayerResponse.txHash;
    } catch (error) {
      console.error('Error in gasless unsubscribe:', error);
      throw error;
    }
  }
  
  // Withdraw without paying gas
  async gaslessWithdraw(amount: number): Promise<string> {
    if (!this.papaya) throw new Error('SDK not initialized');
    
    try {
      // Set deadline for 1 hour from now
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Use withdrawBySig to get the transaction data
      const tx = await this.papaya.withdrawBySig(amount, deadline);
      
      // For this example, we're simulating the relayer response
      const relayerResponse = await this.simulateRelayerSubmission(tx);
      
      return relayerResponse.txHash;
    } catch (error) {
      console.error('Error in gasless withdraw:', error);
      throw error;
    }
  }
  
  // Simulate sending the transaction to a relayer
  // In a real implementation, this would be an API call to your relayer service
  private async simulateRelayerSubmission(tx: any): Promise<{ txHash: string }> {
    // In a real implementation, you would make an API call to your relayer:
    /*
    const response = await fetch(this.relayerEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: tx,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Relayer error: ${response.statusText}`);
    }
    
    return await response.json();
    */
    
    // For this example, we're just returning a fake transaction hash
    return {
      txHash: `0x${Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`
    };
  }
}

// Usage example
/*
const gaslessService = new GaslessService('https://your-relayer-api.com/relay');
await gaslessService.initialize();

// Gasless deposit
try {
  const txHash = await gaslessService.gaslessDeposit(10);
  console.log('Deposit transaction submitted:', txHash);
} catch (error) {
  console.error('Failed to deposit:', error);
}

// Gasless subscribe
try {
  const txHash = await gaslessService.gaslessSubscribe('0xCreatorAddress', 5);
  console.log('Subscription transaction submitted:', txHash);
} catch (error) {
  console.error('Failed to subscribe:', error);
}
*/
```

## Advanced Subscription Management

This example shows how to build a dashboard for managing multiple subscriptions using the Papaya SDK.

```typescript
// SubscriptionDashboard.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PapayaSDK, Subscription, RatePeriod } from '@papaya_fi/sdk';

function SubscriptionDashboard() {
  const [papaya, setPapaya] = useState<PapayaSDK | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function initialize() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const papayaInstance = PapayaSDK.create(signer, 'polygon', 'USDT');
          setPapaya(papayaInstance);
          
          // Load user info
          const info = await papayaInstance.getUserInfo();
          setUserInfo(info);
          
          // Load subscriptions
          const subs = await papayaInstance.getSubscriptions();
          setSubscriptions(subs);
          
          setLoading(false);
        } catch (error) {
          console.error('Error initializing:', error);
          setError('Failed to initialize dashboard. Please make sure MetaMask is connected.');
          setLoading(false);
        }
      } else {
        setError('Please install MetaMask to use this dashboard.');
        setLoading(false);
      }
    }
    
    initialize();
  }, []);
  
  // Function to handle unsubscribe
  async function handleUnsubscribe(creatorAddress: string) {
    if (!papaya) return;
    
    try {
      const tx = await papaya.unsubscribe(creatorAddress);
      await tx.wait();
      
      // Refresh subscriptions
      const subs = await papaya.getSubscriptions();
      setSubscriptions(subs);
      
      // Refresh user info
      const info = await papaya.getUserInfo();
      setUserInfo(info);
      
      alert('Successfully unsubscribed!');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Failed to unsubscribe. See console for details.');
    }
  }
  
  // Function to handle deposit
  async function handleDeposit() {
    if (!papaya) return;
    
    const amount = prompt('Enter amount to deposit:');
    if (!amount) return;
    
    try {
      const tx = await papaya.deposit(Number(amount));
      await tx.wait();
      
      // Refresh user info
      const info = await papaya.getUserInfo();
      setUserInfo(info);
      
      alert('Deposit successful!');
    } catch (error) {
      console.error('Error depositing:', error);
      alert('Failed to deposit. See console for details.');
    }
  }
  
  // Function to handle withdraw
  async function handleWithdraw() {
    if (!papaya) return;
    
    const amount = prompt('Enter amount to withdraw:');
    if (!amount) return;
    
    try {
      const tx = await papaya.withdraw(Number(amount));
      await tx.wait();
      
      // Refresh user info
      const info = await papaya.getUserInfo();
      setUserInfo(info);
      
      alert('Withdrawal successful!');
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Failed to withdraw. See console for details.');
    }
  }
  
  if (loading) {
    return <div>Loading dashboard...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="subscription-dashboard">
      <h1>Subscription Dashboard</h1>
      
      <div className="user-info">
        <h2>Account Information</h2>
        <p>Balance: {formatOutput(BigInt(userInfo.balance), 18)} USDT</p>
        <p>Total Income Rate: {convertRateToPeriod(Number(formatOutput(userInfo.incomeRate, 18)), RatePeriod.MONTH)} per month</p>
        <p>Total Outgoing Rate: {convertRateToPeriod(Number(formatOutput(userInfo.outgoingRate, 18)), RatePeriod.MONTH)} per month</p>
        
        <div className="actions">
          <button onClick={handleDeposit}>Deposit</button>
          <button onClick={handleWithdraw}>Withdraw</button>
        </div>
      </div>
      
      <div className="subscriptions">
        <h2>Your Subscriptions</h2>
        
        {subscriptions.length === 0 ? (
          <p>You don't have any active subscriptions.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Rate (per second)</th>
                <th>Project ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, index) => (
                <tr key={index}>
                  <td>{sub.recipient}</td>
                  <td>{sub.outgoingRate}</td>
                  <td>{sub.projectId}</td>
                  <td>
                    <button 
                      onClick={() => handleUnsubscribe(sub.recipient)}
                    >
                      Unsubscribe
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SubscriptionDashboard;
```

These examples demonstrate a variety of ways to integrate and use the Papaya SDK in your applications. They can be adapted and extended to fit your specific use cases. 