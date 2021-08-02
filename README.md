# wiki.token

WikiToken is an ERC721 Ethereum Token (NFT) focused on giving back to Wikimedia.

NOTE: WikiToken is in no way affiliated with Wikimedia. We hope that one day we can transfer this project entirely to their team, but at the present moment they are not interested. We have created this project to give back to them – not to imitate who they are and what they do.

## Local environment setup

1.  Clone the respository:
    ```
    git clone https://github.com/odd-amphora/wiki.token.git
    cd wiki.token
    ```
1.  Create `.env` files in `packages/backend`, `./packages/frontend` and `./packages/hardhat` which mirror the `.sample.env` files in the same directories.

1.  Install dependencies:

    ```
    yarn install
    ```

1.  Start a local chain and deploy the contract(s):

    ```
    yarn chain && yarn deploy-local
    ```

1.  Start the API server:

    ```
    yarn backend:dev
    ```

1.  Start the frontend:
    ```
    yarn frontend:start
    ```

## Deploy

### Networks

#### Local

- `yarn deploy-local` -> deploys to local chain

#### Testnet

- Kovan `yarn deploy-kovan`
- [Rinkeby](https://rinkeby.wikitoken.org) `yarn deploy-rinkeby` (primary testnet)

#### Mainnet

- `yarn deploy-mainnet` (not yet deployed)

NOTE: Once contracts are deployed, new artifacts will be generated for the frontend. These should be commited and pushed to the `main` branch so that the changes are reflected in the live site(s).

### Verification

TODO(odd-amphora)
