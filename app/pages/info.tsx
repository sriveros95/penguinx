import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
        <h1 className={styles.sub2}>
          Welcome to penguinX!
        </h1>

        <p className={styles.info}>
        Welcome to penguinX, the decentralized, peer-to-peer marketplace to buy and sell cool stuff with crypto!<br/><br/>
        Our platform is powered by smart contracts, which means there are no intermediaries or commissions to worry about. Plus, we're built on Polygon, so you can enjoy low fees while you shop for unique items, you can trust that you're getting the best deal possible.<br/><br/>
        At penguinX, we're committed to providing a safe and trustworthy marketplace for our users. That's why we've implemented filters to avoid scams. And with each listing, we mint a unique non-fungible token (NFT) containing all of the product and transaction information, giving you peace of mind and added security.<br/><br/>
        We also mint a soul-bound token for each of our users, which showcases their transaction history and reputation on the platform. This helps build trust and credibility within our community, so you can feel confident about the people you're buying from.<br/><br/>
        So why wait? Join penguinX today and start shopping for the coolest items with crypto!
        </p>
    
    </div>
    );
}

export default Home;
