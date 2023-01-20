import { client } from "process";
//const qs = require('qs');

export const state = () => {
    return {
        wallet: undefined,
        chainId: undefined,
        market: undefined
    };
};

export const name = "makers";

export const getters = {

};

export const actions = {
    setData({commit}, {i, v}) {
        console.log('setData', i, v);
        if (['wallet', 'chainId'].includes(i)) {
            commit("setData", { identifier: i, value: v });
        }
    },
    clearStore({ commit }) {
        commit("clearStore");
    },
};

// mutations
export const mutations = {
    setData(state, data) {
        console.log(`mutating state ${data.identifier}`, data.value);
        switch (data.identifier) {
            case 'wallet':
                state.wallet = data.value
                break;
            case 'chainId':
                state.chainId = data.value
            default:
                console.warn('unhandled', data.identifier);
                break;
        }
    },

    clearStore(state) {
        state.wallet = undefined;
        state.chainId = undefined;
        state.market = undefined;
    },
};