import { PrimeSdk } from "@etherspot/prime-sdk";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import { ethers } from "ethers";
import { sleep } from "../../../utils/Sleep";
import { AbstractProvider } from "ethers";

export const Erc20Transfer = async (primeSdk: PrimeSdk, tokenAddress: string, provider: AbstractProvider, to: string, amount: bigint) => {
    const contractInterface = new ethers.Interface([
        "function transfer(address to, uint256 value) returns(bool)",
    ])

    const erc20Instance = new ethers.Contract(tokenAddress, contractInterface, provider);
    const data = erc20Instance.interface.encodeFunctionData("transfer", [to, amount])

    await primeSdk.clearUserOpsFromBatch();
    await primeSdk.addUserOpsToBatch({ to: tokenAddress, data });

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

export const Erc20Mint = async (primeSdk: PrimeSdk, tokenAddress: string) => {
    const contractInterface = new ethers.Interface([
        "function mint()",
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