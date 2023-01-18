<template>
  <div>
    <v-btn @click="dialog = true;" :disabled="wallet ? true : false">{{
      wallet? wallet.slice(0, 10) :
      $t('web3.connect_wallet')
    }}</v-btn>
    <v-dialog v-model="dialog">
      <v-card class="text-center mt-10" :loading="loading">
        <v-card-title> Wallet: {{ wallet }} </v-card-title>
        <p v-if="d_mode == 'opening_app'">
          {{ $t("dapp.opening_app") }}
        </p>
        <p v-else-if="d_mode == 'no_metamask'" class="text-danger">
          {{ $t("dapp.no_metamask") }}
        </p>
        <div v-if="d_mode == 'meta_ok'">
          <v-btn color="primary" class="mt-12 font-weight-bold" @click="walletAssociate">
            <v-img class="mr-2" height="20px" width="20px" contain src="/metamask.svg"></v-img>
            {{ $t("dapp.connect_metamask") }}
          </v-btn>
        </div>
        <div v-else-if="d_mode == 'success'" class="text-center">
          <v-img class="mx-auto" height="105px" width="105px" contain src="/metamask.svg"></v-img>
          {{ $t("dapp.metamask_success") }}
        </div>
        <div v-else-if="d_mode == 'failed'" class="text-center">
          <v-img class="mx-auto" height="105px" width="105px" contain src="/metamask.svg"></v-img>
          {{ $t("dapp.metamask_failed") }}
        </div>

        <div v-if="d_mode != 'success'" class="pb-10 caption">
          {{ $t("dapp.open_in_computer") }}
          <br />
          <v-btn small icon @click="copyURL">
            <v-icon small>mdi-content-copy</v-icon>
          </v-btn>
          <a :href="`${frontend}/dapp?tok=${$route.query.tok}&mm=1`" style="font-size: 9px">{{
          `${frontend}/dapp?tok=${$route.query.tok}&mm=1` }}</a>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
const ethers = require("ethers");
import { mapGetters, mapMutations, mapActions, mapState } from "vuex";
import { FRONTEND, PENGUIN_X_MARKETPLACE_ADDRESS } from "@/constants";
import { ABI_MARKETPLACE } from "@/abis";

function openMetaMaskUrl(url) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_self";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default {
  data: () => ({
    loading: false,
    chain_id: undefined,
    errorMessage: "",
    d_mode: false,
    navegador: "",
    frontend: "",
    dialog: false,
    penguin_x_marketplace: undefined
  }),
  computed: {
    // ...mapGetters("web3", ["getInstance"]),
    // web3() {
    //   return this.getInstance;
    // },
    ...mapState({
      wallet: (state) => state.web3.wallet
    }),
  },
  mounted() {
    // const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
    this.init_w3();
    this.frontend = FRONTEND;
  },
  methods: {
    ...mapActions({
      setData: "web3/setData",
    }),

    ...mapMutations("web3", ["registerWeb3Instance"]),

    init_w3() {
      console.log('initing w3', this.$route);

      if (
        typeof window.ethereum !== "undefined" ||
        typeof window.web3 !== "undefined"
      ) {
        // Web3 browser user detected. You can now use the provider.
        // const provider = window["ethereum"] || window.web3.currentProvider;

        // A Web3Provider wraps a standard Web3 provider, which is
        // what MetaMask injects as window.ethereum into each page
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        this.d_mode = "meta_ok";
        console.log('provider', provider);
        const signer = provider.getSigner();
        this.penguin_x_marketplace = new ethers.Contract(PENGUIN_X_MARKETPLACE_ADDRESS, ABI_MARKETPLACE, signer);
        console.log('penguin_x_marketplace', this.penguin_x_marketplace);
        // this.setData({ i: 'market', v: penguin_x_marketplace })

        if (provider.networkVersion) {
          this.setData({ i: 'chainId', v: provider.networkVersion })
        }else if (provider.network && provider.network.chainId){
          this.setData({ i: 'chainId', v: provider.network.chainId })
        }
        if (window.ethereum) {
          console.log('1', window.ethereum._state);
          if (window.ethereum._state && window.ethereum._state.accounts) {
            this.setData({ i: 'wallet', v: window.ethereum._state.accounts[0] });
          }
        } else {
          console.log('2', window.web3);
        }
      } else {
        this.navegador = "no we 3 :o";
        if (
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
        ) {
          if (!this.$route.query.mm) {
            // open the deeplink page
            this.d_mode = "opening_app";
            openMetaMaskUrl(
              `dapp://${FRONTEND}/dapp?tok=${this.$route.query.tok}&mm=1`
            );
          }
        } else {
          // install metamask message
          this.d_mode = "no_metamask";
        }
      }
    },
    getNonce(wallet, net) {
      try {
        return new Date().getTime() / 1000;
      } catch (e) {
        console.error("w3/pre failed", e);
        throw e;
      }
    },
    // curl --request POST \
    //                 --url http://localhost:8081/api/w3/wallet \
    //                 --header 'cb: <wallet-address>' \
    //                 --header 'sig: <signature>' \
    //                 --cookie 'i18n_redirected=en; auth.strategy=local'

    async walletAssociate() {
      // Check for web3 provider
      this.errorMessage = "";
      if (typeof window.ethereum !== "undefined") {
        this.loading = true;
        try {
          // MetaMask requires requesting permission to connect users accounts
          await this.provider.send("eth_requestAccounts", []);

          // The MetaMask plugin also allows signing transactions to
          // send ether and pay to change state within the blockchain.
          // For this, you need the account signer...
          const signer = this.provider.getSigner();

          console.log(provider);
          console.log(signer);
          const coinbase = await signer.getAddress();
          console.log("coinbase", coinbase);
          this.setData({ i: 'wallet', v: window.ethereum._state.accounts[0] });
          this.dialog = false;

        } catch (error) {
          alert("failed sorry");
          console.error(error);
        } finally {
          this.loading = false;
        }
      } else {
        alert("failed to get web3 provider");
      }
    },
    copyURL() {
      navigator.clipboard.writeText(
        `${this.frontend}/dapp?tok=${this.$route.query.tok}&mm=1`
      );
    },
  },
};
</script>

<style>

</style>