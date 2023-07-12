import mpl from '@metaplex-foundation/mpl-token-metadata'
import anchor from '@project-serum/anchor'
import { sendAndConfirmTransaction, Transaction, Connection, Keypair, PublicKey } from '@solana/web3.js'

const INITIALIZE = true;

async function main() {
    const secretkey = new Uint8Array(
        ["USE YOUR WALLET SECRET Uint8Array KEY"]
    );

    const fromWallet = Keypair.fromSecretKey(secretkey);
    const mint = new PublicKey("7fuNWT2btps1GEvBHkDwuctN2JuhH4KWs19YUnGzn2ep");
    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());
    const [metadataPDA, _bump] = PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);
    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: fromWallet.publicKey,
        payer: fromWallet.publicKey,
        updateAuthority: fromWallet.publicKey
    };
    const dataV2 = {
        name: "Bazu Token",
        symbol: "BAZ",
        uri: "https://gateway.pinata.cloud/ipfs/QmWNyGKLfQtNP9cLtkM6Ygoz2Eoi7tHG4nJQN1tAefSSHb",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    };
    let ix;
    if (INITIALIZE) {
        const args = {
            createMetadataAccountArgsV3: {
                data: dataV2,
                isMutable: true,
                collectionDetails: null
            }
        };
        ix = mpl.createCreateMetadataAccountV3Instruction(accounts, args);
    } else {
        const args = {
            updateMetadataAccountArgsV2: {
                data: dataV2,
                isMutable: true,
                updateAuthority: fromWallet.publicKey,
                primarySaleHappened: true
            }
        };
        ix = mpl.createUpdateMetadataAccountV2Instruction(accounts, args);
    }
    const tx = new Transaction();
    tx.add(ix);
    const connection = new Connection("https://api.devnet.solana.com");
    const txid = await sendAndConfirmTransaction(connection, tx, [fromWallet]);
    console.log(txid);
}

main();
