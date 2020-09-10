const { contractConfig } = require('../config.js')
const Web3 = require("web3");
const BigNumber = require("bignumber.js")

class FaucetErc20 {
    constructor(faucetAddress) {
        const web3 = new Web3(window.ethereum)
        this.web3 = web3

        let tokenJson = require("./FaucetToken.json")
        this.tokenJson = tokenJson
        this.userAddress = ''

        this.faucetAddress = faucetAddress
        this.faucetContract = new web3.eth.Contract(tokenJson.abi, faucetAddress)
    }

    setUserAddress(address) {
        this.userAddress = address
    }

    async mint() {
        const sendOption = await this._getUserOption()
        let txn = await this.faucetContract.methods.mint().send(sendOption)
        return txn.transactionHash
    }

    async _getUserOption() {
        const gasPrice = await this._estimateGasPrice()
        const gasLimit = this._getGasLimit()
        return {
            from: this.userAddress,
            gas: gasLimit,
            gasPrice: gasPrice,
        }
    }

    async _estimateGasPrice() {
        let rawPrice = await this.web3.eth.getGasPrice()
        let parsed = new BigNumber(rawPrice)
        let multiplier = new BigNumber(4)
        return (parsed * multiplier).toString()
    }

    _getGasLimit() {
        return contractConfig.ethGasLimit
    }
}


module.exports = FaucetErc20

