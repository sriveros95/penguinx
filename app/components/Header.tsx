import { useAddress, useMetamask, useDisconnect } from "@thirdweb-dev/react";
import Link from "next/link";
import React from "react";
import styles from "../styles/Home.module.css";

export default function Header() {
  // Helpful thirdweb hooks to connect and manage the wallet from metamask.
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <div>
          <Link href="/" passHref role="button" legacyBehavior>
            <img
              src={`logo.png`}
              alt="penguinX"
              width={135}
              style={{ cursor: "pointer" }}
            />
          </Link>
        </div>
      </div>

      <div className={styles.containerHeader} style={{ marginRight: 20}}>
        <div className={styles.right}>
          <Link
            href="/catalogue"
            className={styles.description}
            style={{ textDecoration: "none" }}>

            Shop

          </Link>
        </div>
        <div className={styles.right}>
          <Link
            href="/about"
            className={styles.description}
            style={{ textDecoration: "none" }}>

            About

          </Link>
        </div>

        <div className={styles.right}>
          <Link
            href="https://discord.gg/ByuUgytbJ5"
            className={styles.description}
            style={{ textDecoration: "none" }}>

            <img src="discord.svg" className={styles.discordIcon} alt="discord"></img>

          </Link>
        </div>

        <div className={styles.right}>
          {address ? (
            <>
              <a
                className={styles.secondaryButton}
                onClick={() => disconnectWallet()}
              >
                Disconnect Wallet
              </a>
              <p style={{ marginLeft: 8, marginRight: 8, color: "grey" }}>|</p>
              <p className={styles.wallet}>{address.slice(0, 6).concat("...").concat(address.slice(-4))}</p>
            </>
          ) : (
            <a
              className={styles.connectWalletButton}
              onClick={() => connectWithMetamask()}
            >
              Connect Wallet
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
