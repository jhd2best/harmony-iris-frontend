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
            this.bridgeContract = hmy.ContractAt(bridgeJson.abi, bridgeAddress)
            window.cc = this.bridgeContract;
            //this.bridgeContract = hmySDK.ContractAt(bridgeJson.abi, bridgeAddress)
        } else {
            window.alert("fuck1!")
            //this.bridgeContract = hmy.contracts.createContract(bridgeJson.abi)
        }

        if (tokenAddress) {
            this.tokenAddress = tokenAddress
            this.tokenContract = hmy.ContractAt(tokenJson.abi, tokenAddress)
        } else {
            window.alert("fuck2!")
            //this.tokenContract = hmy.contracts.createContract(tokenJson.abi)
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

        let trans = this.bridgeContract.methods.ExecProof(hash, root, key, proof)
        window.txx = trans;
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
        let obj = this.tokenContract.methods.approve(targetAddr, amount);
        window.approve = obj;
        return await obj.send(options)
    }

    async lock(ethAddr, amount) {
        let options = {gasPrice: this.gasPrice, gasLimit: this.gasLimit}
        let obj = this.bridgeContract.methods.RainbowBack(this.tokenAddress, ethAddr, amount);
        let resp = await obj.send(options)
        window.lock = obj;
        return resp.transaction.id
    }
}

function hexToBuffer(hexStr) {
    hexStr = hexStr.replace("0x", "")
    return Buffer.from(hexStr, 'hex')
}

module.exports = HmyBridge
