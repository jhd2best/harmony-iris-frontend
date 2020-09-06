const { contractConfig } = require('../config.js')

class HmyBridge {
    constructor(bridgeAddress, tokenAddress, hmy) {
        let bridgeJson = require("./RainbowOnes.json")
        let tokenJson = require("./BridgedToken.json")

        this.hmy = hmy
        this.gasLimit = contractConfig.oneGasLimit
        this.gasPrice = contractConfig.oneGasPrice
        this.bridgeJson = bridgeJson
        this.tokenJson = tokenJson

        if (bridgeAddress) {
            this.bridgeAddress = bridgeAddress
            this.bridgeContract = hmy.contracts.createContract(bridgeJson.abi, bridgeAddress)
        } else {
            this.bridgeContract = hmy.contracts.createContract(bridgeJson.abi)
        }

        if (tokenAddress) {
            this.tokenAddress = tokenAddress
            this.tokenContract = hmy.contracts.createContract(tokenJson.abi, tokenAddress)
        } else {
            this.tokenContract = hmy.contracts.createContract(tokenJson.abi)
        }

        this.proofNode = contractConfig.proofNodeUrl
    }

    async getBalance(address) {
        let options = {gasPrice: this.gasPrice, gasLimit: this.gasLimit}
        return await this.tokenContract.methods.balanceOf(this.hmy.crypto.fromBech32(address)).call(options)
    }

    async handleEthProof(proofData) {
        let hash = proofData.hash
        let root = proofData.root
        let key = proofData.key
        let proof = proofData.proof

        let trans = await this.bridgeContract.methods.ExecProof(hash, root, key, proof)
        
        return trans
    }

    async getProof(txHash) {
        let data = {
            "jsonrpc": "2.0",
            "method": "hmy_getReceiptProof",
            "params": [
                txHash
            ],
            "id": 1
        }
        const options = {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            method: 'POST'
        }
        let resp = await fetch(this.proofNode, options)
        let respData = await resp.json()
        return {
            hash: hexToBuffer(respData.result.blockHash),
            root: hexToBuffer(respData.result.receiptRoot),
            key: hexToBuffer(respData.result.txIndex),
            proof: hexToBuffer(respData.result.receiptProof),
        }
    }

    async approve(targetAddr, amount) {
        let options = {gasPrice: this.gasPrice, gasLimit: this.gasLimit}
        return await this.tokenContract.methods.approve(targetAddr, amount).send(options)
    }

    async lock(ethAddr, amount) {
        let options = {gasPrice: this.gasPrice, gasLimit: this.gasLimit}
        let resp = await this.bridgeContract.methods.RainbowBack(this.tokenAddress, ethAddr, amount).send(options)
        return resp.transaction.id
    }
}

function hexToBuffer(hexStr) {
    hexStr = hexStr.replace("0x", "")
    return Buffer.from(hexStr, 'hex')
}

module.exports = HmyBridge