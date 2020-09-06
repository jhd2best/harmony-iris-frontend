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
            <el-card class="card-swap-form" v-if="currentDirection == 'eth2hmy'">
              <div class="div-swap-form" v-if="eth2hmySwapStep < 0">
                <el-form ref="form" :model="eth2hmyForm" label-width="80px" label-position="top">
                  <el-form-item label="Iris Amount">
                    <el-input v-model="eth2hmyForm.rbtAmount"></el-input>
                  </el-form-item>
                  <el-form-item label="Target ONE Address">
                    <el-input v-model="eth2hmyForm.oneAddress"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="danger" @click="switchDirection" class="btn-switch">SWITCH DIRECTION</el-button>
                    <el-button type="primary" @click="doEth2hmySwap" class="btn-swap" :disabled="!eth2hmyForm.oneAddress || !eth2hmyForm.rbtAmount">SWAP ME!</el-button>
                  </el-form-item>
                </el-form>
              </div>
              <div class="div-swap-step" v-else>
                <el-steps direction="vertical" :active="eth2hmySwapStep" finish-status="success" style="height: 250px;">
                  <el-step title="approve token locking for ETH wallet" :description="eth2hmySwapStepDesc[0]" :icon="eth2hmySwapStepIcon[0]"></el-step>
                  <el-step title="locking origin token on Ethereum" :description="eth2hmySwapStepDesc[1]" :icon="eth2hmySwapStepIcon[1]"></el-step>
                  <el-step title="handle proof data on Harmony" :description="eth2hmySwapStepDesc[2]" :icon="eth2hmySwapStepIcon[2]"></el-step>
                  <el-step title="minting new token on Harmony" :description="eth2hmySwapStepDesc[3]" :icon="eth2hmySwapStepIcon[3]"></el-step>
                </el-steps>
                <div class="div-swap-step-back">
                  <el-button type="success" @click="resetStatus" class="btn-back" :disabled="eth2hmySwapStep != 4">BACK</el-button>
                </div>
              </div>
            </el-card>
            <el-card class="card-swap-form" v-if="currentDirection == 'hmy2eth'">
              <div class="div-swap-form" v-if="hmy2ethSwapStep < 0">
                <el-form ref="form" :model="hmy2ethForm" label-width="80px" label-position="top">
                  <el-form-item label="Iris Amount">
                    <el-input v-model="hmy2ethForm.rbtAmount"></el-input>
                  </el-form-item>
                  <el-form-item label="Target ETH Address">
                    <el-input v-model="hmy2ethForm.ethAddress"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="danger" @click="switchDirection" class="btn-switch">SWITCH DIRECTION</el-button>
                    <el-button type="primary" @click="doHmy2ethSwap" class="btn-swap" :disabled="!hmy2ethForm.ethAddress || !hmy2ethForm.rbtAmount">SWAP ME!</el-button>
                  </el-form-item>
                </el-form>
              </div>
              <div class="div-swap-step" v-else>
                <el-steps direction="vertical" :active="hmy2ethSwapStep" finish-status="success" style="height: 250px;">
                  <el-step title="approve token locking for ONE wallet" :description="hmy2ethSwapStepDesc[0]" :icon="hmy2ethSwapStepIcon[0]"></el-step>
                  <el-step title="locking origin token on Harmony" :description="hmy2ethSwapStepDesc[1]" :icon="hmy2ethSwapStepIcon[1]"></el-step>
                  <el-step title="handle proof data on Ethereum" :description="hmy2ethSwapStepDesc[2]" :icon="hmy2ethSwapStepIcon[2]"></el-step>
                  <el-step title="minting new token on Ethereum" :description="hmy2ethSwapStepDesc[3]" :icon="hmy2ethSwapStepIcon[3]"></el-step>
                </el-steps>
                <div class="div-swap-step-back">
                  <el-button type="success" @click="resetStatus" class="btn-back" :disabled="hmy2ethSwapStep != 4">BACK</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12" class="col-panel">
            <el-card class="card-wallet">
              <div class="div-wallet">
                <div class="div-wallet-title">
                  <img :src="oneLogoSrc" alt="one" class="img-coin-logo">
                  <span class="span-coin-title">Harmony</span>
                  <span class="span-coin-sub-title">(ONE Wallet)</span>
                </div>
                <div class="div-wallet-logout" v-if="oneAddress">
                  <span @click="oneLogout"><i class="el-icon-switch-button"></i></span>
                </div>
              </div>
              <div v-if="oneAddress">
                <span class="text-left">Harmony Address</span>
                <span class="text-right">{{ shorterAddress(oneAddress) }}</span>
                <el-divider></el-divider>
                <span class="text-left">ONE</span>
                <span class="text-right">{{ oneBalance }}</span>
                <el-divider></el-divider>
                <span class="text-left">Harmony Iris</span>
                <span class="text-right">{{ oneRBTBalance }}</span>
              </div>
              <div v-if="oneAddress == ''" class="wallet-login-holder">
                <el-button type="warning" @click="loginOne" class="btn-connect-wallet" :loading="isOneWalletTrying" :disabled="!isOneWalletInstall">Connect Wallet</el-button>
                <div v-if="!isOneWalletInstall">ONE Wallet not found</div>
              </div>
              <div class="div-wallet" style="margin-top: 87px">
                <div class="div-wallet-title">
                  <img :src="ethLogoSrc" alt="eth" class="img-coin-logo">
                  <span class="span-coin-title">Ethereum</span>
                  <span class="span-coin-sub-title">(Metamask)</span>
                </div>
                <div class="div-wallet-logout" v-if="ethAddress">
                  <span @click="ethLogout"><i class="el-icon-switch-button"></i></span>
                </div>
              </div>
              <div v-if="ethAddress">
                <span class="text-left">Ethereum Address</span>
                <span class="text-right">{{ shorterAddress(ethAddress) }}</span>
                <el-divider></el-divider>
                <span class="text-left">ETH</span>
                <span class="text-right">{{ ethBalance }}</span>
                <el-divider></el-divider>
                <span class="text-left">Ethereum Iris</span>
                <span class="text-right">{{ ethRBTBalance }}</span>
              </div>
              <div v-if="ethAddress == ''" class="wallet-login-holder">
                <el-button type="warning" @click="loginEth" class="btn-connect-wallet">Connect Wallet</el-button>
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
import { HarmonyExtension } from '@harmony-js/core'
import { ChainID, ChainType, fromWei, Units, hexToNumber } from '@harmony-js/utils'
import { contractConfig } from '../config.js'
HarmonyExtension;ChainID;ChainType;
const EthBridge = require("../lib/EthBridge");
const eb = new EthBridge(contractConfig.ercToken, contractConfig.ethBridge)
const HmyBridge = require("../lib/HmyBridge");

const { TESTNET } = require("../js/globalConfig.js")
const { HmySDK  }  = require('../js/hmy.js')

const hmySDK = new HmySDK(TESTNET, "TESTNET")


export default {
  name: 'home',
  data () {
    return {
      logoSrc: require('../assets/rainbow-logo.png'),
      oneLogoSrc: require('../assets/one.svg'),
      ethLogoSrc: require('../assets/eth.svg'),
      extRainbow: null,
      harmonyEx: null,
      oneAddress: '',
      oneBalance: 0,
      ethAddress: '',
      ethBalance: 0,
      ethRBTBalance: 0,
      oneRBTBalance: 0,
      oneWalletTryTimes: 0,
      isOneWalletTrying: true,
      isOneWalletInstall: true,
      isEthWalletInstall: true,
      currentDirection: 'eth2hmy',
      eth2hmyForm: {},
      hmy2ethForm: {},
      eth2hmySwapStep: -1,
      hmy2ethSwapStep: -1,
      eth2hmySwapStepIcon: ['', '', '', ''],
      eth2hmySwapStepDesc: ['', '', '', ''],
      hmy2ethSwapStepIcon: ['', '', '', ''],
      hmy2ethSwapStepDesc: ['', '', '', ''],
      hb: null,
    }
  },
  methods: {
    async initOneWallet() {
      // one wallet
      if (typeof window.harmony !== 'undefined') {
        this.isOneWalletTrying = false
        /*
        this.harmonyEx = new HarmonyExtension(window.onewallet, {
          chainType: ChainType.Harmony,
          chainId: ChainID.HmyTestnet,
        })
        this.harmonyEx.setProvider(contractConfig.oneNodeUrl)
        */
        this.harmonyEx = hmySDK
        let ret = await this.harmonyEx.login()
        console.log("ret:", ret)
        this.hb = new HmyBridge(contractConfig.hmyBridge, contractConfig.hrcToken, this.harmonyEx)
      } else {
        console.log('one wallet not found, try again later')
        if (this.oneWalletTryTimes < 5) {
          this.oneWalletTryTimes++
          setTimeout(this.initOneWallet, 300)
        } else {
          this.isOneWalletTrying = false
          this.isOneWalletInstall = false
          console.log('One wallet not install!')
        }
      }
    },
    initEthWallet() {
       // matemask wallet
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
      } else {
        this.isEthWalletInstall = false
        console.log('ethereum wallet not install!')
      }
    },
    switchDirection() {
      if (this.currentDirection == 'eth2hmy') {
        this.currentDirection = 'hmy2eth'
      } else {
        this.currentDirection = 'eth2hmy'
      }
    },
    resetStatus() {
      this.eth2hmySwapStep = -1
      this.hmy2ethSwapStep = -1
    },
    async doEth2hmySwap() {
      // approve token locking for ETH wallet
      this.eth2hmySwapStep = 0
      this.eth2hmySwapStepIcon[0] = 'el-icon-loading'
      await eb.approve(contractConfig.ethBridge, this.eth2hmyForm.rbtAmount)
      
      // locking origin token on Ethereum
      this.eth2hmySwapStep = 1
      this.eth2hmySwapStepIcon[0] = '' 
      this.eth2hmySwapStepIcon[1] = 'el-icon-loading'
      let locked = await eb.lock(this.hb.hmy.crypto.fromBech32(this.oneAddress), this.eth2hmyForm.rbtAmount)
      console.log("token locked: ", locked)

      // handle proof data on Harmony
      this.eth2hmySwapStep = 2
      this.eth2hmySwapStepIcon[1] = '' 
      this.eth2hmySwapStepIcon[2] = 'el-icon-loading'
      let proof = await eb.getProof(locked)
      console.log("proof: ", proof)

       // minting new token on Harmony
      this.eth2hmySwapStep = 3
      this.eth2hmySwapStepIcon[2] = '' 
      this.eth2hmySwapStepIcon[3] = 'el-icon-loading'
      let trans = await this.hb.handleEthProof(proof)
      try {
        // let options = {gasPrice: contractConfig.oneGasPrice, gasLimit: contractConfig.oneGasLimit, waitConfirm: true}
        // await trans.send(options)
        let res = await trans.send(this.$store.txConfig());
        //let res = window.onewallet.signTransaction(trans)
        console.log("res: ", res)
      } catch (e) {
        console.error(e)
      }

      setTimeout(this.checkHmyTrans, 10000)
    },
    async checkHmyTrans() {
      this.eth2hmySwapStep = 4
      this.eth2hmySwapStepIcon[3] = ''
      this.eth2hmyForm.rbtAmount = 0
      this.$message({
        message: 'swap token successed',
        type: 'success'
      })
      this.refreshOneBalance()
      this.refreshEthBalance()
    },
    async doHmy2ethSwap() {
      // approve token locking for ONE wallet
      this.hmy2ethSwapStep = 0
      this.hmy2ethSwapStepIcon[0] = 'el-icon-loading'
      await this.hb.approve(contractConfig.hmyBridge, eb.web3.utils.toWei(this.hmy2ethForm.rbtAmount))
      
      // locking origin token on Harmony
      this.hmy2ethSwapStep = 1
      this.hmy2ethSwapStepIcon[0] = '' 
      this.hmy2ethSwapStepIcon[1] = 'el-icon-loading'
      let locked = await this.hb.lock(this.ethAddress, eb.web3.utils.toWei(this.hmy2ethForm.rbtAmount))
      console.log("token locked: ", locked)

      // handle proof data on Ethereum
      this.hmy2ethSwapStep = 2
      this.hmy2ethSwapStepIcon[1] = '' 
      this.hmy2ethSwapStepIcon[2] = 'el-icon-loading'
      let proof = await this.hb.getProof(locked)
      console.log("proof: ", proof)

       // minting new token on Ethereum
      this.hmy2ethSwapStep = 3
      this.hmy2ethSwapStepIcon[2] = '' 
      this.hmy2ethSwapStepIcon[3] = 'el-icon-loading'
      let txHash = await eb.handleHmyProof(proof)
      console.log("txHash: ", txHash)

      this.hmy2ethSwapStep = 4
      this.hmy2ethSwapStepIcon[3] = ''
      this.hmy2ethForm.rbtAmount = 0
      this.$message({
        message: 'swap token successed',
        type: 'success'
      })
      this.refreshOneBalance()
      this.refreshEthBalance()
    },
    async loginOne() {
      await this.harmonyEx.login().then(async (acc) => {
        this.oneAddress = acc.address
        this.eth2hmyForm.oneAddress = this.oneAddress
        this.refreshOneBalance()
        this.$message({
          message: 'connect harmony wallet successed',
          type: 'success'
        })
      })
      .catch((err) => {
        console.error(err);
      });
    },
    async loginEth() {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      this.ethAddress = accounts[0]
      this.hmy2ethForm.ethAddress = this.ethAddress
      eb.setUserAddress(this.ethAddress)
      this.refreshEthBalance()
      this.$message({
        message: 'connect ethereum wallet successed',
        type: 'success'
      })
    },
    async oneLogout() {
      await this.harmonyEx.logout()
      this.oneAddress = ''
      this.$message({
        message: 'logout wallet successed',
        type: 'success'
      });
    },
    async ethLogout() {
      this.ethAddress = ''
      this.$message({
        message: 'logout wallet successed',
        type: 'success'
      });
    },
    async refreshOneBalance() {
      this.hb.hmy.blockchain.getBalance({ address: this.oneAddress })
      .then((res) => {
        this.oneBalance = fromWei(hexToNumber(res.result), Units.one)
      })
      this.oneRBTBalance = fromWei(await this.hb.getBalance(this.oneAddress), Units.one)
    },
    async refreshEthBalance() {
      eb.web3.eth.getBalance(this.ethAddress).then((res) => {
        this.ethBalance = eb.web3.utils.fromWei(res)
      })
      this.ethRBTBalance = eb.web3.utils.fromWei(await eb.getBalance(this.ethAddress))
    },
    // shorter address
    shorterAddress(address) {
      return address.slice(0, 11)+"...."+address.slice(-12)
    }
  },
  created: function () {

  },
  mounted: function () {
    this.initOneWallet()
    this.initEthWallet()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.home {
  padding: 40px 0px 0px 0px;
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
  height: 293px;
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
  color: #212D5E;
  font-weight: bold;
}

.el-form-item .btn-swap {
  width: 150px;
  font-size: 18px;
  font-weight: bold;
  float: right;
  text-align: center;
}

.el-form-item .btn-switch {
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
  color: #409EFF;
}
</style>
