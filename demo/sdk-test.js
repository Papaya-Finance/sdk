/**
 * Papaya SDK Test Page
 * 
 * This script provides a simple interface to test the Papaya SDK methods.
 * It uses the SDK factory method to create an instance and provides
 * UI elements to test all available methods.
 */

// DOM Elements
const connectButton = document.getElementById('connectButton');
const connectionStatus = document.getElementById('connectionStatus');
const methodsCard = document.getElementById('methodsCard');
const outputEl = document.getElementById('output');
const networkSelect = document.getElementById('networkSelect');
const tokenSelect = document.getElementById('tokenSelect');
const contractVersionInput = document.getElementById('contractVersion');

// Global variables
let provider;
let signer;
let papayaSDK;

/**
 * Helper function to log messages to the output console
 */
function logOutput(message, isError = false) {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
    if (isError) {
        outputEl.innerHTML += `<span style="color: red">${formattedMessage}</span>\n`;
    } else {
        outputEl.innerHTML += `${formattedMessage}\n`;
    }
    
    // Scroll to bottom
    outputEl.scrollTop = outputEl.scrollHeight;
}

/**
 * Helper function to handle errors
 */
function handleError(error) {
    console.error(error);
    let errorMessage = error.message || 'Unknown error occurred';
    
    // Check for specific error types
    if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by the user.';
    } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for this transaction.';
    }
    
    logOutput(`Error: ${errorMessage}`, true);
}

/**
 * Helper function to format the result for display
 */
function formatResult(result) {
    if (result === null || result === undefined) {
        return 'null';
    }
    
    if (typeof result === 'object') {
        // Check if it's a transaction response
        if (result.hash) {
            return `Transaction sent: ${result.hash}`;
        }
        
        try {
            return JSON.stringify(result, (key, value) => {
                // Convert BigInt to string for display
                if (typeof value === 'bigint') {
                    return value.toString();
                }
                return value;
            }, 2);
        } catch (e) {
            return String(result);
        }
    }
    
    return String(result);
}

/**
 * Connect to Metamask and initialize the SDK
 */
async function connectWallet() {
    try {
        logOutput('Connecting to wallet...');
        
        // Check if window.ethereum is available
        if (!window.ethereum) {
            throw new Error('MetaMask not detected. Please install MetaMask.');
        }
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        // Create ethers provider and signer
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        
        // Get the selected network and token
        const network = networkSelect.value;
        const token = tokenSelect.value;
        const contractVersion = contractVersionInput.value || undefined;
        
        // Create the SDK instance
        console.log(Object.keys(p));      
        papayaSDK = p.PapayaSDK.create(signer, network, token, contractVersion);
        
        // Update UI
        connectionStatus.className = 'alert alert-success';
        connectionStatus.textContent = `Connected: ${account}`;
        connectButton.textContent = 'Change Connection';
        methodsCard.style.display = 'block';
        
        logOutput(`Connected to account: ${account}`);
        
        // Check if we're on the correct network
        const { chainId } = await provider.getNetwork();
        logOutput(`Connected to chain ID: ${chainId}`);
        
    } catch (error) {
        handleError(error);
        
        // Update UI to show error
        connectionStatus.className = 'alert alert-danger';
        connectionStatus.textContent = `Error: ${error.message}`;
    }
}

/**
 * Initialize the application
 */
function init() {
    // Update available tokens when network changes
    networkSelect.addEventListener('change', updateAvailableTokens);
    
    // Initialize available tokens
    updateAvailableTokens();
    
    // Populate networks dropdown
    populateNetworksDropdown();
    
    // Connect button
    connectButton.addEventListener('click', connectWallet);
    
    // BALANCE METHODS
    document.getElementById('balanceButton').addEventListener('click', async () => {
        try {
            const address = document.getElementById('balanceAddress').value || null;
            logOutput(`Getting balance for ${address || 'connected account'}...`);
            
            const balance = await papayaSDK.balanceOf(address);
            const formattedBalance = p.formatOutput(BigInt(balance), 18);

            logOutput(`Balance: ${formattedBalance.toString()}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('userInfoButton').addEventListener('click', async () => {
        try {
            const address = document.getElementById('balanceAddress').value || null;
            logOutput(`Getting user info for ${address || 'connected account'}...`);
            
            const userInfo = await papayaSDK.getUserInfo(address);
            const formattedUserInfo = {
                balance: p.formatOutput(BigInt(userInfo.balance), 18),
                incomeRate: p.convertRateToPeriod(Number(p.formatOutput(userInfo.incomeRate, 18)), p.RatePeriod.MONTH), // Convert to per-month rate
                outgoingRate: p.convertRateToPeriod(Number(p.formatOutput(userInfo.outgoingRate, 18)), p.RatePeriod.MONTH), // Convert to per-month rate
                updated: new Date(Number(userInfo.updated) * 1000).toISOString(), // Convert timestamp to readable format
            };

            logOutput(`User Info: ${formatResult(formattedUserInfo)}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    // DEPOSIT METHODS
    document.getElementById('depositButton').addEventListener('click', async () => {
        try {
            const amount = document.getElementById('depositAmount').value;
            const usePermit2 = document.getElementById('depositPermit2').checked;
            
            if (!amount) {
                throw new Error('Amount is required');
            }
            
            logOutput(`Depositing ${amount} with${usePermit2 ? '' : 'out'} Permit2...`);
            const formatedAmount = p.formatInput(amount, 6);
            const tx = await papayaSDK.deposit(formatedAmount, usePermit2);
            logOutput(`Deposit transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('depositBySigButton').addEventListener('click', async () => {
        try {
            const amount = document.getElementById('depositAmount').value;
            const deadlineSeconds = document.getElementById('depositBySigDeadline').value || 3600;
            
            if (!amount) {
                throw new Error('Amount is required');
            }
            
            // Calculate deadline
            const deadline = Math.floor(Date.now() / 1000) + parseInt(deadlineSeconds);
            
            logOutput(`Depositing ${amount} using signature with deadline ${deadline}...`);
            const formatedAmount = p.formatInput(amount, 6);
            const tx = await papayaSDK.depositBySig(formatedAmount, deadline);
            logOutput(`Deposit by signature transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('depositForButton').addEventListener('click', async () => {
        try {
            const amount = document.getElementById('depositAmount').value;
            const toAddress = document.getElementById('depositForAddress').value;
            const usePermit2 = document.getElementById('depositPermit2').checked;
            
            if (!amount) {
                throw new Error('Amount is required');
            }
            
            if (!toAddress) {
                throw new Error('Recipient address is required');
            }
            
            logOutput(`Depositing ${amount} for ${toAddress} with${usePermit2 ? '' : 'out'} Permit2...`);
            const formatedAmount = p.formatInput(amount, 6);
            const tx = await papayaSDK.depositFor(formatedAmount, toAddress, usePermit2);
            logOutput(`Deposit for transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    // WITHDRAW METHODS
    document.getElementById('withdrawButton').addEventListener('click', async () => {
        try {
            const amount = document.getElementById('withdrawAmount').value;
            
            if (!amount) {
                throw new Error('Amount is required');
            }
            
            logOutput(`Withdrawing ${amount}...`);
            const formatedAmount = p.formatInput(amount, 18);
            const tx = await papayaSDK.withdraw(formatedAmount);
            logOutput(`Withdraw transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('withdrawBySigButton').addEventListener('click', async () => {
        try {
            const amount = document.getElementById('withdrawAmount').value;
            const deadlineSeconds = document.getElementById('withdrawBySigDeadline').value || 3600;
            
            if (!amount) {
                throw new Error('Amount is required');
            }
            
            // Calculate deadline
            const deadline = Math.floor(Date.now() / 1000) + parseInt(deadlineSeconds);
            
            logOutput(`Withdrawing ${amount} using signature with deadline ${deadline}...`);
            const formatedAmount = p.formatInput(amount, 18);
            const tx = await papayaSDK.withdrawBySig(formatedAmount, deadline);
            logOutput(`Withdraw by signature transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('withdrawToButton').addEventListener('click', async () => {
        try {
            const amount = document.getElementById('withdrawAmount').value;
            const toAddress = document.getElementById('withdrawToAddress').value;
            
            if (!amount) {
                throw new Error('Amount is required');
            }
            
            if (!toAddress) {
                throw new Error('Recipient address is required');
            }
            
            logOutput(`Withdrawing ${amount} to ${toAddress}...`);
            const formatedAmount = p.formatInput(amount, 18);
            const tx = await papayaSDK.withdrawTo(toAddress, formatedAmount);
            logOutput(`Withdraw to transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    // SUBSCRIPTION METHODS
    document.getElementById('subscribeButton').addEventListener('click', async () => {
        try {
            const author = document.getElementById('subscribeAuthor').value;
            const amount = document.getElementById('subscribeAmount').value;
            const period = document.getElementById('subscribePeriod').value;
            const projectId = document.getElementById('subscribeProjectId').value;
            
            if (!author) {
                throw new Error('Author address is required');
            }
            
            if (!amount) {
                throw new Error('Subscription amount is required');
            }
            
            if (!projectId) {
                throw new Error('Project ID is required');
            }
            
            logOutput(`Subscribing to ${author} with rate ${amount} per ${period} for project ${projectId}...`);
            const tx = await papayaSDK.subscribe(author, amount, period, parseInt(projectId));
            logOutput(`Subscribe transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('subscribeBySigButton').addEventListener('click', async () => {
        try {
            const author = document.getElementById('subscribeAuthor').value;
            const amount = document.getElementById('subscribeAmount').value;
            const period = document.getElementById('subscribePeriod').value;
            const projectId = document.getElementById('subscribeProjectId').value;
            const deadlineSeconds = document.getElementById('subscribeBySigDeadline').value || 3600;
            
            if (!author) {
                throw new Error('Author address is required');
            }
            
            if (!amount) {
                throw new Error('Subscription amount is required');
            }
            
            if (!projectId) {
                throw new Error('Project ID is required');
            }
            
            // Calculate deadline
            const deadline = Math.floor(Date.now() / 1000) + parseInt(deadlineSeconds);
            
            logOutput(`Subscribing to ${author} with rate ${amount} per ${period} for project ${projectId} using signature...`);
            const tx = await papayaSDK.subscribeBySig(author, amount, period, parseInt(projectId), deadline);
            logOutput(`Subscribe by signature transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('unsubscribeButton').addEventListener('click', async () => {
        try {
            const author = document.getElementById('unsubscribeAuthor').value;
            
            if (!author) {
                throw new Error('Author address is required');
            }
            
            logOutput(`Unsubscribing from ${author}...`);
            const tx = await papayaSDK.unsubscribe(author);
            logOutput(`Unsubscribe transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('unsubscribeBySigButton').addEventListener('click', async () => {
        try {
            const author = document.getElementById('unsubscribeAuthor').value;
            const deadlineSeconds = document.getElementById('unsubscribeBySigDeadline').value || 3600;
            
            if (!author) {
                throw new Error('Author address is required');
            }
            
            // Calculate deadline
            const deadline = Math.floor(Date.now() / 1000) + parseInt(deadlineSeconds);
            
            logOutput(`Unsubscribing from ${author} using signature...`);
            const tx = await papayaSDK.unsubscribeBySig(author, deadline);
            logOutput(`Unsubscribe by signature transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('getSubscriptionsButton').addEventListener('click', async () => {
        try {
            const address = document.getElementById('getSubscriptionsAddress').value || null;
            
            logOutput(`Getting subscriptions for ${address || 'connected account'}...`);
            const subscriptions = await papayaSDK.getSubscriptions(address);
            const formattedSubscriptions = subscriptions.map(sub => ({
                recipient: sub.recipient,
                incomeRate: p.convertRateToPeriod(p.formatOutput(sub.incomeRate, 18), p.RatePeriod.MONTH),
                outgoingRate: p.convertRateToPeriod(p.formatOutput(sub.outgoingRate, 18), p.RatePeriod.MONTH),
                projectId: sub.projectId
            }));
            logOutput(`Subscriptions: ${formatResult(formattedSubscriptions)}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    document.getElementById('isSubscribedButton').addEventListener('click', async () => {
        try {
            const to = document.getElementById('isSubscribedTo').value;
            const from = document.getElementById('isSubscribedFrom').value || null;
            
            if (!to) {
                throw new Error('Author address is required');
            }
            
            logOutput(`Checking if ${from || 'connected account'} is subscribed to ${to}...`);
            const result = await papayaSDK.isSubscribed(to, from);
            const formattedResult = {
                isSubscribed: result.isSubscribed,
                incomeRate: p.convertRateToPeriod(p.formatOutput(result.incomeRate, 18), p.RatePeriod.MONTH),
                outgoingRate: p.convertRateToPeriod(p.formatOutput(result.outgoingRate, 18), p.RatePeriod.MONTH),
                projectId: result.projectId
            };
            logOutput(`Is Subscribed: ${formatResult(formattedResult)}`);
        } catch (error) {
            handleError(error);
        }
    });
    
    // PAYMENT METHODS
    document.getElementById('payButton').addEventListener('click', async () => {
        try {
            const amount = document.getElementById('payAmount').value;
            const receiver = document.getElementById('payReceiver').value;
            
            if (!amount) {
                throw new Error('Amount is required');
            }
            
            if (!receiver) {
                throw new Error('Receiver address is required');
            }
            
            logOutput(`Paying ${amount} to ${receiver}...`);
            const formatedAmount = p.formatInput(amount, 18);
            const tx = await papayaSDK.pay(receiver, formatedAmount);
            logOutput(`Payment transaction sent: ${tx.hash}`);
        } catch (error) {
            handleError(error);
        }
    });

    // DEPOSIT & SUBSCRIBE METHOD
    document.getElementById('depositSubscribeButton').addEventListener('click', async () => {
        try {
            const author = document.getElementById('depositSubscribeAuthor').value;
            const amount = document.getElementById('depositSubscribeAmount').value;
            const rate = document.getElementById('depositSubscribeRate').value;
            const period = document.getElementById('depositSubscribePeriod').value;
            const projectId = document.getElementById('depositSubscribeProjectId').value;
            const usePermit2 = document.getElementById('depositSubscribePermit2').checked;
            const decimals = document.getElementById('depositSubscribeDecimals').value || 6;
            
            if (!author) {
                throw new Error('Author address is required');
            }
            
            if (!amount) {
                throw new Error('Deposit amount is required');
            }
            
            if (!rate) {
                throw new Error('Subscription rate is required');
            }
            
            if (!projectId && projectId !== '0') {
                throw new Error('Project ID is required');
            }
            
            logOutput(`Depositing ${amount} and subscribing to ${author} with rate ${rate} per ${period} for project ${projectId}...`);
            logOutput(`Using multicall to combine operations in a single transaction...`);
            
            // Convert period string to RatePeriod enum value
            // RatePeriod enum values: 'second', 'hour', 'day', 'week', 'month', 'year'
            const ratePeriod = period; // depositAndSubscribe accepts string period values
            
            const tx = await papayaSDK.depositAndSubscribe(
                author,
                amount,
                rate,
                ratePeriod,
                parseInt(projectId),
                usePermit2,
                parseInt(decimals)
            );
            
            logOutput(`Deposit & Subscribe transaction sent: ${tx.hash}`);
            logOutput(`Waiting for confirmation...`);
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                logOutput(`✅ Success! Deposit and subscription completed in one transaction!`);
                logOutput(`Transaction confirmed in block: ${receipt.blockNumber}`);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            handleError(error);
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

/**
 * Updates the token select dropdown based on available tokens for the selected network
 */
function updateAvailableTokens() {
    const network = networkSelect.value;
    const currentToken = tokenSelect.value;
    
    // Clear existing options
    tokenSelect.innerHTML = '';
    
    // Get available tokens for the selected network from the NETWORKS object
    const availableTokens = [];
    if (typeof p.PapayaSDK.getAvailableTokens === 'function') {
        // If SDK provides this helper method
        availableTokens.push(...p.PapayaSDK.getAvailableTokens(network));
    } else {
        // Hardcoded fallback based on our knowledge of the networks configuration
        if (network === 'mainnet') {
            availableTokens.push('USDT', 'USDC', 'PYUSD');
        } else if (['polygon', 'bsc', 'arbitrum'].includes(network)) {
            availableTokens.push('USDT', 'USDC');
        } else if (network === 'avalanche') {
            availableTokens.push('USDT', 'USDC');
        } else if (network === 'base') {
            availableTokens.push('USDC');
        } else if (network === 'scroll') {
            availableTokens.push('USDT', 'USDC');
        } else if (network === 'zksync') {
            availableTokens.push('USDT');
        } else if (network === 'sei') {
            availableTokens.push('USDT', 'USDC');
        } else {
            // Default fallback
            availableTokens.push('USDT', 'USDC');
        }
    }
    
    // Add options to the dropdown
    availableTokens.forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.textContent = token;
        tokenSelect.appendChild(option);
    });
    
    // Try to restore the previously selected token if it's available
    if (availableTokens.includes(currentToken)) {
        tokenSelect.value = currentToken;
    }
}

/**
 * Populates the networks dropdown based on the NetworkName type from networks.ts
 */
function populateNetworksDropdown() {
    // Clear existing options
    networkSelect.innerHTML = '';
    
    // Get available networks from the NETWORKS object
    const availableNetworks = [];
    if (typeof p.PapayaSDK.getAvailableNetworks === 'function') {
        // If SDK provides this helper method
        availableNetworks.push(...p.PapayaSDK.getAvailableNetworks());
    } else {
        // Hardcoded fallback based on our knowledge of the networks configuration
        availableNetworks.push(
            'polygon', 
            'bsc', 
            'avalanche', 
            'base', 
            'scroll', 
            'arbitrum', 
            'mainnet', 
            'sei', 
            'zksync'
        );
    }
    
    // Add options to the dropdown
    availableNetworks.forEach(network => {
        const option = document.createElement('option');
        option.value = network;
        // Format the network name for display (capitalize first letter)
        option.textContent = network.charAt(0).toUpperCase() + network.slice(1);
        networkSelect.appendChild(option);
    });
    
    // Set Polygon as the default selected network
    if (availableNetworks.includes('polygon')) {
        networkSelect.value = 'polygon';
    }
} 