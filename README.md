# EigenLayer Recovery

This library provides a simple and efficient way to recover unstaked tokens from the EigenLayer protocol using Flashbots bundles.

## Overview

When you unstake tokens from the EigenLayer protocol, they are not immediately available for withdrawal. Instead, they are queued for withdrawal and can only be claimed after a certain number of blocks have passed. This library automates the process of recovering these unstaked tokens by submitting a bundle of transactions to the Flashbots service, ensuring a high probability of inclusion in the next block.

## Installation

To use this library in your project, you'll need to have Node.js and npm installed. Then, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/codeesura/eigenlayer-recovery.git
   ```

2. Install the dependencies:
   ```
   cd eigenlayer-recovery
   npm install
   ```

## Configuration

Before you can use the library, you need to set up a configuration file with your specific details. Create a `.env` file in the root directory of the project and fill in the following variables:

```
SAFE_WALLET_PRIVATE_KEY=your_safe_wallet_private_key
RECOVERY_WALLET_PRIVATE_KEY=your_recovery_wallet_private_key
PROVIDER_URL=your_provider_url
```

- `SAFE_WALLET_PRIVATE_KEY`: The private key of the wallet that will receive the recovered tokens.
- `RECOVERY_WALLET_PRIVATE_KEY`: The private key of the wallet that will submit the recovery transactions.
- `PROVIDER_URL`: The URL of your Ethereum provider (e.g., Alchemy, Infura).

Next, update the `config` object in `recoverUnstakedTokens.js` with your specific details:

```javascript
const config = {
  chainId: 1,
  eigenLayerContractAddress: '0x...',
  tokenAddress: '0x...',
  strategyAddress: '0x...',
  delegatedAddress: '0x...',
  unstakedTokenAmount: '123...',
  queuedWithdrawalBlockNumber: '456...',
  nonce: '0',
  eigenLayerABI: require('./eigenABI.json'),
  tokenABI: require('./tokenABI.json'),
  gasLimit: 300000
};
```

- `chainId`: The ID of the Ethereum network you're using (1 for Mainnet, 4 for Rinkeby, etc.).
- `eigenLayerContractAddress`: The address of the EigenLayer contract.
- `tokenAddress`: The address of the token you unstaked (e.g., Swell token).
- `strategyAddress`: The address of the strategy contract you used for staking.
- `delegatedAddress`: The address to which you delegated your tokens (if applicable). If not, use `'0x0000000000000000000000000000000000000000'`.
- `unstakedTokenAmount`: The amount of tokens you unstaked (in wei).
- `queuedWithdrawalBlockNumber`: The block number when your withdrawal was queued.
- `nonce`: The nonce of the recovery transaction (usually 0).
- `eigenLayerABI`: The path to the EigenLayer contract ABI JSON file.
- `tokenABI`: The path to the token contract ABI JSON file.
- `gasLimit`: The gas limit for the recovery transactions.

## Usage

To start the token recovery process, run the following command:

```
node recoverUnstakedTokens.js
```

The script will listen for new blocks and submit a recovery bundle to the Flashbots service whenever a new block is detected. If the bundle is included in a block, the script will log a success message and exit. If not, it will continue listening for new blocks and submitting bundles until the transaction is mined.

## Disclaimer

This library is provided as-is and without any warranty. Use it at your own risk. Always double-check the configuration details before running the script, as incorrect settings may result in loss of funds.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.