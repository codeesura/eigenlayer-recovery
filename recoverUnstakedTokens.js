const { ethers } = require("ethers");
const EigenLayerRecovery = require("./eigenLayerRecovery");

const config = {
  chainId: 1, // Chain ID of the Ethereum (1 for Mainnet)
  eigenLayerContractAddress: "0x39053D51B77DC0d36036Fc1fCc8Cb819df8Ef37A", // Address of the EigenLayer contract
  tokenAddress: "0xf951e335afb289353dc249e82926178eac7ded78", // Address of the token contract (in this example, Swell token)
  strategyAddress: "0x0Fe4F44beE93503346A3Ac9EE5A26b130a5796d6", // Address of the strategy contract (in this example, Swell strategy)
  delegatedAddress: "0x0000000000000000000000000000000000000000", // Address to which tokens are delegated (if not delegated, use 0x0000...)
  unstakedTokenAmount: "481297313362437071", // Amount of tokens to be unstaked (in wei)
  queuedWithdrawalBlockNumber: "12345678", // Block number at which the withdrawal was queued
  nonce: "0", // Nonce value for the transaction (usually 0 for the first transaction)
  eigenLayerABI: require("./abis/eigenABI.json"), // ABI of the EigenLayer contract
  tokenABI: require("./abis/tokenABI.json"), // ABI of the token contract
  gasLimit: 300000, // Gas limit for the completeQueuedWithdrawals function call + token transfer
};

async function main() {
  const eigenLayerRecovery = new EigenLayerRecovery(config);
  await eigenLayerRecovery.initialize();

  eigenLayerRecovery.provider.on("block", async (blockNumber) => {
    const feeData = await eigenLayerRecovery.provider.getFeeData();

    console.log(
      `Current gas price: Max Fee ${ethers.utils.formatUnits(
        feeData.maxFeePerGas,
        "gwei"
      )} gwei, Max Priority Fee ${ethers.utils.formatUnits(
        feeData.maxPriorityFeePerGas,
        "gwei"
      )} gwei`
    );

    await eigenLayerRecovery.sendRecoveryBundle(
      blockNumber,
      feeData.maxFeePerGas,
      feeData.maxPriorityFeePerGas
    );
  });
}

main();
