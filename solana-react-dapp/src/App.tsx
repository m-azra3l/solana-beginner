
// import functionalities
import React from 'react';
import './App.css';
import {
  PublicKey,
  Transaction,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import { useEffect, useState } from "react";
import './App.css'

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
* @description gets Phantom provider, if it exists
*/
const getProvider = (): PhantomProvider | undefined => {
  if ("phantom" in window) {
    // @ts-ignore
    const provider = window.phantom?.solana as any;
    if (provider?.isPhantom) return provider as PhantomProvider;
  }
};

export default function App() {
  // create state variable for the provider
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );

  // create state variable for the wallet key
  const [walletKey, setWalletKey] = useState<string | undefined>(
    undefined
  );


  // balance of wallet
  const [walletBalance, setWalletBalance] = useState<any | undefined>(
    undefined
  );

  // this is the function that runs whenever the component updates (e.g. render, refresh)
  useEffect(() => {
    const provider = getProvider();

    // if the phantom provider exists, set this as the provider
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  /**
   * @description prompts user to connect wallet if it exists.
   * This function is called when the connect wallet button is clicked
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    // checks if phantom wallet exists
    if (solana) {
      try {
        // connects wallet and returns response which includes the wallet public key
        const response = await solana.connect();
        console.log('wallet account ', response.publicKey.toString());

        // update walletKey to be the public key
        setWalletKey(response.publicKey.toString());

        const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

        // get wallet balance
        const walletBalance = await connection.getBalance(
          new PublicKey(response.publicKey.toString())
        );
        setWalletBalance(walletBalance);

      } catch (err) {
        const errorCode = { code: 4001, message: 'User rejected the request.' }
        console.log(errorCode, err);
      }
    }
  };

  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;
    if (solana) {
      try {
        const response = await solana.disconnect();
        setWalletKey(undefined);
      } catch (err) {

      }
    }
  };

  // HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
            <h2> {!walletKey ? `Connect to Phantom Wallet` : `Connected to Phantom Wallet`}</h2>
            {provider && !walletKey && (
              <button
                style={{
                  fontSize: "16px",
                  padding: "15px",
                  fontWeight: "bold",
                  borderRadius: "5px",
                }}
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            )}
            {provider && walletKey && (
              <div>
                <p>Connected account:</p>
                <p>{walletKey}</p>
                <p>Balance:</p>
                <p>{walletBalance ? `${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL` : `0 SOL`}</p>
              </div>
            )}
            {provider && walletKey && (
              <div>
                <button
                  style={{
                    fontSize: "16px",
                    padding: "15px",
                    fontWeight: "bold",
                    borderRadius: "5px",
                  }}
                  onClick={disconnectWallet}> Disconnect
                </button>
              </div>
            )}

            {!provider && (
              <p>
                No provider found. Install{" "}
                <a href="https://phantom.app/">Phantom Browser extension</a>
              </p>
            )}
      </header>
    </div>
  );
}