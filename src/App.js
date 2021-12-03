import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null)

  //check if wallet solana is in the browser
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if(solana){
        if(solana.isPhantom) {
          console.log("Phantom wallet found");
          //check if the user is log to his/her wallet
          const res = await solana.connect({ onlyIfTrusted: true });
          console.log(
          'Connected with Public Key:',
          res.publicKey.toString()
        );
        //save adress user wallet
        setWalletAddress(res.publicKey.toString())
        } else {
          alert('Solana object not found! Get a Phantom Wallet 👻');
        }
      }
    } catch(err){
      console.log(err);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if(solana){
      const res = await solana.connect();
      console.log("Connect with PublicKey : ", res.publicKey.toString());
      setWalletAddress(res.publicKey.toString());
    }
  };

  const renderNotConnectedContainer = () => (
    <button 
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >Connect to Wallet</button>
  );

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return (
    <div className="App">
			{/* This was solely added for some styling fanciness */}
			<div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 Waifu Portal</p>
          <p className="sub-text">
            View your Waifu collection in the metaverse ✨
          </p>
          {/* Add the condition to show this only if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
