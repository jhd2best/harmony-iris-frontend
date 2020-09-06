const { contractConfig } = require('../config.js')
const Web3 = require("web3");
const BigNumber = require("bignumber.js")
const { GetProof } = require('eth-proof');
const { encode } = require('eth-util-lite');

class EthBridge {
    constructor(tokenAddress, bridgeAddress) {
        const web3 = new Web3(window.ethereum)
        this.web3 = web3

        let tokenJson = require("./BridgedToken.json")
        if (tokenAddress) {
            this.tokenAddress = tokenAddress
            this.tokenContract = new web3.eth.Contract(tokenJson.abi, tokenAddress)
        } else {
            this.tokenContract = new web3.eth.Contract(tokenJson.abi)
        }
        this.tokenJson = tokenJson
        this.userAddress = ''

        let bridgeJson = require("./RainbowOnes.json")
        if (bridgeAddress) {
            this.bridgeAddress = bridgeAddress
            this.bridgeContract = new web3.eth.Contract(bridgeJson.abi, bridgeAddress)
        } else {
            this.bridgeContract = new web3.eth.Contract(bridgeJson.abi)
        }
        this.bridgeJson = bridgeJson

        this.gp = new GetProof(contractConfig.ethNodeUrl)
    }

    setUserAddress(address) {
        this.userAddress = address
    }

    async getBalance(addr) {
        const sendOption = await this._getUserOption()
        return await this.tokenContract.methods.balanceOf(addr).call(sendOption)
    }

    async getProof(txHash) {
        let resp = await this.gp.receiptProof(txHash)

        let rawReceipt = await this.web3.eth.getTransactionReceipt(txHash)
        let blockHash = rawReceipt.blockHash.replace("0x", "")
        return {
            hash: Buffer.from(blockHash, 'hex'),
            root: resp.header.receiptRoot,
            proof: encode(resp.receiptProof),
            key: encode(parseInt(resp.txIndex))
        }
    }

    async handleHmyProof(proofData) {
        let hash = proofData.hash
        let root = proofData.root
        let key = proofData.key
        let proof = proofData.proof
        let options = await this._getUserOption()

        let resp = await this.bridgeContract.methods.ExecProof(hash, root, key, proof)
            .send(options)
        return resp
    }

    async approve(targetAddr, amount) {
        const sendOption = await this._getUserOption()
        await this.tokenContract.methods.approve(targetAddr, amount).send(sendOption)
    }

    async lock(hmyAddr, amount) {
        const sendOption = await this._getUserOption()
        let txn = await this.bridgeContract.methods.RainbowTo(this.tokenAddress, hmyAddr, amount).send(sendOption)
        return txn.events.Locked.transactionHash
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


module.exports = EthBridge

