import { useAddress, useMetamask, useDisconnect } from "@thirdweb-dev/react";
import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import { FaDiscord } from 'react-icons/fa';
import { Dropdown } from "@nextui-org/react";
import "/node_modules/flag-icons/css/flag-icons.min.css";
// import i18next from "i18next";


export default function Header() {
  // Helpful thirdweb hooks to connect and manage the wallet from metamask.
  const address = useAddress();
  const [lang, setLang] = useState('en');
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  // const languages = [
  //   {
  //     code: 'en',
  //     name: 'English',
  //     country_code: 'us'
  //   },
  //   {
  //     code: 'es',
  //     name: 'Español',
  //     country_code: 'co'
  //   }
  // ]

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
            href="/create"
            className={styles.description}
            style={{ textDecoration: "none" }}>

            Sell

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
        {/* <div className={styles.right}>
          
          <Dropdown>
            
              <Dropdown.Button className={styles.description}>{lang}</Dropdown.Button>
              <Dropdown.Menu aria-label="Static Actions">
              {languages.map(({ code, name, country_code}) => (
                  <Dropdown.Item key="new" >
                    <button onClick={() => {i18next.changeLanguage(code); setLang(code) }}>
                      {code=='en'?'🇺🇸':'🇨🇴'}{name}
                    </button>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
             
          </Dropdown>
        </div> */}

        <div className={styles.right}>
          <Link
            href="https://discord.gg/ByuUgytbJ5"
            className={styles.description}
            style={{ textDecoration: "none" }}>
            <p><FaDiscord /></p>
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
