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
        So why wait? Join penguinX today and start shopping for the coolest items with crypto!<br/><br/><br/>
        <b>Here's a step-by-step guide on how to use our platform as a seller or buyer:</b><br/><br/>

        <b>For sellers:</b><br/><br/>

        <b>1.</b> Login to penguinX with MetaMask<br/>
        <b>2.</b> Select "Create a listing" from the menu<br/>
        <b>3.</b> Set the listing information, including the name, description, price, and a picture of the product<br/>
        <b>4.</b> Click "List product" and sign the transaction with MetaMask<br/>
        <b>5.</b> Your listing will appear under the "Pending listings" section<br/>
        <b>6.</b> Once your product has been verified, it will be released to the marketplace for everyone to see<br/><br/>
        <b>For buyers:</b><br/><br/>

        <b>1.</b>  Login to penguinX with MetaMask<br/>
        <b>2.</b> Browse for cool stuff by using the search bar or browsing through the different categories<br/>
        <b>3.</b> Once you've found something you want to buy, select it and click "Pay"<br/>
        <b>4.</b> You'll need to sign the transaction to complete the payment<br/>
        <b>5.</b> Once the payment is confirmed, the product will be sent to you<br/><br/>
        That's it! With penguinX, you can easily buy and sell cool stuff with crypto, all without the need for intermediaries or high fees. Enjoy using our platform and happy trading!
        </p>
    
    </div>
    );
}

export default Home;
