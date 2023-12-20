import { PrimeSdk } from "@etherspot/prime-sdk";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import { sleep } from "../../../utils/Sleep";

export const sendEther = async (primeSdk: PrimeSdk, to: string, value: bigint) => {
    // clear the transaction batch
    await primeSdk.clearUserOpsFromBatch();

    // add transactions to the batch
    const transactionBatch = await primeSdk.addUserOpsToBatch({ to, value });
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