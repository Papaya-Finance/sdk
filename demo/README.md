# Papaya SDK Test Page

A simple web interface to test and experiment with the Papaya SDK methods. This test page allows developers to interact with all of the SDK's functionality through a user-friendly UI.

## Getting Started

### Prerequisites

- Node.js and npm installed
- MetaMask browser extension installed
- Access to a blockchain network (Mainnet, Polygon, Optimism, Arbitrum, or Base)

### Running the Test Page

1. Clone the repository and navigate to the project folder:
   ```
   git clone <repository-url>
   cd papaya-sdk
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build and serve the demo:
   ```
   npm run demo
   ```

This will:
- Build the SDK
- Bundle it for browser usage
- Start a local web server
- Open the test page in your default browser

## Using the Test Page

1. **Connect with MetaMask**: Click the "Connect with MetaMask" button to connect your wallet. MetaMask will prompt you to select an account.

2. **Configure the SDK**:
   - Select the network you want to use (Polygon, Mainnet, etc.)
   - Select the token (USDT, USDC, PYUSD)
   - Optionally specify a contract version

3. **Test SDK Methods**: Use the tabs to navigate between different method categories:
   - **Balance**: Check balances and user info
   - **Deposit**: Deposit funds into the protocol
   - **Withdraw**: Withdraw funds from the protocol
   - **Subscription**: Manage subscriptions
   - **Payment**: Make direct payments to other addresses

4. **View Results**: All results and transaction hashes will appear in the output console at the bottom of the page.

## Development Notes

- The test page uses ethers.js v6.8.1 which is compatible with the SDK
- All transactions require MetaMask confirmation
- For BySig methods, the signature is created using MetaMask
- The deadline parameter for BySig methods is calculated as current time + the specified seconds

## Troubleshooting

- If you're getting network errors, make sure you're connected to the correct network in MetaMask
- For transaction failures, check the console output for detailed error messages
- If the SDK is not initializing, check that the contract addresses are correctly configured for the selected network 