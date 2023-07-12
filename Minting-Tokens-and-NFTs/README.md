# Minting tokens and NFTs on Solana

In this project, and spl token is created called "ZRA3L Token", an NFT is created called "UHM NFT". Users can only pay for minting using the ZRA3L Token

## Functions

- creates a new spl token called "ZRA3L Token"
- mints the "ZRA3L Token" to specified accounts
- creates an NFT "UHM NFT" using candy machine v2
- uses [candy machine ui](https://github.com/metaplex-foundation/candy-machine-ui) to provide a frontend where users can mint UHM NFT paying using ZRA3L Token

## Getting started

### Creating the spl token

- run `yarn install` to install the necessary dependencies
- have [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) installed
- run `node spl-token/index.js` to create an spl token, mint 5 tokens to the `fromWallet` account and transfer 2 tokens to the `toWallet` account
- edit `package.json` and delete line 6 `type: module`.
- run `node spl-token/token.js` to add metadata to the spl token, giving it a name and image.

### Creating the NFT

- the assets folder contains the assets to be used for the NFTs
- the config.json contains the setup, specifing the spl token address and account to store spl token spent by users in buying the NFT
- `solana keygen` to generate an account
- `solana airdrop 2` to fund the new account
- `solana validate` to validate data files
- `solana upload` to upload NFTs to arweave
- `solana deploy` to deploy the NFT
- `solana verify` to verify the deployed NFTs
- `yarn start` to start the app

For more information visit [Quicknode tutorial](https://www.quicknode.com/guides/solana-development/nfts/how-to-deploy-an-nft-collection-on-solana-using-sugar-candy-machine)

## Author

[Michael](https://github.com/m-azra3l)

## License

This project is licensed under the [Apache License](LICENSE).
You can make a copy of the project to use for your own purposes.
