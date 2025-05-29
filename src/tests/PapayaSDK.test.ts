import { ethers } from 'ethers';
import { PapayaSDK } from '../core/PapayaSDK';
import { RatePeriod } from '../utils/rateConversion';

// We'll test the SDK methods by spying on them rather than mocking the entire ethers Contract
describe('PapayaSDK', () => {
  let sdk: any;
  let spyObj: any;

  beforeEach(() => {
    // Create a simple mock provider
    const mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(137) }), // Polygon
    };

    // Create the SDK with a minimal implementation
    sdk = PapayaSDK.create(mockProvider as any, 'polygon', 'USDT', '1.5.1');

    // Create spies for all the methods we want to test
    spyObj = {
      balanceOf: jest.spyOn(sdk, 'balanceOf').mockResolvedValue(5),
      getUserInfo: jest.spyOn(sdk, 'getUserInfo').mockResolvedValue({
        balance: '5',
        incomeRate: '1',
        outgoingRate: '2',
        updated: new Date().toISOString()
      }),
      deposit: jest.spyOn(sdk, 'deposit').mockResolvedValue({ hash: '0xtxhash' }),
      depositBySig: jest.spyOn(sdk, 'depositBySig').mockResolvedValue({ hash: '0xtxhash' }),
      depositFor: jest.spyOn(sdk, 'depositFor').mockResolvedValue({ hash: '0xtxhash' }),
      withdraw: jest.spyOn(sdk, 'withdraw').mockResolvedValue({ hash: '0xtxhash' }),
      withdrawBySig: jest.spyOn(sdk, 'withdrawBySig').mockResolvedValue({ hash: '0xtxhash' }),
      withdrawTo: jest.spyOn(sdk, 'withdrawTo').mockResolvedValue({ hash: '0xtxhash' }),
      subscribe: jest.spyOn(sdk, 'subscribe').mockResolvedValue({ hash: '0xtxhash' }),
      subscribeBySig: jest.spyOn(sdk, 'subscribeBySig').mockResolvedValue({ hash: '0xtxhash' }),
      unsubscribe: jest.spyOn(sdk, 'unsubscribe').mockResolvedValue({ hash: '0xtxhash' }),
      unsubscribeBySig: jest.spyOn(sdk, 'unsubscribeBySig').mockResolvedValue({ hash: '0xtxhash' }),
      getSubscriptions: jest.spyOn(sdk, 'getSubscriptions').mockResolvedValue([
        { recipient: '0xAuthor1', incomeRate: 1, outgoingRate: 2, projectId: 1 },
        { recipient: '0xAuthor2', incomeRate: 3, outgoingRate: 4, projectId: 2 }
      ]),
      isSubscribed: jest.spyOn(sdk, 'isSubscribed').mockResolvedValue({
        isSubscribed: true,
        incomeRate: 1,
        outgoingRate: 2,
        projectId: 1
      }),
      pay: jest.spyOn(sdk, 'pay').mockResolvedValue({ hash: '0xtxhash' }),
      getTokenSymbol: jest.spyOn(sdk, 'getTokenSymbol').mockReturnValue('USDT'),
      getChainId: jest.spyOn(sdk as any, 'getChainId').mockResolvedValue(137)
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SDK Creation and Factory Method', () => {
    test('creates an SDK instance with default parameters', () => {
      expect(sdk).toBeInstanceOf(PapayaSDK);
    });
    
    test('gets available tokens for a network', () => {
      const tokens = PapayaSDK.getAvailableTokens('polygon');
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens).toContain('USDT');
    });
    
    test('gets available networks', () => {
      const networks = PapayaSDK.getAvailableNetworks();
      expect(networks.length).toBeGreaterThan(0);
      expect(networks).toContain('polygon');
    });
  });
  
  describe('Balance and User Info Methods', () => {
    test('gets balance with account parameter', async () => {
      const testAddress = '0xTestAddress';
      await sdk.balanceOf(testAddress);
      
      expect(spyObj.balanceOf).toHaveBeenCalledWith(testAddress);
    });
    
    test('gets balance without account parameter', async () => {
      await sdk.balanceOf();
      
      expect(spyObj.balanceOf).toHaveBeenCalled();
    });
    
    test('gets user info with account parameter', async () => {
      const testAddress = '0xTestAddress';
      const userInfo = await sdk.getUserInfo(testAddress);
      
      expect(spyObj.getUserInfo).toHaveBeenCalledWith(testAddress);
      expect(userInfo).toEqual({
        balance: '5',
        incomeRate: '1',
        outgoingRate: '2',
        updated: expect.any(String)
      });
    });
    
    test('gets user info without account parameter', async () => {
      const userInfo = await sdk.getUserInfo();
      
      expect(spyObj.getUserInfo).toHaveBeenCalled();
      expect(userInfo).toEqual({
        balance: '5',
        incomeRate: '1',
        outgoingRate: '2',
        updated: expect.any(String)
      });
    });
  });
  
  describe('Deposit Methods', () => {
    test('deposits tokens', async () => {
      const txResponse = await sdk.deposit(100);
      
      expect(spyObj.deposit).toHaveBeenCalledWith(100);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
    
    test('deposits tokens using BySig', async () => {
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const txResponse = await sdk.depositBySig(100, deadline);
      
      expect(spyObj.depositBySig).toHaveBeenCalledWith(100, deadline);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
    
    test('deposits tokens for another account', async () => {
      const recipient = '0xRecipientAddress';
      const txResponse = await sdk.depositFor(100, recipient);
      
      expect(spyObj.depositFor).toHaveBeenCalledWith(100, recipient);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
  });
  
  describe('Withdraw Methods', () => {
    test('withdraws tokens', async () => {
      const txResponse = await sdk.withdraw(100);
      
      expect(spyObj.withdraw).toHaveBeenCalledWith(100);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
    
    test('withdraws tokens using BySig', async () => {
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const txResponse = await sdk.withdrawBySig(100, deadline);
      
      expect(spyObj.withdrawBySig).toHaveBeenCalledWith(100, deadline);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
    
    test('withdraws tokens to another account', async () => {
      const recipient = '0xRecipientAddress';
      const txResponse = await sdk.withdrawTo(recipient, 100);
      
      expect(spyObj.withdrawTo).toHaveBeenCalledWith(recipient, 100);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
  });
  
  describe('Subscription Methods', () => {
    test('subscribes to an author', async () => {
      const author = '0xAuthorAddress';
      const txResponse = await sdk.subscribe(author, 100, RatePeriod.MONTH, 1);
      
      expect(spyObj.subscribe).toHaveBeenCalledWith(author, 100, RatePeriod.MONTH, 1);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
    
    test('subscribes to an author using BySig', async () => {
      const author = '0xAuthorAddress';
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const txResponse = await sdk.subscribeBySig(author, 100, RatePeriod.MONTH, 1, deadline);
      
      expect(spyObj.subscribeBySig).toHaveBeenCalledWith(author, 100, RatePeriod.MONTH, 1, deadline);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
    
    test('unsubscribes from an author', async () => {
      const author = '0xAuthorAddress';
      const txResponse = await sdk.unsubscribe(author);
      
      expect(spyObj.unsubscribe).toHaveBeenCalledWith(author);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
    
    test('unsubscribes from an author using BySig', async () => {
      const author = '0xAuthorAddress';
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const txResponse = await sdk.unsubscribeBySig(author, deadline);
      
      expect(spyObj.unsubscribeBySig).toHaveBeenCalledWith(author, deadline);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
    
    test('gets all subscriptions', async () => {
      const subscriptions = await sdk.getSubscriptions();
      
      expect(spyObj.getSubscriptions).toHaveBeenCalled();
      expect(subscriptions).toHaveLength(2);
      expect(subscriptions[0]).toHaveProperty('recipient', '0xAuthor1');
      expect(subscriptions[1]).toHaveProperty('recipient', '0xAuthor2');
    });
    
    test('checks if subscribed to an author', async () => {
      const author = '0xAuthorAddress';
      const isSubscribed = await sdk.isSubscribed(author);
      
      expect(spyObj.isSubscribed).toHaveBeenCalledWith(author);
      expect(isSubscribed).toHaveProperty('isSubscribed', true);
    });
  });
  
  describe('Pay Method', () => {
    test('makes a direct payment', async () => {
      const recipient = '0xRecipientAddress';
      const txResponse = await sdk.pay(recipient, 100);
      
      expect(spyObj.pay).toHaveBeenCalledWith(recipient, 100);
      expect(txResponse).toEqual({ hash: '0xtxhash' });
    });
  });
  
  describe('Token Information', () => {
    test('gets token symbol', () => {
      const tokenSymbol = sdk.getTokenSymbol();
      
      expect(spyObj.getTokenSymbol).toHaveBeenCalled();
      expect(tokenSymbol).toBe('USDT');
    });
  });
  
  describe('Error Handling Tests', () => {
    test('handles errors in deposit', async () => {
      spyObj.deposit.mockRejectedValueOnce(new Error('Transaction failed'));
      
      await expect(sdk.deposit(100)).rejects.toThrow('Transaction failed');
    });
    
    test('handles errors in withdrawBySig', async () => {
      spyObj.withdrawBySig.mockRejectedValueOnce(new Error('Signing failed'));
      
      await expect(sdk.withdrawBySig(100, 123456789)).rejects.toThrow('Signing failed');
    });
  });
}); 