const { contractConfig } = require('../config.js')
const Web3 = require("web3");
const BigNumber = require("bignumber.js")
const { GetProof } = require('eth-proof');
const { encode } = require('eth-util-lite');

class EthBridge {
    constructor(bridgeAddress) {
        const web3 = new Web3(window.ethereum)
        this.web3 = web3

        let tokenJson = require("./BridgedToken.json")
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

    setTokenAddress(tokenAddress) {
        if (tokenAddress != this.tokenAddress) {
            this.tokenAddress = tokenAddress
            this.tokenContract = new this.web3.eth.Contract(this.tokenJson.abi, tokenAddress)
        }
    }

    setUserAddress(address) {
        this.userAddress = address
    }

    async getTokenInfo(tokenAddress){
        let tokenContract = this.tokenContract;
        if(tokenAddress != this.tokenAddress)
            tokenContract = new this.web3.eth.Contract(this.tokenJson.abi, tokenAddress)
        const name = await tokenContract.methods.name().call()
        //const symbol = await this.tokenContract.methods.name().symbol()
        //const decimals = await this.tokenContract.methods.name().decimals()
        return {name};
    }

    async getBalance(address) {
        console.log("getBalance:", address)
        if(!this.tokenContract || !address) return '-';
        const sendOption = await this._getUserOption()
        return await this.tokenContract.methods.balanceOf(address).call(sendOption)
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

    async handleProof(proofData) {
        let hash = proofData.hash
        let root = proofData.root
        let key = proofData.key
        let proof = proofData.proof
        let options = await this._getUserOption()

        let resp = await this.bridgeContract.methods.ExecProof(hash, root, key, proof)
            .send(options)
        return resp.transactionHash
    }

    async approve(amount) {
        const sendOption = await this._getUserOption();
        const bridgeAddress = this.bridgeContract.options.address;
        let resp = await this.tokenContract.methods.approve(bridgeAddress, amount).send(sendOption)
        return resp.transactionHash
    }

    async lock(hmyAddr, amount) {
        const sendOption = await this._getUserOption()
        let txn = await this.bridgeContract.methods.RainbowTo(this.tokenAddress, hmyAddr, amount).send(sendOption)
        return txn.transactionHash
    }

    async mapReq(tokenAddr){
        const sendOption = await this._getUserOption()
        let txn = await this.bridgeContract.methods.CreateRainbow(tokenAddr).send(sendOption)
        return txn.transactionHash
    }

    getBridgeSize(){
        return this.bridgeContract.methods.getRainbowSize().call();
    }

    async getTokenParisByIndex(index){
        const erc20 = await this.bridgeContract.methods.LockedTokenList(index).call();
        const hrc20 = await this.bridgeContract.methods.ThisSideLocked(erc20).call();
        return {erc20, hrc20}
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

