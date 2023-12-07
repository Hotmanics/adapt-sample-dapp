'use client';

import { SyntheticEvent, useState, useEffect } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';
import { modalConfig } from "./options/modalConfig";
import { modalOptions } from "./options/modalOptionsConfig";
import { adapterOptions } from "./options/adapterOptions";
import { login, logout, sponsorTransaction, whitelistAddress } from "./interactions";

import usePrimeSdkBalance from "./hooks/usePrimeSdkBalance";
import usePrimeSdkWalletAddress from "./hooks/usePrimeSdkWalletAddress";
import useWeb3AuthModal from "./hooks/useWeb3AuthModal";
const chainIdNum = 80001;

export default function Home() {
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk>();

  const { web3auth, isModalInitialized } = useWeb3AuthModal(modalOptions, adapterOptions, modalConfig);

  const { walletAddress, getWallet } = usePrimeSdkWalletAddress(primeSdk!);
  const { nativeBalance, getBalance } = usePrimeSdkBalance(primeSdk!);

  async function handleSubmit(event: any) {
    if (!primeSdk)
      return;

    event.preventDefault();
    const target = event.target;

    await sponsorTransaction(primeSdk, target.myInput.value); //sends ether
    await getBalance();
  }

  let mainOutput;
  if (isModalInitialized) {
    if (primeSdk) {
      mainOutput =
        <div>
          <button onClick={() => { window.location.reload() }}>Refresh</button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={async () => { logout(web3auth) }}>Logout</button>
          {
            nativeBalance === ""
              ?
              <p className="my-5">Loading Acccount Information...</p>
              :
              <div>
                <p className="my-5">{walletAddress}</p>
                <p className="my-5">Balance: {nativeBalance}</p>
              </div>
          }

          <br />
          <br />
          <br />

          <p>User wallet needs to be whitelisted before sponsored transactions can happen. I'm thinking that you can whitelist when user creates account or when they KYC. *Whitelisting does not cost any gas, it is an offchain call to an etherspot API.</p>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded" onClick={async () => { whitelistAddress(walletAddress, chainIdNum) }}>Whitelist</button>

          <br />
          <br />
          <br />
          <form method="post" onSubmit={handleSubmit}>
            <p>Send ether through a sponsored transaction</p>
            <input name="myInput" defaultValue="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded">Submit</button>
          </form>
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
