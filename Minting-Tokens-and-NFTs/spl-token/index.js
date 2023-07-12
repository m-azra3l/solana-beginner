import { 
    clusterApiUrl, 
    Connection, 
    Keypair, 
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
    createMint, 
    getOrCreateAssociatedTokenAccount, 
    mintTo, 
    transfer 
} from '@solana/spl-token';

(async () => {
    // Step 1: Connect to cluster and generate a new Keypair

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // const fromWallet = Keypair.generate();
    // const toWallet = Keypair.generate();

    // // To get a wallet secret key from its private key
    // console.log(fromWallet.secretKey);
    // console.log(toWallet.secretKey);

    const fromSecretKey = new Uint8Array([
        218, 224,  12, 131, 142, 125,  34,  96, 233,  45, 121,
        233, 242,  42,   0, 221,  27, 195, 204,  56,  33,   6,
        74, 153, 198, 168,  42,  42, 137, 172,  81,  32, 244,
        238, 127,  71, 251, 209, 193,  53,  42,  50, 167,  46,
        211,  25,  56, 133, 169, 166, 126, 116, 122, 131, 159,
        68, 143,  51,  60, 176, 198, 137, 150, 230
    ]);
    const toSecretKey = new Uint8Array([
        61, 120,  79, 147, 177,  78, 214, 111, 220,  30, 111,
        212,  65,  87, 226,   0,  20,   8, 219, 227, 183,  18,
        190, 157, 170, 239,  78, 169, 176, 210, 169, 112, 155,
        61, 202,  92, 197,  39,  66, 127, 118, 187, 212, 133,
        234, 117, 142,  18, 172,  76,  66,  73, 176, 233, 223,
        51,  47, 176,  83, 100,  21, 206, 236,  31
    ]);
    // console.log(Buffer.from(fromSecretKey).toString('base64'));
    // console.log(Buffer.from(toSecretKey).toString('base64'));

    const fromWallet = Keypair.fromSecretKey(fromSecretKey);
    const toWallet = Keypair.fromSecretKey(toSecretKey);

    // console.log((fromWallet.publicKey).toString('base58'));
    // console.log((toWallet.publicKey).toString('base58'));


    // Step 2: Airdrop SOL into your from wallet

    const fromAirdropSignature = await connection.requestAirdrop(
        fromWallet.publicKey, 
        LAMPORTS_PER_SOL
    );

    // Wait for airdrop confirmation
    await connection.confirmTransaction(
        fromAirdropSignature, 
        { commitment: "confirmed" }
    );


    // Step 3: Create new token mint and get the token account of the fromWallet address

    //If the token account does not exist, create it
    const mint = await createMint(
        connection, 
        fromWallet, 
        fromWallet.publicKey, 
        null, 
        9
    );
    
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );


    //Step 4: Mint a new token to the from account

    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        5000000000,
        []
    );
        
    console.log("------------------------------------");    
    console.log("------------------------------------");
    console.log('mint tx:', signature);    
    console.log("------------------------------------");
    console.log("------------------------------------");
    console.log("Mint address is", mint.toString()); 

    //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
    
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet, 
        mint, 
        toWallet.publicKey
    );
    console.log("------------------------------------");
    console.log("------------------------------------");
    console.log(`To token address/(account address) is ${toTokenAccount.address}`);

    //Step 6: Transfer the new token to the to-wallet's token account that was just created
    
    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection, 
        fromWallet, 
        fromTokenAccount.address, 
        toTokenAccount.address, 
        fromWallet.publicKey, 
        3000000000,
        []
    );
    
    console.log("------------------------------------");
    console.log("------------------------------------");
    console.log('transfer tx:', signature);

})();