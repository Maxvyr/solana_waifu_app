import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

//interact with contract
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json'; //file for communicate with smart contract
import kp from './keypair.json'

// SystemProgram is a reference to the Solana blockchain runtime!
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the waifu data.
let arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
let baseAccount = web3.Keypair.fromSecretKey(secret);

// Get program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}


// Constants
const TWITTER_HANDLE_ME = 'm4xvyr';
const TWITTER_HANDLE_SITE = '_buildspace';
const TWITTER_LINK_ME = `https://twitter.com/${TWITTER_HANDLE_ME}`;
const TWITTER_LINK_SITE = `https://twitter.com/${TWITTER_HANDLE_SITE}`;

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
  const [inputValue, setInputValue] = useState("");
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
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const sendWaifu = async () => {
    if(inputValue.length === 0){
      console.log("No Waifu link given")
      return
    }

    setInputValue("")
      console.log("Waifu link :", inputValue);

      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);

        await program.rpc.addGif(inputValue, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log("Waifu successfully send to smart contract", inputValue);
        
        await getWaifuList();
      } catch (e){
        console.log("Error sending Waifu", e);
      }
  } 
 
  const renderNotConnectedContainer = () => (
    <button 
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >Connect to Wallet</button>
  );

  const renderConnectedContainer = () => {
    //if empty list
    if(waifuList === null){
      return(
        <div className="connected-container">if
          <button className="cta-button submit-gif-button" onClick={createWaifuAccount}>
            Start to add some Waifu Pic ;)
          </button>
        </div>
      )
    }
    else{
      return (
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
              {waifuList.map(waifu => {
                console.log(waifu);
                return (
                  <div className="gif-item" key={waifu}>
                    <img src={waifu.gifLink} alt={waifu} />
                  </div>
                );
              })}
            </div>
          </div>
      )
    }
};

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const getWaifuList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got waifu list from the account", account)
      setWaifuList(account.gifList)
  
    } catch (error) {
      console.log("Error in getWaifuList: ", error)
      setWaifuList(null);
    }
  }

  const createWaifuAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getWaifuList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  useEffect(() => {
    console.log("Fetching waifu List")

    //call solana programm
    getWaifuList()

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
            href={TWITTER_LINK_ME}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE_ME}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
