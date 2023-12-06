'use client';

import { useState } from "react";
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
  const walletAddress = usePrimeSdkWalletAddress(primeSdk!);
  const nativeBalance = usePrimeSdkBalance(primeSdk!);

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
                <p className="my-5">{walletAddress}</p>
                <p className="my-5">Balance: {nativeBalance}</p>
              </div>
          }

          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded" onClick={async () => { whitelistAddress(walletAddress, chainIdNum) }}>Whitelist</button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded" onClick={async () => { sponsorTransaction(primeSdk) }}>Sponsor</button>
        </div>
    } else {
      mainOutput = <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={async () => { setPrimeSdk(await login(web3auth, chainIdNum)); }}>Login</button>
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
