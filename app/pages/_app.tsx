import React from "react";
import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import Head from "next/head";
import Header from "../components/Header";

// This is the chainId your dApp will work on.
// const PENGUIN_X_CHAIN = ChainId.Goerli;
const PENGUIN_X_CHAIN = ChainId.Polygon;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={PENGUIN_X_CHAIN}>
      <Head>
        <title>penguinX</title>
        <link rel="shortcut icon" href="https://penguinx.xyz/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Buy and sell stuff with crypto, no intermediaries, no fees! The P2P exchange, only for cool stuff. Run by smart contracts on Polygon. 😎"
        />
        <meta
          name="keywords"
          content="Buy and sell stuff with crypto, no intermediaries, no fees! The P2P exchange, only for cool stuff. 😎"
        />
      </Head>
      <Header />
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
