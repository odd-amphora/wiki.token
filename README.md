# wiki.token

## Environment setup

1.  Clone the respository:
    ```
    git clone https://github.com/odd-amphora/wiki.token.git
    cd wiki.token
    ```
1.  Create `.env` files in `./packes/frontend` and `./packages/hardhat` which mirror the `.sample.env` files in the same directories.

TODO

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
