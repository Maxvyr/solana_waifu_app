import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_WAIFUS = [
  'https://i.waifu.pics/_zlfBgp.jpg',
  'https://i.waifu.pics/2XuoPFb.png',
  'https://media.giphy.com/media/l1J9BzV9oRSdIKNDq/giphy-downsized-large.gif',
  'https://media.giphy.com/media/OOSbqEBoTmA2OUN3pO/giphy.gif',
  'https://media.giphy.com/media/dc4UxTw2ueAbm/giphy.gif',
  'https://media.giphy.com/media/5bHgk2QtDaVl3TxP3M/giphy.gif'
]

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setinputValue] = useState("");
  const [waifuList , setWaifuList] = useState([]);

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

  const onInputChange = (event) => {
    // recover value inside input and call useEffect
    const { value }= event.target;
    setinputValue(value);
  }

  const sendWaifu = async () => {
    if(inputValue.length > 0){
      console.log("Waifu link :", inputValue);
      //add new waifu in list
      setWaifuList([...waifuList, inputValue]);

      //remove text in input
      setinputValue("");
    } else {
      console.log("Empty Input ......")
    }
  } 
 
  const renderNotConnectedContainer = () => (
    <button 
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >Connect to Wallet</button>
  );

  const renderConnectedContainer = () => (
  <div className="connected-container">
    {/* form to add new waifu image */}
    <form
      onSubmit={(event) => {
        event.preventDefault();
        sendWaifu();
      }}
    >
      <input type="text" placeholder="Enter your waifu link!" value={inputValue} onChange={onInputChange}/>
      <button type="submit" className="cta-button submit-gif-button">Submit</button>
    </form>
    <div className="gif-grid">
        {waifuList.map(waifu => (
          <div className="gif-item" key={waifu}>
          <img src={waifu} alt={waifu} />
        </div>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    console.log("Fetching waifu List")

    //call solana programm

    //set State
    setWaifuList(TEST_WAIFUS);

  }, [walletAddress]);

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
          {/* and if user connected */}
          {walletAddress && renderConnectedContainer()}
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
