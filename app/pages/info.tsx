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

        <span className={styles.sub2}>Here's a step-by-step guide on how to use our platform as a seller or buyer:</span><br/><br/>

        <span className={styles.sub2}>For sellers:</span><br/>

        <b>1.</b> Install and set up MetaMask on your browser.<br/>
        <b>2.</b> Go to the penguinX website and login using your MetaMask account.<br/>
        <b>3.</b> Once you're logged in, select the "Create a Listing" option from the menu.<br/>
        <b>4.</b> Fill out the form with the details of your product, including the name, description, price, and a picture.<br/>
        <b>5.</b> Click the "List Product" button.<br/>
        <b>6.</b> Review the transaction details and confirm the listing by signing the transaction with MetaMask.<br/>
        <b>7.</b> Your listing will now be pending and will appear under the "Pending Listings" section of the marketplace.<br/>
        <b>8.</b> Once your product has been verified by the penguinX team, it will be released to the marketplace for other users to see and purchase.<br/><br/>
        
        <span className={styles.sub2}>For buyers:</span><br/>

        <b>1.</b> Install and set up MetaMask on your browser.<br/>
        <b>2.</b> Go to the penguinX website and login using your MetaMask account.<br/>
        <b>3.</b> Browse the marketplace for the product you'd like to purchase.<br/>
        <b>4.</b> Once you've found a product you want to buy, click on it to view the listing details.<br/>
        <b>5.</b> Click the "Pay" button to initiate the purchase.<br/>
        <b>6.</b> Review the transaction details and confirm the payment by signing the transaction with MetaMask.<br/>
        <b>7.</b> Once the payment is confirmed, the product will be sent to you by the seller.<br/><br/>
        That's it! With these simple steps, you can buy and sell cool stuff with crypto on the penguinX marketplace with ease.
        </p>
    
    </div>
    );
}

export default Home;
