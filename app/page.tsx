"use client";

import { useState } from "react";
import { ethers, getDefaultProvider } from "ethers";

import useWeb3AuthModal from "./hooks/Web3Auth/useWeb3AuthModal";
import { modalConfig } from "./options/modalConfig";
import { modalOptions } from "./options/modalOptionsConfig";
import { adapterOptions } from "./options/adapterOptions";

import { PrimeSdk } from "@etherspot/prime-sdk";
import { login, logout } from "./functions/PrimeSdk/socialLogin/index";
import useGetCounterFactualAddress from "./hooks/PrimeSdk/Core/useGetCounterFactualAddress";
import useGetNativeBalance from "./hooks/PrimeSdk/Core/useGetNativeBalance";
import useSendEther from "./hooks/PrimeSdk/Core/useSendEther";
import useCheckWhitelist from "./hooks/PrimeSdk/Whitelist/useCheckWhitelist";
import useWhitelist from "./hooks/PrimeSdk/Whitelist/useWhitelist";

import useErc20Balance from "./hooks/Contracts/useErc20Balance";
import useErc20Mint from "./hooks/PrimeSdk/Erc20/useErc20Mint";
import useErc20Transfer from "./hooks/PrimeSdk/Erc20/useErc20Transfer";
import useErc20Decimals from "./hooks/Contracts/useErc20Decimals";

/**
 * KNOWN ISSUES:
 * Logout functionality does not work as expected
 * Whitelist functionality does not work as expected
 */

const chainIdNum = 80001;

const tokenAddress = "0xeF4D2a75282Cb50d61eFeC436A4501d65f1Bc04D";
const provider = getDefaultProvider("https://polygon-mumbai.g.alchemy.com/v2/BDv_ycNVdHAaPjOBZmouAKodOH71e589");

export default function Home() {
  //Web3Auth
  const { web3auth, isModalInitialized } = useWeb3AuthModal(modalOptions, adapterOptions, modalConfig);

  //PrimeSdk
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk>();
  const { value: walletAddress } = useGetCounterFactualAddress(primeSdk!);
  const { value: nativeBalance, get: getNativeBalance } = useGetNativeBalance(primeSdk!);
  const { isProcessing: isSendingEther, sendEther } = useSendEther(primeSdk!);

  //    Whitelsit
  const { isWhitelisted, setIsWhitelisted, isLoading: isLoadingIsWhitelisted } = useCheckWhitelist(walletAddress, chainIdNum);
  const { Whitelist, isLoading: isWhitelistingAddress } = useWhitelist();

  //    Erc20 Interactions
  const { isProcessingTransaction: isMinting, Erc20Mint } = useErc20Mint();
  const { isProcessingTransaction: isTransferring, Erc20Transfer } = useErc20Transfer();

  //Erc20 Interactions
  const { value: balance, get: getErc20Balance } = useErc20Balance(walletAddress, tokenAddress, provider);
  const { value: decimals } = useErc20Decimals(tokenAddress, provider);

  async function handleLogin() {
    setPrimeSdk(await login(web3auth!, chainIdNum));
  }

  async function handleSendEther(event: any) {
    event.preventDefault();
    const target = event.target;

    await sendEther(target.etherRecipientInput.value, ethers.parseEther(target.etherValueInput.value));
    await getNativeBalance();
  }

  async function handleSetWhitelist() {
    const result = await Whitelist(walletAddress, chainIdNum);
    console.log(result);

    if (result.error === `Error: ${walletAddress} already whitelisted` || result.message.contains("Successfully whitelisted with transaction Hash")) {
      setIsWhitelisted(true);
    }
  }

  async function handleTransferERC20Token(event: any) {
    event.preventDefault();
    const target = event.target;

    await Erc20Transfer(primeSdk!, tokenAddress, provider, target.tokenRecipientInput.value, ethers.parseUnits(target.tokenValueInput.value, decimals));
    await getErc20Balance(walletAddress, tokenAddress, provider);
  }

  async function handleMintErc20Token() {
    await Erc20Mint(primeSdk!, tokenAddress);
    await getErc20Balance(walletAddress, tokenAddress, provider);
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
                <p className="my-5">Network: {chainIdNum === 80001 ? "Polygon (Testnet)" : "Unknown"}</p>
                <p className="my-5">{walletAddress}</p>
                <p className="my-5">Balance: {nativeBalance}</p>

                {
                  isWhitelisted ? <p className="my-5 text-[#00FF00]">Whitelisted</p>
                    :
                    <p className="my-5 text-[#FF0000]">Not Whitelisted / Unchecked</p>
                }

              </div>
          }

          <p className="my-5 text-4xl">Whitelist</p>
          <p>User wallet needs to be whitelisted before sponsored transactions can happen. Im thinking that you can whitelist when user creates account or when they KYC. *Whitelisting does not cost any gas, it is an offchain call to an etherspot API.</p>
          {
            isLoadingIsWhitelisted || isWhitelistingAddress ? <p className="my-5">Checking whitelist...</p> :
              <div>
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded" onClick={handleSetWhitelist}>Whitelist / Check Whitelist</button>
              </div>
          }

          <p className="my-5 text-4xl">Send Ether</p>
          {
            isSendingEther ? <p> Sending...</p> :
              <div>
                <form method="post" onSubmit={handleSendEther}>
                  <p className="my-5 text-2xl">Send Amount of ether to Recipient</p>
                  <p>Amount</p>
                  <input name="etherValueInput" defaultValue="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  <p>Recipient</p>
                  <input name="etherRecipientInput" defaultValue="0x" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded">Submit</button>
                </form>
              </div>
          }

          <p className="my-5 text-4xl">ERC20 Interactions</p>
          <p className="my-5">{"Token Address: " + tokenAddress}</p>
          <p className="my-5">{"Your Balance: " + ethers.formatEther(balance)}</p>


          {
            isMinting ? <p className="my-5">Minting...</p> : <div><button onClick={handleMintErc20Token} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded">Mint Tokens to your wallet</button>
            </div>
          }
          <p className="my-5">{"--------"}</p>

          {
            isTransferring ? <p>Transferring...</p>
              :
              <div>
                <form method="post" onSubmit={handleTransferERC20Token}>
                  <p className="text-2xl">Send tokens</p>
                  <p>Amount</p>
                  <input name="tokenValueInput" defaultValue="50" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  <p>Recipient</p>
                  <input name="tokenRecipientInput" defaultValue="0x" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 my-2 mx-1 rounded">Submit</button>
                </form>
              </div>
          }

        </div>
    } else {
      mainOutput = <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleLogin}>Login</button>
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
