import { Web3Auth } from "@web3auth/modal";
import { PrimeSdk, Web3WalletProvider } from "@etherspot/prime-sdk";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";

import { ethers } from "ethers";
import { sleep } from "../utils/Sleep";
import { AbstractProvider } from "ethers";

export const login = async (web3auth: Web3Auth, chainId: number) => {
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

const api_key = 'arka_public_key';//etherspotApiKey;

export const whitelistAddress = async (walletAddress: string, chainId: number) => {

    const addresses = [walletAddress];
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
    return returnedValue;
}

export const checkIfWhitelisted = async (accountAddress: string, chainId: number) => {
    const sponsorAddress = ('0x8350355c08aDAC387b443782124A30A8942BeC2e');
    // const accountAddress = ('0xE008De2fc3D19B51dC6Ff5379Af9b970fB21E43D');

    console.log(accountAddress);
    const returnedValue = await fetch('https://arka.etherspot.io/checkWhitelist', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "params": [sponsorAddress, accountAddress, chainId, api_key] })
    })
        .then((res) => {
            return res.json()
        }).catch((err) => {
            console.log(err);
            // throw new Error(JSON.stringify(err.response))
        });
    console.log('Value returned: ', returnedValue);
    return returnedValue;
}

export const sendEther = async (primeSdk: PrimeSdk, amount: string) => {
    // clear the transaction batch
    await primeSdk.clearUserOpsFromBatch();

    // add transactions to the batch
    const transactionBatch = await primeSdk.addUserOpsToBatch({ to: "0xc4f6578c24c599F195c0758aD3D4861758d703A3", value: ethers.parseEther(amount) });
    console.log('transactions: ', transactionBatch);

    // get balance of the account address
    const balance = await primeSdk.getNativeBalance();

    console.log('balances: ', balance);

    //testnet: api_key: 'arka_public_key'
    //mainnet: apli_key: myApiKey
    const op = await primeSdk.estimate({ url: 'https://arka.etherspot.io/', api_key: 'arka_public_key', context: { mode: 'sponsor' } });
    // const op = await primeSdk.estimate({ url: 'https://arka.etherspot.io/', api_key: 'arka_public_key', context: { mode: 'sponsor' } });
    console.log(`Estimate UserOp: ${await printOp(op)}`);

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

export const transferNFT = async (primeSdk: PrimeSdk, to: string, tokenId: number) => {
    const erc721Interface = new ethers.Interface([
        'function safeTransferFrom(address _from, address _to, uint256 _tokenId)'
    ])

    const tokenAddress = "";
    const address = await primeSdk.getCounterFactualAddress();
    const erc721Data = erc721Interface.encodeFunctionData('safeTransferFrom', [address, to, tokenId]);

    // clear the transaction batch
    await primeSdk.clearUserOpsFromBatch();

    // add transactions to the batch
    const userOpsBatch = await primeSdk.addUserOpsToBatch({ to: tokenAddress, data: erc721Data });
    console.log('transactions: ', userOpsBatch);

    // sign transactions added to the batch
    const op = await primeSdk.estimate();
    console.log(`Estimated UserOp: ${await printOp(op)}`);

}

export const transferErc20Tokens = async (primeSdk: PrimeSdk, tokenAddress: string, provider: AbstractProvider, to: string, amount: string) => {
    const contractInterface = new ethers.Interface([
        "function transfer(address to, uint256 value) returns(bool)",
        // "function mint()",
        // "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint256)"
    ])

    const erc20Instance = new ethers.Contract(tokenAddress, contractInterface, provider);

    const decimals = await erc20Instance.decimals();

    const transactionData = erc20Instance.interface.encodeFunctionData("transfer", [to, ethers.parseUnits(amount, decimals)])

    await primeSdk.clearUserOpsFromBatch();

    await primeSdk.addUserOpsToBatch({ to: tokenAddress, data: transactionData });

    const op = await primeSdk.estimate();
    const uoHash = await primeSdk.send(op);

    let userOpsReceipt = null;
    const timeout = Date.now() + 60000; // 1 minute timeout
    while ((userOpsReceipt == null) && (Date.now() < timeout)) {
        await sleep(2);
        userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
    }
    console.log("\x1b[33m%s\x1b[0m", `Transaction Receipt: `, userOpsReceipt);
    return userOpsReceipt;
}

export const mintErc20Tokens = async (primeSdk: PrimeSdk, tokenAddress: string) => {
    const contractInterface = new ethers.Interface([
        "function transfer(address to, uint256 value) returns(bool)",
        "function mint()",
        // "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint256)"
    ])

    const data = contractInterface.encodeFunctionData("mint");

    // clear the transaction batch
    await primeSdk.clearUserOpsFromBatch();

    // add transactions to the batch
    const userOpsBatch = await primeSdk.addUserOpsToBatch({ to: tokenAddress, data });
    console.log("transactions: ", userOpsBatch);

    // sign transactions added to the batch
    const op = await primeSdk.estimate();
    console.log(`Estimated UserOp: ${await printOp(op)}`);

    // sign the userOps and sending to the bundler...
    const uoHash = await primeSdk.send(op);
    console.log(`UserOpHash: ${uoHash}`);

    // get transaction hash...
    console.log("Waiting for transaction...");
    let userOpsReceipt = null;
    const timeout = Date.now() + 60000; // 1 minute timeout
    while ((userOpsReceipt == null) && (Date.now() < timeout)) {
        await sleep(2);
        userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
    }
    console.log("\x1b[33m%s\x1b[0m", `Transaction Receipt: `, userOpsReceipt);
    return userOpsReceipt;
}