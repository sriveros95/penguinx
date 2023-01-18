import Vue from "vue";
const { BigNumber } = require('ethers');

Vue.prototype.$tokenAmountToWei = (amount, decimals) => {
    return BigNumber.from("0x" + (amount * 10 ** decimals).toString(16)).toString();
}