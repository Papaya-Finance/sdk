import { ethers } from 'ethers';
import { TokenSymbol, NetworkName } from '../contracts/networks';

/**
 * Configuration options for creating a PapayaSDK instance
 */
export interface PapayaSDKOptions {
  provider: ethers.Provider | ethers.Signer;
  network?: NetworkName;
  tokenSymbol?: TokenSymbol;
  contractVersion?: string;
  contractAddress?: string;
  tokenAddress?: string;
}

/**
 * Subscription information
 */
export interface Subscription {
  recipient: string;
  incomeRate: number;
  outgoingRate: number;
  projectId: number;
}

/**
 * User information from the Papaya contract
 */
export interface UserInfo {
  balance: string;
  incomeRate: string;
  outgoingRate: string;
  updated: string;
}

/**
 * Settings for a project
 */
export interface ProjectSettings {
  initialized: boolean;
  projectFee: number;
} 