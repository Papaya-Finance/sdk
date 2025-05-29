import { ethers } from 'ethers';
import { Papaya } from '../contracts/abi';
import { NETWORKS, DEFAULT_VERSIONS, NetworkName, TokenSymbol } from '../contracts/networks';
import { PapayaSDKOptions, Subscription, UserInfo } from '../types';
import { RatePeriod, decodeRates, convertRatePerSecond } from '../utils/rateConversion';

// Define a TokenConfig type to match the structure in networks.ts
type TokenConfig = {
  version: string;
  contractAddress: string;
  tokenAddress: string;
  tokenPriceFeed: string;
  coinPriceFeed: string;
};

/**
 * Main SDK class for interacting with the Papaya Protocol
 */
export class PapayaSDK {
  private provider: ethers.Provider;
  private signer: ethers.Signer | null;
  private contract: ethers.Contract;
  private contractVersion: string;

  /**
   * Creates a new PapayaSDK instance
   * 
   * @param options - Configuration options for the SDK
   */
  public constructor(options: PapayaSDKOptions) {
    // Set provider and signer
    if ('getAddress' in options.provider && typeof options.provider.getAddress === 'function') {
      // It's a signer
      this.signer = options.provider as ethers.Signer;
      this.provider = this.signer.provider as ethers.Provider;
    } else {
      // It's a provider
      this.provider = options.provider as ethers.Provider;
      this.signer = null;
    }

    if (!options.contractVersion) {
      throw new Error(`Contract version not supplied!`);
    }
    // Set network and token symbol
    this.contractVersion = options.contractVersion;

    if (!options.contractAddress) {
      throw new Error(`Contract addres not supplied!`);
    }

    // Set contract address and token address
    const contractAddress = options.contractAddress;
    
   

    // Initialize contract
    this.contract = new ethers.Contract(
      contractAddress,
      Papaya,
      this.signer || this.provider
    );
  }

  /**
   * Factory method to create a new PapayaSDK instance
   * 
   * @param provider - Ethers provider or signer
   * @param network - Network name (default: 'polygon')
   * @param tokenSymbol - Token symbol (default: 'USDT')
   * @param contractVersion - Contract version (default: network's default version)
   * @returns A new PapayaSDK instance
   */
  public static create(
    provider: ethers.Provider | ethers.Signer,
    network: NetworkName = 'polygon',
    tokenSymbol: TokenSymbol = 'USDT',
    contractVersion?: string
  ): PapayaSDK {
    // Validate network
    if (!NETWORKS[network]) {
      console.error(`Network ${network} not supported. Falling back to Polygon.`);
      network = 'polygon';
    }

    // Validate token for the selected network
    if (!NETWORKS[network][tokenSymbol as keyof typeof NETWORKS[typeof network]]) {
      console.error(`Token ${tokenSymbol} not supported on ${network}. Falling back to USDT.`);
      tokenSymbol = 'USDT';
      
      // If USDT is also not supported, try USDC
      if (!NETWORKS[network][tokenSymbol as keyof typeof NETWORKS[typeof network]]) {
        console.error(`USDT not supported on ${network}. Falling back to USDC.`);
        tokenSymbol = 'USDC';
        
        // If neither USDT nor USDC is supported, use the first available token
        if (!NETWORKS[network][tokenSymbol as keyof typeof NETWORKS[typeof network]]) {
          const availableTokens = Object.keys(NETWORKS[network]) as TokenSymbol[];
          if (availableTokens.length > 0) {
            tokenSymbol = availableTokens[0];
            console.error(`USDC not supported on ${network}. Falling back to ${tokenSymbol}.`);
          } else {
            throw new Error(`No tokens supported on ${network}`);
          }
        }
      }
    }

    // Set default version if not provided
    if (!contractVersion) {
      contractVersion = DEFAULT_VERSIONS[network];
    }

    const tokenConfigs = NETWORKS[network][tokenSymbol as keyof typeof NETWORKS[typeof network]] as TokenConfig[];
    const versionConfig = tokenConfigs.find((config: TokenConfig) => config.version === contractVersion);
    
    if (!versionConfig) {
      console.error(`Version ${contractVersion} not supported for ${tokenSymbol} on ${network}. Using the latest available version.`);
      // Use the latest version available
      const latestConfig = tokenConfigs[tokenConfigs.length - 1];
      contractVersion = latestConfig.version;
    }

    const contractAddress = PapayaSDK.getContractAddress(network, tokenSymbol, contractVersion);
    // Create SDK instance - token validation is now handled in the constructor
    return new PapayaSDK({
      provider,
      contractAddress,
      contractVersion
    });
  }

  /**
   * Gets the contract address for a specific network, token, and version
   * 
   * @param network - Network name
   * @param tokenSymbol - Token symbol
   * @param version - Contract version
   * @returns Contract address
   */
  private static getContractAddress(network: NetworkName, tokenSymbol: TokenSymbol, version: string): string {
    const tokenConfigs = NETWORKS[network][tokenSymbol as keyof typeof NETWORKS[typeof network]] as TokenConfig[];
    if (!tokenConfigs) {
      throw new Error(`Token ${tokenSymbol} not supported on network ${network}`);
    }

    const versionConfig = tokenConfigs.find((config: TokenConfig) => config.version === version);
    if (!versionConfig) {
      throw new Error(`Version ${version} not supported for token ${tokenSymbol} on network ${network}`);
    }

    return versionConfig.contractAddress;
  }

  /**
   * Gets the token address for a specific network, token symbol, and version
   * 
   * @param network - Network name
   * @param tokenSymbol - Token symbol
   * @param version - Contract version
   * @returns Token address
   */
  private getTokenAddress(network: NetworkName, tokenSymbol: TokenSymbol, version: string): string {
    const tokenConfigs = NETWORKS[network][tokenSymbol as keyof typeof NETWORKS[typeof network]] as TokenConfig[];
    if (!tokenConfigs) {
      throw new Error(`Token ${tokenSymbol} not supported on network ${network}`);
    }

    const versionConfig = tokenConfigs.find((config: TokenConfig) => config.version === version);
    if (!versionConfig) {
      throw new Error(`Version ${version} not supported for token ${tokenSymbol} on network ${network}`);
    }

    return versionConfig.tokenAddress;
  }

  /**
   * Gets the price feed addresses for a specific network, token, and version
   * 
   * @param network - Network name
   * @param tokenSymbol - Token symbol
   * @param version - Contract version
   * @returns Object containing token and coin price feed addresses
   */
  private getPriceFeeds(network: NetworkName, tokenSymbol: TokenSymbol, version: string): { tokenPriceFeed: string, coinPriceFeed: string } {
    const tokenConfigs = NETWORKS[network][tokenSymbol as keyof typeof NETWORKS[typeof network]] as TokenConfig[];
    if (!tokenConfigs) {
      throw new Error(`Token ${tokenSymbol} not supported on network ${network}`);
    }

    const versionConfig = tokenConfigs.find((config: TokenConfig) => config.version === version);
    if (!versionConfig) {
      throw new Error(`Version ${version} not supported for token ${tokenSymbol} on network ${network}`);
    }

    return {
      tokenPriceFeed: versionConfig.tokenPriceFeed,
      coinPriceFeed: versionConfig.coinPriceFeed
    };
  }

  /**
   * Universal method for calling BySig methods
   * 
   * @param method - Method name
   * @param params - Method parameters
   * @param deadline - Deadline timestamp
   * @returns Transaction response
   */
  private async callBySig(method: string, params: any[], deadline: number) {
    if (!this.signer) {
      throw new Error("Signer is required for BySig methods");
    }

    const signerAddress = await this.signer.getAddress();
    
    // Get nonce from the contract
    const nonce = await this.contract.bySigAccountNonces(signerAddress);
    
    // Use proper domain parameters for EIP-712
    const chainId = await this.getChainId();
    const contractAddress = this.contract.getAddress ? 
      await this.contract.getAddress() : 
      this.contract.target as string;
    
    // Fixed domain values for consistent signature generation
    const domain = {
      name: "Papaya", // This must match exactly what the contract expects
      version: "1",   // Use a fixed version that matches the contract's implementation
      chainId,
      verifyingContract: contractAddress,
    };
    
    // Define the typed data structure
    const types = {
      // The primary type must match what the contract expects
      SignedCall: [
        { name: "traits", type: "uint256" },
        { name: "data", type: "bytes" },
      ],
    };
    
    // Encode the method call data
    const callData = this.contract.interface.encodeFunctionData(method, params);
    
    // Build the traits with a simple bit-packed value for compatibility
    const traitsValue = this._buildBySigTraits({
      nonceType: 0, // Try using Account nonce type (0) instead of Selector (1)
      deadline: BigInt(deadline),
      nonce: nonce
    });
    
    // The message to sign
    const message = {
      traits: traitsValue,
      data: callData
    };
    
    // Sign the message using EIP-712
    console.log("Signing with domain:", domain);
    console.log("Message:", message);
    
    try {
      // Sign the message using EIP-712 typed data signing
      const signature = await this.signer.signTypedData(domain, types, message);
      
      console.log("Generated signature:", signature);
      
      // Call the bySig function with the signed parameters
      return this.contract.bySig(signerAddress, message, signature);
    } catch (error: any) {
      console.error("Error in callBySig:", error);
      throw new Error(`Failed to execute bySig: ${error.message || String(error)}`);
    }
  }
  
  /**
   * Builds the traits value for BySig calls
   * 
   * @param nonceType - Nonce type (0 = Account, 1 = Selector, 2 = Unique)
   * @param deadline - Deadline timestamp
   * @param relayer - Relayer address (default: zero address)
   * @param nonce - Nonce value
   * @returns The traits value as BigInt
   */
  private _buildBySigTraits({
    nonceType = 0,
    deadline = BigInt(0),
    relayer = "0x0000000000000000000000000000000000000000",
    nonce = BigInt(0)
  }: {
    nonceType?: number;
    deadline?: bigint;
    relayer?: string;
    nonce?: bigint;
  } = {}): bigint {
    if (nonceType > 3) {
      throw new Error("Wrong nonce type, it should be less than 4");
    }
    if (deadline > BigInt("0xffffffffff")) {
      throw new Error("Wrong deadline, it should be less than 0xffffffffff");
    }
    if (relayer.length > 42) {
      throw new Error("Wrong relayer address, it should be less than 42 symbols");
    }
    if (nonce > BigInt("0xffffffffffffffffffffffffffffffff")) {
      throw new Error("Wrong nonce, it should not be more than 128 bits");
    }

    return (
      (BigInt(nonceType) << BigInt(254)) +
      (deadline << BigInt(208)) +
      ((BigInt(relayer) & BigInt("0xffffffffffffffffffffff")) << BigInt(128)) +
      nonce
    );
  }
  
  /**
   * Gets the chain ID from the provider
   * 
   * @returns The chain ID
   */
  private async getChainId(): Promise<number> {
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  /**
   * Gets the balance of an account
   * 
   * @param account - Account address (default: signer's address)
   * @returns Account balance
   */
  async balanceOf(account?: string): Promise<number> {
    const address = account || (this.signer ? await this.signer.getAddress() : null);
    
    if (!address) {
      throw new Error("Account address is required");
    }
    
    const balance = await this.contract.balanceOf(address);

    return parseFloat(balance);
  }

  /**
   * Gets detailed user information
   * 
   * @param account - Account address (default: signer's address)
   * @returns User information
   */
  async getUserInfo(account?: string): Promise<UserInfo> {
    const address = account || (this.signer ? await this.signer.getAddress() : null);
    
    if (!address) {
      throw new Error("Account address is required");
    }
    
    const [rawBalance, rawIncomeRate, rawOutgoingRate, updated] = await this.contract.users(address);
    
    return {
      balance: rawBalance,
      incomeRate: rawIncomeRate,
      outgoingRate: rawOutgoingRate,
      updated: updated
    };
  }

  /**
   * Deposits tokens into the protocol
   * 
   * @param amount - Amount to deposit
   * @param isPermit2 - Whether to use Permit2 (default: false)
   * @returns Transaction response
   */
  async deposit(amount: bigint | number, isPermit2: boolean = false): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for deposit");
    }
    
    return this.contract.deposit(amount, isPermit2);
  }

  /**
   * Deposits tokens into the protocol using BySig
   * 
   * @param amount - Amount to deposit
   * @param deadline - Deadline timestamp
   * @returns Transaction response
   */
  async depositBySig(amount: bigint | number, deadline: number): Promise<ethers.TransactionResponse> {
    return this.callBySig("deposit", [amount, false], deadline);
  }

  /**
   * Deposits tokens for another account
   * 
   * @param amount - Amount to deposit
   * @param to - Recipient address
   * @param isPermit2 - Whether to use Permit2 (default: false)
   * @returns Transaction response
   */
  async depositFor(amount: bigint | number, to: string, isPermit2: boolean = false): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for depositFor");
    }
    
    return this.contract.depositFor(amount, to, isPermit2);
  }

  /**
   * Withdraws tokens from the protocol
   * 
   * @param amount - Amount to withdraw
   * @returns Transaction response
   */
  async withdraw(amount: bigint | number): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for withdraw");
    }

    return this.contract.withdraw(amount);
  }

  /**
   * Withdraws tokens from the protocol using BySig
   * 
   * @param amount - Amount to withdraw
   * @param deadline - Deadline timestamp
   * @returns Transaction response
   */
  async withdrawBySig(amount: bigint | number, deadline: number): Promise<ethers.TransactionResponse> {
    return this.callBySig("withdraw", [amount], deadline);
  }

  /**
   * Withdraws tokens to another account
   * 
   * @param to - Recipient address
   * @param amount - Amount to withdraw
   * @returns Transaction response
   */
  async withdrawTo(to: string, amount: bigint | number): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for withdrawTo");
    }
   
    return this.contract.withdrawTo(to, amount);
  }

  /**
   * Subscribes to an author
   * 
   * @param author - Author address
   * @param amount - Subscription amount
   * @param period - Time period for the subscription rate (second, hour, day, week, month, year)
   * @param projectId - Project ID
   * @returns Transaction response
   */
  async subscribe(
    author: string, 
    amount: number | bigint,
    period: RatePeriod = RatePeriod.MONTH,
    projectId: number
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for subscribe");
    }
    
    // Convert amount to per-second rate based on the period
    const ratePerSecond = convertRatePerSecond(amount.toString(), period);
    
    return this.contract.subscribe(author, ratePerSecond, projectId);
  }

  /**
   * Subscribes to an author using BySig
   * 
   * @param author - Author address
   * @param amount - Subscription amount
   * @param period - Time period for the subscription rate (second, hour, day, week, month, year)
   * @param projectId - Project ID
   * @param deadline - Deadline timestamp
   * @returns Transaction response
   */
  async subscribeBySig(
    author: string, 
    amount: number | bigint,
    period: RatePeriod = RatePeriod.MONTH,
    projectId: number, 
    deadline: number
  ): Promise<ethers.TransactionResponse> {
    
    // Convert amount to per-second rate based on the period
    const ratePerSecond = convertRatePerSecond(amount.toString(), period);
    
    return this.callBySig("subscribe", [author, ratePerSecond, projectId], deadline);
  }

  /**
   * Unsubscribes from an author
   * 
   * @param author - Author address
   * @returns Transaction response
   */
  async unsubscribe(author: string): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for unsubscribe");
    }
    
    return this.contract.unsubscribe(author);
  }

  /**
   * Unsubscribes from an author using BySig
   * 
   * @param author - Author address
   * @param deadline - Deadline timestamp
   * @returns Transaction response
   */
  async unsubscribeBySig(author: string, deadline: number): Promise<ethers.TransactionResponse> {
    return this.callBySig("unsubscribe", [author], deadline);
  }

  /**
   * Gets all subscriptions for an account
   * 
   * @param account - Account address (default: signer's address)
   * @returns Array of subscriptions
   */
  async getSubscriptions(account?: string): Promise<Subscription[]> {
    const address = account || (this.signer ? await this.signer.getAddress() : null);
    
    if (!address) {
      throw new Error("Account address is required");
    }
    
    const [recipients, encodedRates] = await this.contract.allSubscriptions(address);
    
    return recipients.map((recipient: string, index: number) => ({
      recipient,
      ...decodeRates(encodedRates[index])
    }));
  }

  /**
   * Checks if an account is subscribed to an author
   * 
   * @param from - Subscriber address (default: signer's address)
   * @param to - Author address
   * @returns Subscription status and encoded rates
   */
  async isSubscribed(to: string, from?: string): Promise<{ isSubscribed: any; incomeRate: number; outgoingRate: number; projectId: number }> {
    const fromAddress = from || (this.signer ? await this.signer.getAddress() : null);
    
    if (!fromAddress) {
      throw new Error("From address is required");
    }
    
    const [isSubscribed, encodedRates] = await this.contract.subscriptions(fromAddress, to);
    
    return {
      isSubscribed,
      ...decodeRates(encodedRates)
    };
  }

  /**
   * Makes a direct payment to a receiver
   * 
   * @param receiver - Recipient address
   * @param amount - Amount to pay
   * @returns Transaction response
   */
  async pay(receiver: string, amount: bigint | number): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer is required for pay");
    }
    
    return this.contract.pay(receiver, amount);
  }

  /**
   * Gets the available tokens for a given network
   * 
   * @param network - The network name
   * @returns Array of available token symbols for the specified network
   */
  static getAvailableTokens(network: NetworkName): TokenSymbol[] {
    if (!NETWORKS[network]) {
      return [];
    }
    
    return Object.keys(NETWORKS[network]) as TokenSymbol[];
  }

  /**
   * Gets all available network names supported by the SDK
   * 
   * @returns Array of supported network names
   */
  static getAvailableNetworks(): NetworkName[] {
    return Object.keys(NETWORKS) as NetworkName[];
  }
} 