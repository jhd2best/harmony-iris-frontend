const { contractConfig } = require('../config.js')

class HmyBridge {
    constructor(bridgeAddress, hmy) {
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

        this.proofNode = contractConfig.proofNodeUrl
    }


    setTokenAddress(tokenAddress) {
        if (tokenAddress != this.tokenAddress) {
            this.tokenAddress = tokenAddress
            this.tokenContract = this.hmy.ContractAt(this.tokenJson.abi, tokenAddress)
        }
    }

    async getTokenInfo(tokenAddress){
        let tokenContract = this.tokenContract;
        if(tokenAddress != this.tokenAddress)
            tokenContract = this.hmy.ContractAt(this.tokenJson.abi, tokenAddress)
        const name = await tokenContract.methods.name().call()
        //const symbol = await this.tokenContract.methods.name().symbol()
        //const decimals = await this.tokenContract.methods.name().decimals()
        return {name};
    }

    async getBalance(address) {
        console.log("getBalance:", address)
        if(!this.tokenContract || !address) return '-';
        let options = {gasPrice: this.gasPrice, gasLimit: this.gasLimit}
        return await this.tokenContract.methods.balanceOf(this.hmy.crypto.fromBech32(address)).call(options)
    }

    async handleProof(proofData) {
        let hash = proofData.hash
        let root = proofData.root
        let key = proofData.key
        let proof = proofData.proof

        let trans = await this.bridgeContract.methods.ExecProof(hash, root, key, proof).send()
        return trans.transaction.id;
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

    async approve(amount) {
        let options = {gasPrice: this.gasPrice, gasLimit: this.gasLimit}
        let obj = this.tokenContract.methods.approve(this.bridgeContract.address, amount);
        window.approve = obj;
        let resp = await obj.send(options)
        return resp.transaction.id
    }

    async lock(ethAddr, amount) {
        let options = {gasPrice: this.gasPrice, gasLimit: this.gasLimit}
        let obj = this.bridgeContract.methods.RainbowBack(this.tokenAddress, ethAddr, amount);
        let resp = await obj.send(options)
        window.lock = obj;
        return resp.transaction.id
    }

    async mapReq(tokenAddr){
        let options = {gasPrice: this.gasPrice, gasLimit: this.gasLimit}
        let obj = this.bridgeContract.methods.CreateRainbow(tokenAddr);
        let resp = await obj.send(options)
        return resp.transaction.id
    }
}

function hexToBuffer(hexStr) {
    hexStr = hexStr.replace("0x", "")
    return Buffer.from(hexStr, 'hex')
}

module.exports = HmyBridge
