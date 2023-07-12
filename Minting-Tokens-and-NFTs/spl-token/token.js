import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction
} from '@solana/web3.js';
import * as mpl from '@metaplex-foundation/mpl-token-metadata';
import * as anchor from '@project-serum/anchor';

// Flag to determine if initialization or update
const INITIALIZE = true;

// Main async function
(async () => {
    // Creating a connection to Solana devnet
    const connection = new Connection("https://api.devnet.solana.com");

    // Secret key for the account
    const fromSecretKey = new Uint8Array([
       Your secret key
    ]);

    // Creating a keypair from the secret key
    const fromWallet = Keypair.fromSecretKey(fromSecretKey);

    // Public key of the mint
    const mint = new PublicKey('GTxSKGqi3uTbon6rhzsKh3sEYtpkBbBeGmn5gndgPc2U');

    // Seeds and bump for finding program address
    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());
    const [metadataPDA, _bump] = PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID)

    // Accounts object containing necessary account information
    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: fromWallet.publicKey,
        payer: fromWallet.publicKey,
        updateAuthority: fromWallet.publicKey
    };

    // Data object for creating or updating metadata
    const dataV2 = {
        name: "ZRA3L Token",
        symbol: "ZRL",
        uri: "https://gateway.pinata.cloud/ipfs/QmUWPpPNm2NizcP7nie8ERrmJCqwpPiW2WZXv2auLbfZC8",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    };

    // Creating the instruction based on the INITIALIZE flag
    let instruction;
    if (INITIALIZE) {
        const args = {
            createMetadataAccountArgsV3: {
                data: dataV2,
                isMutable: true,
                collectionDetails: null
            }
        };
        instruction = mpl.createCreateMetadataAccountV3Instruction(accounts, args);
    } else {
        const args = {
            updateMetadataAccountArgsV2: {
                data: dataV2,
                isMutable: true,
                updateAuthority: fromWallet.publicKey,
                primarySaleHappened: true
            }
        };
        instruction = mpl.createUpdateMetadataAccountV2Instruction(accounts, args)
    }
    // Creating a new transaction
    const tx = new Transaction();

    // Adding the instruction to the transaction
    tx.add(instruction);

    // Sending and confirming the transaction
    const txid = await sendAndConfirmTransaction(connection, tx, [fromWallet]);

    // Logging the transaction ID
    console.log(txid);

})();
