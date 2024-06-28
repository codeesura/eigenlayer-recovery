const { ethers } = require("ethers");
const {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution,
} = require("@flashbots/ethers-provider-bundle");
require("dotenv").config();

class EigenLayerRecovery {
    constructor(config) {
      this.config = config;
      this.provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
      this.safeWallet = new ethers.Wallet(process.env.SAFE_WALLET_PRIVATE_KEY, this.provider);
      this.recoveryWallet = new ethers.Wallet(process.env.RECOVERY_WALLET_PRIVATE_KEY, this.provider);
      this.eigenContractInterface = new ethers.utils.Interface(config.eigenLayerABI);
      this.tokenInterface = new ethers.utils.Interface(config.tokenABI);
      this.flashbotsProvider = null;
    }
  
    async initialize() {
      this.flashbotsProvider = await FlashbotsBundleProvider.create(this.provider, ethers.Wallet.createRandom());
    }
  
    createUnstakedTokenRecoveryBundle(nonce, blockNumber, strategyAddress, delegatedAddress, unstakedTokenAmount) {
      return [
        this.recoveryWallet.address,
        delegatedAddress || "0x0000000000000000000000000000000000000000",
        this.recoveryWallet.address,
        ethers.BigNumber.from(nonce),
        ethers.BigNumber.from(blockNumber),
        [strategyAddress],
        [ethers.BigNumber.from(unstakedTokenAmount)],
      ];
    }
  
    async sendRecoveryBundle(blockNumber, maxFeePerGas, maxPriorityFeePerGas) {
      const gasLimit = ethers.BigNumber.from(this.config.gasLimit);
      const totalGasCost = gasLimit.mul(maxFeePerGas);
  
      const bundle = [
        {
          transaction: {
            chainId: this.config.chainId,
            to: this.recoveryWallet.address,
            value: totalGasCost,
            type: 2,
            gasLimit: 21000,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
          },
          signer: this.safeWallet,
        },
        {
          transaction: {
            chainId: this.config.chainId,
            to: this.config.eigenLayerContractAddress,
            data: this.eigenContractInterface.encodeFunctionData("completeQueuedWithdrawals", [
              [this.createUnstakedTokenRecoveryBundle(
                this.config.nonce,
                this.config.queuedWithdrawalBlockNumber,
                this.config.strategyAddress,
                this.config.delegatedAddress,
                this.config.unstakedTokenAmount
              )],
              [[this.config.tokenAddress]],
              ["0"],
              [true],
            ]),
            type: 2,
            gasLimit: 210000,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
          },
          signer: this.recoveryWallet,
        },
        {
          transaction: {
            chainId: this.config.chainId,
            to: this.config.tokenAddress,
            data: this.tokenInterface.encodeFunctionData("transfer", [
              this.safeWallet.address,
              ethers.BigNumber.from(this.config.unstakedTokenAmount)
            ]),
            type: 2,
            gasLimit: 90000,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
          },
          signer: this.recoveryWallet,
        }
      ];
  
      const flashbotsTransactionResponse = await this.flashbotsProvider.sendBundle(bundle, blockNumber + 1);
      const resolution = await flashbotsTransactionResponse.wait();
  
      if (resolution === FlashbotsBundleResolution.BundleIncluded) {
        console.log(`Congrats, unstaked tokens recovered in block ${blockNumber + 1}`);
        process.exit(0);
      }
  
      console.log(await flashbotsTransactionResponse.simulate());
    }
  }

module.exports = EigenLayerRecovery;
