'use client';

import { SyntheticEvent, useState, useEffect } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';
import { modalConfig } from "./options/modalConfig";
import { modalOptions } from "./options/modalOptionsConfig";
import { adapterOptions } from "./options/adapterOptions";
import { login, logout, sponsorTransaction, whitelistAddress } from "./interactions";
import { ethers, getDefaultProvider } from "ethers";

import usePrimeSdkBalance from "./hooks/usePrimeSdkBalance";
import usePrimeSdkWalletAddress from "./hooks/usePrimeSdkWalletAddress";
import useWeb3AuthModal from "./hooks/useWeb3AuthModal";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import { sleep } from "./utils/Sleep";
import { Web3WalletProvider } from "@etherspot/prime-sdk";

const chainIdNum = 80001;

const tokenAddress = "0xeF4D2a75282Cb50d61eFeC436A4501d65f1Bc04D";
const erc721Interface = new ethers.Interface([
  'function transfer(address to, uint256 value) returns(bool)',
  'function mint()',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint256)'
])

export default function Home() {
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk>();

  const { web3auth, isModalInitialized } = useWeb3AuthModal(modalOptions, adapterOptions, modalConfig);

  const { walletAddress, getWallet } = usePrimeSdkWalletAddress(primeSdk!);
  const { nativeBalance, getBalance } = usePrimeSdkBalance(primeSdk!);

  const [balance, setBalance] = useState("0");
  const [isMinting, setIsMinting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  async function test() {
    if (!primeSdk)
      return;

    const provider = getDefaultProvider("https://polygon-mumbai.g.alchemy.com/v2/BDv_ycNVdHAaPjOBZmouAKodOH71e589");
    const contract = new ethers.Contract(tokenAddress, erc721Interface, provider);
    const address = await primeSdk?.getCounterFactualAddress();
    let balance = await contract.balanceOf(address);

    console.log(address);
    console.log(balance);
    let bal = ethers.formatEther(balance);

    setBalance(bal);
  }

  useEffect(() => {
    test();
  }, [primeSdk])

  async function handleSubmit(event: any) {
    if (!primeSdk)
      return;

    event.preventDefault();
    const target = event.target;

    await sponsorTransaction(primeSdk, target.myInput.value); //sends ether
    await getBalance();
  }

  async function handleSendERC20Token(event: any) {
    if (!primeSdk)
      return;


    event.preventDefault();
    const target = event.target;


    setIsTransferring(true);
    const provider = getDefaultProvider("https://polygon-mumbai.g.alchemy.com/v2/BDv_ycNVdHAaPjOBZmouAKodOH71e589");

    const erc20Instance = new ethers.Contract(tokenAddress, erc721Interface, provider);

    const decimals = await erc20Instance.decimals();

    const transactionData = erc20Instance.interface.encodeFunctionData('transfer', [target.myInput2.value, ethers.parseUnits("250", decimals)])

    // clear the transaction batch
    await primeSdk.clearUserOpsFromBatch();

    // add transactions to the batch
    const userOpsBatch = await primeSdk.addUserOpsToBatch({ to: tokenAddress, data: transactionData });
    console.log('transactions: ', userOpsBatch);

    // sign transactions added to the batch
    const op = await primeSdk.estimate();
    console.log(`Estimated UserOp: ${await printOp(op)}`);

    // sign the userOps and sending to the bundler...
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
    await test();
    setIsTransferring(false);
  }


  let mainOutput;
  if (isModalInitialized) {
    if (primeSdk) {
      mainOutput =
        <div>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={async () => { logout(web3auth) }}>Logout</button>
          {
            nativeBalance === ""
              ?
              <p className="my-5">Loading Acccount Information...</p>
              :

              <div>
                <p className="my-5 text-4xl">Account Information</p>

                {/* <p className="my-5">{"-----------------------------------"}</p> */}

                <p className="my-5">Network: {chainIdNum === 80001 ? "Polygon (Testnet)" : "Unknown"}</p>
                <p className="my-5">{walletAddress}</p>
                <p className="my-5">Balance: {nativeBalance}</p>
              </div>
          }


          {/* <p className="my-5">{"-----------------------------------"}</p> */}

          <p className="my-5 text-4xl">Whitelist</p>

          <p>User wallet needs to be whitelisted before sponsored transactions can happen. I'm thinking that you can whitelist when user creates account or when they KYC. *Whitelisting does not cost any gas, it is an offchain call to an etherspot API.</p>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded" onClick={async () => { whitelistAddress(walletAddress, chainIdNum) }}>Whitelist</button>
          {/* <p className="my-5">{"-----------------------------------"}</p> */}

          <p className="my-5 text-4xl">Send Ether</p>

          <form method="post" onSubmit={handleSubmit}>
            <p>Send ether through a sponsored transaction</p>
            <input name="myInput" defaultValue="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded">Submit</button>
          </form>


          {/* <p className="my-5">{"-----------------------------------"}</p> */}
          <p className="my-5 text-4xl">ERC20 Interactions</p>
          <p className="my-5">{"Token Address: " + tokenAddress}</p>
          <p className="my-5">{"Your Balance: " + balance}</p>

          <p className="my-5">{"--------"}</p>

          <button onClick={async () => {

            setIsMinting(true);
            const erc721Data = erc721Interface.encodeFunctionData('mint');

            // clear the transaction batch
            await primeSdk.clearUserOpsFromBatch();

            // add transactions to the batch
            const userOpsBatch = await primeSdk.addUserOpsToBatch({ to: tokenAddress, data: erc721Data });
            console.log('transactions: ', userOpsBatch);

            // sign transactions added to the batch
            const op = await primeSdk.estimate();
            console.log(`Estimated UserOp: ${await printOp(op)}`);

            // sign the userOps and sending to the bundler...
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
            await test();
            setIsMinting(false);

          }} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded">Mint Tokens to your wallet</button>

          {
            isMinting ? <p className="my-5">Minting...</p> : <div></div>
          }
          <p className="my-5">{"--------"}</p>

          <form method="post" onSubmit={handleSendERC20Token}>
            <p>Send 250 tokens to an address</p>
            <input name="myInput2" defaultValue="0x" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded">Submit</button>
          </form>

          <p className="my-5">{"-----------------------------------"}</p>


        </div>
    } else {
      mainOutput = <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={async () => { setPrimeSdk(await login(web3auth!, chainIdNum)); }}>Login</button>
    }
  }
  else {
    mainOutput =
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex p-4">
        Initializing App...
      </div>
  }

  return (
    <main className="min-h-screen flex-col items-center justify-between p-24">
      {mainOutput}
    </main>
  )
}
