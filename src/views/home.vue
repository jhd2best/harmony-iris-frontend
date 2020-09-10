<template>
    <div class="home">
        <el-row>
            <el-col :lg="3" :xl="4" class="system-placeholder"></el-col>
            <el-col :lg="18" :xl="16">
                <el-row>
                    <el-col :span="12" class="col-panel">
                        <div class="row-logo">
                            <el-image :src="logoSrc" fit="contain" style="height: 220px;"></el-image>
                        </div>
                        <el-card class="card-swap-form">
                            <div class="div-swap-form" v-if="!CrossRunning">
                                <div>
                                    <el-radio-group v-model="CrossType">
                                        <el-radio-button label="Transfer" />
                                        <el-radio-button label="Mapping" />
                                    </el-radio-group>
                                    <el-button
                                        circle
                                        type="primary"
                                        style="float: right;"
                                        :disabled="!this.ethAddress"
                                        v-show="CrossPairs[CrossToken] && CrossPairs[CrossToken].erc20 == contractConfig.FaucetErc20"
                                        :loading="fauceting"
                                        @click="FaucetMint"
                                    >Faucet</el-button>
                                </div>
                                <div v-if="CrossType == 'Transfer'">
                                    <el-form ref="form" label-width="80px" label-position="top">
                                        <el-form-item label="Token">
                                            <el-select
                                                v-model="CrossToken"
                                                placeholder="Tokens On Bridge"
                                                style="width:100%"
                                            >
                                                <el-option
                                                    v-for="(item,index) in CrossPairs"
                                                    :key="item.erc20"
                                                    :label="item.erc20Info.name+':'+item.erc20"
                                                    :value="index"
                                                ></el-option>
                                            </el-select>
                                        </el-form-item>
                                        <el-form-item label="Amount">
                                            <el-input v-model="CrossToAmount"></el-input>
                                        </el-form-item>
                                        <el-form-item
                                            :label="CrossDirection?'To Harmony':'Back Ethereum'"
                                        >
                                            <el-input v-model="CrossToAddress"></el-input>
                                        </el-form-item>
                                        <el-form-item>
                                            <el-button
                                                type="warning"
                                                @click="switchDirection"
                                                class="btn-switch"
                                            >SWITCH DIR</el-button>
                                            <el-button
                                                type="danger"
                                                @click="CrossDirection?doEth2hmySwap():doHmy2ethSwap()"
                                                class="btn-swap"
                                                :disabled="CrossToAmount== 0 || 0 == CrossToAddress"
                                            >Transfer</el-button>
                                        </el-form-item>
                                    </el-form>
                                </div>
                                <div v-else>
                                    <el-form ref="form" label-width="80px" label-position="top">
                                        <el-form-item label="Token Address">
                                            <el-input v-model="CrossMappingAddress"></el-input>
                                        </el-form-item>
                                        <el-form-item>
                                            <el-button
                                                type="danger"
                                                @click="doEth2HmyMapping"
                                                :disabled="!CrossMappingAddress"
                                                style="width:100%"
                                            >CrossMapping</el-button>
                                        </el-form-item>
                                    </el-form>
                                </div>
                            </div>
                            <div class="div-swap-step" v-else>
                                <el-steps
                                    direction="vertical"
                                    :active="CrossStep"
                                    :finish-status="CrossResult?'success':'error'"
                                >
                                    <el-step
                                        v-for="(step,index) in StepMessage"
                                        :key="index"
                                        :title="step.title"
                                        :description="step.description"
                                        :icon="index==CrossStep ?'el-icon-loading':''"
                                    ></el-step>
                                    <div class="div-swap-step-back">
                                        <el-button
                                            type="success"
                                            @click="CrossRunning=false"
                                            class="btn-back"
                                            :disabled="CrossStep != 1000"
                                        >BACK</el-button>
                                    </div>
                                </el-steps>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="12" class="col-panel">
                        <el-card class="card-wallet">
                            <div class="div-wallet">
                                <div class="div-wallet-title">
                                    <img :src="oneLogoSrc" alt="one" class="img-coin-logo" />
                                    <span class="span-coin-title">Harmony</span>
                                    <span class="span-coin-sub-title">(ONE Wallet)</span>
                                </div>
                                <div class="div-wallet-logout" v-if="oneAddress">
                                    <span @click="oneLogout">
                                        <i class="el-icon-switch-button"></i>
                                    </span>
                                </div>
                            </div>
                            <div v-if="oneAddress">
                                <span class="text-left">Harmony Address</span>
                                <span class="text-right">{{ shorterAddress(oneAddress) }}</span>
                                <el-divider></el-divider>
                                <span class="text-left">ONE</span>
                                <span class="text-right">{{ oneBalance }}</span>
                                <el-divider></el-divider>
                                <div v-if="CrossPairs[CrossToken]">
                                    <span
                                        class="text-left"
                                    >{{ CrossPairs[CrossToken].erc20Info.name }}</span>
                                    <span class="text-right">{{ oneRBTBalance }}</span>
                                </div>
                            </div>
                            <div v-if="oneAddress == ''" class="wallet-login-holder">
                                <el-button
                                    type="warning"
                                    @click="loginOne"
                                    class="btn-connect-wallet"
                                    :loading="isOneWalletTrying"
                                    :disabled="!isOneWalletInstall"
                                >Connect Wallet</el-button>
                                <div v-if="!isOneWalletInstall">ONE Wallet not found</div>
                            </div>
                            <div class="div-wallet" style="margin-top: 87px">
                                <div class="div-wallet-title">
                                    <img :src="ethLogoSrc" alt="eth" class="img-coin-logo" />
                                    <span class="span-coin-title">Ethereum</span>
                                    <span class="span-coin-sub-title">(Metamask)</span>
                                </div>
                                <div class="div-wallet-logout" v-if="ethAddress">
                                    <span @click="ethLogout">
                                        <i class="el-icon-switch-button"></i>
                                    </span>
                                </div>
                            </div>
                            <div v-if="ethAddress">
                                <span class="text-left">Ethereum Address</span>
                                <span class="text-right">{{ shorterAddress(ethAddress) }}</span>
                                <el-divider></el-divider>
                                <span class="text-left">ETH</span>
                                <span class="text-right">{{ ethBalance }}</span>
                                <el-divider></el-divider>
                                <div v-if="CrossPairs[CrossToken]">
                                    <span
                                        class="text-left"
                                    >{{ CrossPairs[CrossToken].erc20Info.name }}</span>
                                    <span class="text-right">{{ ethRBTBalance }}</span>
                                </div>
                            </div>
                            <div v-if="ethAddress == ''" class="wallet-login-holder">
                                <el-button
                                    type="warning"
                                    @click="loginEth"
                                    class="btn-connect-wallet"
                                >Connect Wallet</el-button>
                                <div v-if="!isEthWalletInstall">ETH Wallet not found</div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { HarmonyExtension } from "@harmony-js/core";
import {
    ChainID,
    ChainType,
    fromWei,
    Units,
    hexToNumber,
} from "@harmony-js/utils";
import { contractConfig } from "../config.js";
HarmonyExtension;
ChainID;
ChainType;
const EthBridge = require("../lib/EthBridge");
const FaucetErc20 = require("../lib/FaucetErc20");
//const eb = new EthBridge(contractConfig.ercToken, contractConfig.ethBridge)
const HmyBridge = require("../lib/HmyBridge");

const { TESTNET } = require("../js/globalConfig.js");
const { HmySDK } = require("../js/hmy.js");

const hmySDK = new HmySDK(TESTNET, "TESTNET");

export default {
    name: "home",
    data() {
        return {
            contractConfig,
            logoSrc: require("../assets/rainbow-logo.png"),
            oneLogoSrc: require("../assets/one.svg"),
            ethLogoSrc: require("../assets/eth.svg"),
            harmonyEx: null,
            oneAddress: "",
            oneBalance: 0,
            ethAddress: "",
            ethBalance: 0,
            ethRBTBalance: 0,
            oneRBTBalance: 0,
            oneWalletTryTimes: 0,
            isOneWalletTrying: true,
            isOneWalletInstall: true,
            isEthWalletInstall: true,
            CrossToAmount: 0,
            CrossToAddress: 0,
            CrossMappingAddress: null,
            CrossType: "Transfer", // Transfer or Mapping
            CrossDirection: true, // true: e2h false: h2e
            CrossStep: 0,
            CrossRunning: false,
            CrossResult: true,
            CrossToken: null,
            CrossPairs: [], // {erc20:xxx,hrc20:xxx}
            hb: null,
            eb: new EthBridge(contractConfig.ethBridge),
            fauceting: false,
        };
    },
    methods: {
        async initOneWallet() {
            // one wallet
            if (typeof window.harmony !== "undefined") {
                this.isOneWalletTrying = false;
                this.harmonyEx = hmySDK;
                let ret = await this.harmonyEx.login();
                console.log("ret:", ret);
                this.hb = new HmyBridge(
                    contractConfig.hmyBridge,
                    this.harmonyEx
                );
                await this.updateTokenList();
                if (this.CrossToken == null) this.CrossToken = 0;
            } else {
                console.log("one wallet not found, try again later");
                if (this.oneWalletTryTimes < 5) {
                    this.oneWalletTryTimes++;
                    setTimeout(this.initOneWallet, 300);
                } else {
                    this.isOneWalletTrying = false;
                    this.isOneWalletInstall = false;
                    console.log("One wallet not install!");
                }
            }
        },
        initEthWallet() {
            // matemask wallet
            if (typeof window.ethereum !== "undefined") {
                console.log("MetaMask is installed!");
            } else {
                this.isEthWalletInstall = false;
                console.log("ethereum wallet not install!");
            }
        },
        switchDirection() {
            this.CrossDirection = !this.CrossDirection;
            this.CrossToAddress = this.CrossDirection
                ? this.oneAddress
                : this.ethAddress;
        },
        async doEth2hmySwap() {
            this.CrossResult = true;
            try {
                const to = this.hb.hmy.crypto.fromBech32(this.CrossToAddress);
                await this.doCrossSwap(
                    this.eb,
                    this.hb,
                    to,
                    this.CrossToAmount
                );
            } catch {
                this.CrossResult = false;
            }
            this.CrossStep = 1000;
        },
        async doHmy2ethSwap() {
            this.CrossResult = true;
            try {
                const to = this.CrossToAddress;
                await this.doCrossSwap(
                    this.hb,
                    this.eb,
                    to,
                    this.CrossToAmount
                );
            } catch {
                this.CrossResult = false;
            }
            this.CrossStep = 1000;
        },
        async doCrossSwap(fromBridge, toBridge, toAddress, toAmount) {
            this.CrossStep = 0;
            this.CrossRunning = true;
            let prove = await fromBridge.approve(toAmount);
            prove;

            this.CrossStep = 1;
            let locked = await fromBridge.lock(toAddress, toAmount);
            this.CrossStep = 2;
            let txHash = await this.txRelay(
                fromBridge,
                toBridge,
                locked,
                () => this.CrossStep++
            );
            txHash;
            console.log("step", this.CrossStep);
            this.$message({
                message: "swap token successed",
                type: "success",
            });
            this.refreshOneBalance();
            this.refreshEthBalance();
        },
        async doEth2HmyMapping() {
            this.CrossResult = true;
            try {
                const token = this.CrossMappingAddress;
                await this.doCrossMapping(this.eb, this.hb, token);
            } catch {
                this.CrossResult = false;
            }
            this.CrossStep = 1000;
        },
        async doCrossMapping(fromBridge, toBridge, tokenAddress) {
            this.CrossStep = 0;
            this.CrossRunning = true;
            let mapReq = await fromBridge.mapReq(tokenAddress);
            this.CrossStep = 1;
            let mapAck = await this.txRelay(
                fromBridge,
                toBridge,
                mapReq,
                () => this.CrossStep++
            );
            this.CrossStep++;
            let txHash = await this.txRelay(
                toBridge,
                fromBridge,
                mapAck,
                () => this.CrossStep++
            );
            txHash;
            console.log("step", this.CrossStep);
            this.$message({
                message: "mapping token successed",
                type: "success",
            });
            this.refreshOneBalance();
            this.refreshEthBalance();
            this.updateTokenList();
        },
        async txRelay(fromBridge, toBridge, txHash, stepFunc) {
            let proof = await fromBridge.getProof(txHash);
            if (stepFunc) stepFunc();
            return await toBridge.handleProof(proof);
        },
        async loginOne() {
            await this.harmonyEx
                .login()
                .then(async (acc) => {
                    this.oneAddress = acc.address;
                    this.switchDirection();
                    this.switchDirection();
                    this.refreshOneBalance();
                    this.$message({
                        message: "connect harmony wallet successed",
                        type: "success",
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        },
        async loginEth() {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            this.ethAddress = accounts[0];
            this.switchDirection();
            this.switchDirection();
            this.eb.setUserAddress(this.ethAddress);
            this.refreshEthBalance();
            this.$message({
                message: "connect ethereum wallet successed",
                type: "success",
            });
        },
        async oneLogout() {
            await this.harmonyEx.logout();
            this.oneAddress = "";
            this.$message({
                message: "logout wallet successed",
                type: "success",
            });
        },
        async ethLogout() {
            this.ethAddress = "";
            this.$message({
                message: "logout wallet successed",
                type: "success",
            });
        },
        async refreshOneBalance() {
            if (!this.oneAddress) return;
            this.hb.hmy.blockchain
                .getBalance({ address: this.oneAddress })
                .then((res) => {
                    this.oneBalance = fromWei(
                        hexToNumber(res.result),
                        Units.one
                    );
                });
            this.oneRBTBalance = await this.hb.getBalance(this.oneAddress);
        },
        async refreshEthBalance() {
            if (!this.ethAddress) return;
            this.eb.web3.eth.getBalance(this.ethAddress).then((res) => {
                this.ethBalance = res;
            });
            this.ethRBTBalance = await this.eb.getBalance(this.ethAddress);
        },
        // shorter address
        shorterAddress(address) {
            return address.slice(0, 11) + "...." + address.slice(-12);
        },
        async updateTokenList() {
            const resp = await this.eb.getBridgeSize();
            const lockSize = resp[0];
            for (let i = this.CrossPairs.length; i < lockSize; i++) {
                const tokenPari = await this.eb.getTokenParisByIndex(i);
                tokenPari.erc20Info = await this.eb.getTokenInfo(
                    tokenPari.erc20
                );
                this.CrossPairs.push(tokenPari);
            }
        },
        async FaucetMint() {
            this.fauceting = true;
            const faucet = new FaucetErc20(contractConfig.FaucetErc20)
            faucet.setUserAddress(this.ethAddress);
            await faucet.mint()
            await this.refreshEthBalance()
            this.fauceting = false;
            
        },
    },
    computed: {
        StepMessage() {
            if (this.CrossType == "Mapping")
                return [
                    {
                        title: "ethereum: register token to ETH-IRSI-Birdge",
                        description: "MapReq",
                    },
                    {
                        title: "ethereum: generate reigster proof data",
                        description: "use no gas",
                    },
                    {
                        title:
                            "harmony: verfiy register proof data and create a twin-token",
                        description: "MapAck",
                    },
                    {
                        title:
                            "harmony: generate twin-token creation proof data",
                        description: "use no gas",
                    },
                    {
                        title:
                            "etherum: verfiy twin-token creation proof data and create the Bridge",
                        description: "",
                    },
                ];
            if (this.CrossDirection)
                return [
                    {
                        title:
                            "Ethereum: approve token locking for IRIS Birdge",
                        description: "",
                        icon: "el-icon-loading",
                    },
                    {
                        title:
                            "Ethereum: locking original token on IRIS Birdge",
                        description: "",
                    },
                    {
                        title: "Ethereum: generate locking proof data",
                        description: "use no gas",
                    },
                    {
                        title:
                            "Harmony: verify locking proof data and mining token to user",
                        description: "",
                    },
                ];

            return [
                {
                    title: "Harmony: approve token burnning for IRIS Birdge",
                    description: "",
                },
                {
                    title: "Harmony: burnning mint token on IRIS Bridge",
                    description: "",
                },
                {
                    title: "Harmony: generate burnning proof data from node",
                    description: "use no gas",
                },
                {
                    title:
                        "Ethereum: verify burnning proof data and unlocking token to user",
                    description: "",
                },
            ];
        },
    },
    watch: {
        CrossToken() {
            const CrossToken = this.CrossPairs[this.CrossToken];
            if (CrossToken && CrossToken.erc20) {
                this.eb.setTokenAddress(CrossToken.erc20);
                this.hb.setTokenAddress(CrossToken.hrc20);
                this.refreshOneBalance();
                this.refreshEthBalance();
            }
        },
    },
    created: function () {},
    mounted: function () {
        this.initOneWallet();
        this.initEthWallet();
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.home {
    padding: 40px 0px;
}
.row-logo {
    text-align: center;
    margin-bottom: 20px;
}

.col-panel {
    padding: 0px 15px;
}

.card-swap-form {
    padding: 20px;
}

.card-swap-form .el-card__body {
    padding-bottom: 0px;
}

.card-swap-form .div-swap-step {
  min-height: 293px;
}

.div-swap-step-back {
    text-align: center;
    padding-top: 15px;
}

.div-swap-step-back .btn-back {
    width: 200px;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
}

.el-form-item label {
    font-size: 18px;
    color: #212d5e;
    font-weight: bold;
}

.el-form-item .btn-swap {
    width: 200px;
    font-size: 18px;
    font-weight: bold;
    float: right;
    text-align: center;
}

.el-form-item .btn-switch {
    width: 170px;
    font-size: 18px;
    font-weight: bold;
    float: left;
    text-align: center;
}

.card-wallet {
    padding: 50px 20px;
}

.div-wallet {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.div-wallet-title {
    display: flex;
    margin-bottom: 25px;
    -webkit-box-align: center;
    align-items: center;
}

.img-coin-logo {
    margin-right: 6px;
    margin-bottom: 2px;
}

.span-coin-title {
    font-family: Nunito;
    font-size: 24px;
    font-weight: 500;
    text-align: left;
    color: rgb(48, 48, 61);
    margin-right: 12px;
}

.span-coin-sub-title {
    font-family: Nunito;
    font-size: 16px;
    font-weight: 500;
    color: rgb(33, 45, 94);
    margin-top: 4px;
    letter-spacing: 0.5px;
}

.div-wallet-logout {
    font-size: 24px;
    cursor: pointer;
}

.card-wallet .text-left {
    font-family: Nunito;
    font-size: 16px;
    font-weight: 500;
    color: rgb(33, 45, 94);
    letter-spacing: 0.5px;
}

.card-wallet .text-right {
    font-family: Nunito;
    font-size: 16px;
    font-weight: 700;
    color: rgb(33, 45, 94);
    letter-spacing: 0.5px;
    float: right;
}

.card-wallet .el-divider {
    margin: 15px 0px;
}

.wallet-login-holder {
    height: 129px;
    text-align: center;
}

.wallet-login-holder .btn-connect-wallet {
    background-color: rgb(28, 42, 94);
    border-color: rgb(28, 42, 94);
    color: white;
    font-size: 18px;
    padding: 15px 30px;
    margin-top: 20px;
}

a {
    text-decoration: none;
    color: #409eff;
}
</style>
