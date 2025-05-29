document.addEventListener('DOMContentLoaded', () => {
    // SDK instance
    let sdk = null;
    let provider = null;
    let signer = null;
    const statusEl = document.getElementById('status');
    
    // Test parameters
    const TEST_PARAMS = {
      authorAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
      subscriptionRate: BigInt(100),
      projectId: 1
    };
    
    // Helper function to update status
    function updateStatus(message) {
      statusEl.textContent = `Status: ${message}`;
      console.log(`Status: ${message}`);
    }
    
    // Helper function to log results
    function logResult(method, result) {
      console.log(`----- ${method} Result -----`);
      console.log(result);
      console.log('------------------------');
      
      updateStatus(`${method} completed. See console for details.`);
    }
    
    // Helper function to log errors
    function logError(method, error) {
      console.error(`----- ${method} Error -----`);
      console.error(error);
      console.error('------------------------');
      
      updateStatus(`${method} failed: ${error.message}`);
    }
    
    // Connect wallet
    document.getElementById('connect').addEventListener('click', async () => {
      try {
        updateStatus('Connecting...');
        
        if (!window.ethereum) {
          throw new Error('MetaMask not installed');
        }
        
        // Request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // Get network
        const network = await provider.getNetwork();
        let networkName;
        
        switch (network.chainId) {
          case 1: networkName = 'mainnet'; break;
          case 137: networkName = 'polygon'; break;
          case 80001: networkName = 'mumbai'; break;
          default: networkName = 'polygon'; // Default to polygon
        }
        
        // Initialize SDK
        sdk = PapayaSDK.create(provider, networkName, 'USDT', '1.5.1');
        
        updateStatus(`Connected to ${networkName} as ${accounts[0]}`);
      } catch (error) {
        logError('Connect', error);
      }
    });
    
    // Balance & User Info
    document.getElementById('get-balance').addEventListener('click', async () => {
      if (!sdk) return updateStatus('Please connect wallet first');
      
      try {
        updateStatus('Getting balance...');
        const balance = await sdk.balanceOf();
        logResult('balanceOf', balance);
      } catch (error) {
        logError('balanceOf', error);
      }
    });
    
    document.getElementById('get-user-info').addEventListener('click', async () => {
      if (!sdk) return updateStatus('Please connect wallet first');
      
      try {
        updateStatus('Getting user info...');
        const userInfo = await sdk.getUserInfo();
        logResult('getUserInfo', userInfo);
      } catch (error) {
        logError('getUserInfo', error);
      }
    });
    
    // Subscriptions
    document.getElementById('get-subscriptions').addEventListener('click', async () => {
      if (!sdk) return updateStatus('Please connect wallet first');
      
      try {
        updateStatus('Getting subscriptions...');
        const subscriptions = await sdk.getSubscriptions();
        logResult('getSubscriptions', subscriptions);
      } catch (error) {
        logError('getSubscriptions', error);
      }
    });
    
    document.getElementById('check-subscription').addEventListener('click', async () => {
      if (!sdk) return updateStatus('Please connect wallet first');
      
      try {
        updateStatus('Checking subscription...');
        const result = await sdk.isSubscribed(TEST_PARAMS.authorAddress);
        logResult('isSubscribed', result);
      } catch (error) {
        logError('isSubscribed', error);
      }
    });
    
    document.getElementById('subscribe').addEventListener('click', async () => {
      if (!sdk) return updateStatus('Please connect wallet first');
      
      try {
        updateStatus('Subscribing...');
        const tx = await sdk.subscribe(
          TEST_PARAMS.authorAddress,
          100, // amount
          'month', // period
          TEST_PARAMS.projectId
        );
        logResult('subscribe', tx);
        
        updateStatus('Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        logResult('subscribe confirmation', receipt);
      } catch (error) {
        logError('subscribe', error);
      }
    });
    
    document.getElementById('unsubscribe').addEventListener('click', async () => {
      if (!sdk) return updateStatus('Please connect wallet first');
      
      try {
        updateStatus('Unsubscribing...');
        const tx = await sdk.unsubscribe(TEST_PARAMS.authorAddress);
        logResult('unsubscribe', tx);
        
        updateStatus('Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        logResult('unsubscribe confirmation', receipt);
      } catch (error) {
        logError('unsubscribe', error);
      }
    });
    
    // Project Settings
    document.getElementById('get-project-settings').addEventListener('click', async () => {
      if (!sdk) return updateStatus('Please connect wallet first');
      
      try {
        updateStatus('Getting project settings...');
        const settings = await sdk.getProjectSettings(TEST_PARAMS.projectId);
        logResult('getProjectSettings', settings);
      } catch (error) {
        logError('getProjectSettings', error);
      }
    });
    
    document.getElementById('get-user-settings').addEventListener('click', async () => {
      if (!sdk) return updateStatus('Please connect wallet first');
      
      try {
        updateStatus('Getting user settings...');
        const settings = await sdk.getUserSettings(TEST_PARAMS.projectId);
        logResult('getUserSettings', settings);
      } catch (error) {
        logError('getUserSettings', error);
      }
    });
  });