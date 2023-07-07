// import functionalities
import './App.css';
import {
  sendAndConfirmTransaction,
  SystemProgram,
  Keypair,
  PublicKey,
  Transaction,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import { useEffect, useState } from "react";

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


  // create a state variable to store the balance of wallet
  const [walletBalance, setWalletBalance] = useState<any | undefined>(
    undefined
  );

  // create state variable to track the status of airdrop
  const [airdropped, setAirdropped] = useState<boolean>(
    false
  );

  // create state variable to track the status of airdrop
  const [transferStatus, setTranferStatus] = useState<boolean>(
    false
  );

  // create a state variable to store the created wallet
  const [userWallet, setUserWallet] = useState<any | undefined>(undefined);

  // create a state variable to store the created wallet
  const [userPrivateKey, setUserPrivateKey] = useState<any | undefined>(undefined);

  // create a state variable to store balance of created wallet
  const [userWalletBalance, setUserWalletBalance] = useState<any | undefined>(undefined);

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

        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // get wallet balance
        const walletBalance = await connection.getBalance(
          new PublicKey(response.publicKey.toString())
        );
        
        // set wallet balance
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

  const createWallet = () => {
    // @ts-ignore
    const { solana } = window;
    if (solana) {
      try {
        // Create connection to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const newPair = new Keypair();
        const publicKey = new PublicKey(newPair.publicKey).toString();
        const privateKey = newPair.secretKey;

        setUserWallet(publicKey);
        setUserPrivateKey(privateKey);
      } catch (err) {

      }
    }
  };

  const airdropSol = async () => {
    // @ts-ignore
    const { solana } = window;
    if (solana) {
      try {
        // Connect to the Devnet and make a wallet from privateKey
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const myWallet = await Keypair.fromSecretKey(userPrivateKey);

        // Request airdrop of 2 SOL to the wallet
        console.log("Airdropping some SOL to my wallet!");
        const fromAirDropSignature = await connection.requestAirdrop(
          new PublicKey(userWallet),
          2 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(fromAirDropSignature);
        setAirdropped(true);
        userWalletBalance2();
      } catch (err) {

      }
    }
  };

  const userWalletBalance2 = async () => {
    //@ts-ignore
    const { solana } = window;
    if (solana) {

      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      // get wallet balance
      const walletBalance = await connection.getBalance(
        new PublicKey(userWallet)
      );
      setUserWalletBalance(walletBalance)
    }
  };

  // transfer Sol
  const transferSol = async () => {
    if (walletKey) {
      // Connect to the Devnet and make a wallet from privateKey
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const from = Keypair.fromSecretKey(userPrivateKey);
      const to = new PublicKey((walletKey));

      // Send sol from "CLI" wallet and into "to" Phantom wallet
      var transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: to,
          lamports: (userWalletBalance - (1.9 * LAMPORTS_PER_SOL)),
        })
      );

      // Sign transaction
      var signature = await sendAndConfirmTransaction(connection, transaction, [
        from,
      ]);
      const senderBalanceAfter = await connection.getBalance(from.publicKey);
      setUserWalletBalance(senderBalanceAfter);
      const receiverBalanceAfter = await connection.getBalance(to);
      setWalletBalance(receiverBalanceAfter);
      setTranferStatus(true);
    }
  };

  // HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
        <div className="flexDiv">
          <div className="innerDiv">
            <h2> {!walletKey ? `Connect to Phantom Wallet` : `Connected to Phantom Wallet`}</h2>
            {provider && !walletKey && (
              <button
                className="button"
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
                  className="button"
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
          </div>
          <div className="innerDiv">
            {!userWallet && (
              <div>
                <h2>Create New Wallet</h2>
                <button
                  className="button"
                  onClick={createWallet}
                >
                  Create Wallet
                </button>
              </div>
            )}
            {userWallet && !airdropped && (
              <div>
                <h2>Airdrop Tokens To Wallet</h2>
                <p>{userWallet}</p>
                <button
                  className="button"
                  onClick={airdropSol}
                >
                  Airdrop Sol
                </button>
              </div>
            )}
            {airdropped && (
              <div>
                <h2>Airdropped!!!</h2>
                <p>Airdrop successful!!!</p>
                <p>Balance:</p>
                <p>{userWalletBalance ? `${parseInt(userWalletBalance) / LAMPORTS_PER_SOL} SOL` : `0`}</p>
              </div>
            )}
            {userWallet && airdropped && (
              <div>
                <h2>Transfer Sol</h2>
                <button
                  className="button"
                  onClick={transferSol}
                >
                  Transfer
                </button>
              </div>
            )}
            {transferStatus && (
              <div>
                <h2>Transferred!!!</h2>
                <p>Transaction successful!!!</p>
                <p>Sender Balance:</p>
                <p>{userWalletBalance ? `${parseInt(userWalletBalance) / LAMPORTS_PER_SOL} SOL` : `0`}</p>
                <p>Receiver Balance:</p>
                <p>{walletBalance ? `${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL` : `0`}</p>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}