import { ChainID, ChainType } from '@harmony-js/utils';

export const MAINNET = {
    url: "https://api1.s0.t.hmny.io",
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyMainnet,
    shardID: 0,
    explorer: "https://explorer.harmony.one",
}
export const TESTNET = {
    url: "https://api.s0.b.hmny.io",
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
    shardID: 0,
    explorer: "https://explorer.testnet.harmony.one",
}

//module.exports = {MAINNET, TESTNET}