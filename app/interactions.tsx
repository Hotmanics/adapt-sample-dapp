import { Web3Auth } from "@web3auth/modal";
import { PrimeSdk, Web3WalletProvider } from "@etherspot/prime-sdk";
import { ethers } from "ethers";
import { sleep } from "./utils/Sleep";

export const login = async (web3auth: Web3Auth | null, chainId: number) => {
    if (!web3auth) {
        console.log("web3auth not initialized yet");
        return;
    }

    await web3auth.connect();

    const mappedProvider = new Web3WalletProvider(web3auth.provider!);
    await mappedProvider.refresh();

    //@ts-ignore
    const primeSdk = new PrimeSdk(mappedProvider, {
        chainId
    });

    return primeSdk;
};

export const logout = async (web3auth: Web3Auth | null) => {
    if (!web3auth) {
        console.log("web3auth not initialized yet");
        return;
    }

    await web3auth.logout({ cleanup: true });
};

export const whitelistAddress = async (walletAddress: string, chainId: number) => {

    const addresses = [walletAddress];
    const api_key = 'arka_public_key';//etherspotApiKey;
    const returnedValue = await fetch('https://arka.etherspot.io/whitelist', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "params": [addresses, chainId, api_key] })
    })
        .then((res) => {
            return res.json()
        }).catch((err) => {
            console.log(err);
            // throw new Error(JSON.stringify(err.response))
        });
    console.log('Value returned: ', returnedValue);
}

export const sponsorTransaction = async (primeSdk: PrimeSdk) => {
    if (!primeSdk) {
        return;
    }

    // clear the transaction batch
    await primeSdk.clearUserOpsFromBatch();

    // add transactions to the batch
    const transactionBatch = await primeSdk.addUserOpsToBatch({ to: "0xc4f6578c24c599F195c0758aD3D4861758d703A3", value: ethers.parseEther("0.1") });
    console.log('transactions: ', transactionBatch);

    // get balance of the account address
    const balance = await primeSdk.getNativeBalance();

    console.log('balances: ', balance);

    //testnet: api_key: 'arka_public_key'
    //mainnet: apli_key: myApiKey
    const op = await primeSdk.estimate({ url: 'https://arka.etherspot.io/', api_key: 'arka_public_key', context: { mode: 'sponsor' } });
    // const op = await primeSdk.estimate({ url: 'https://arka.etherspot.io/', api_key: 'arka_public_key', context: { mode: 'sponsor' } });
    console.log(op);

    // sign the UserOp and sending to the bundler...
    const uoHash = await primeSdk.send(op);
    console.log(`UserOpHash: ${uoHash}`);

    // get transaction hash...
    console.log('Waiting for transaction...');
    let userOpsReceipt = null;
    const timeout = Date.now() + 60000; // 1 minute timeout
    while ((userOpsReceipt == null) && (Date.now() < timeout)) {
        await sleep(2);
        userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
    }
    console.log('\x1b[33m%s\x1b[0m', `Transaction Receipt: `, userOpsReceipt);
}