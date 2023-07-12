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

    // Uncomment to use secret key
    const fromSecretKey = new Uint8Array([
        Your secret key
    ]);
    const toSecretKey = new Uint8Array([
        Your secret key
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
