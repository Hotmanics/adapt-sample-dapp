import { useState } from "react";
import { PrimeSdk } from "@etherspot/prime-sdk";
import { AbstractProvider } from "ethers";
import { Erc20Transfer as _Erc20Transfer } from "../../../functions/PrimeSdk/Erc20/index";

export default function useErc20Transfer() {
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);

    async function Erc20Transfer(primeSdk: PrimeSdk, tokenAddress: string, provider: AbstractProvider, to: string, amount: bigint) {
        if (!primeSdk)
            return;

        setIsProcessingTransaction(true);
        await _Erc20Transfer(primeSdk, tokenAddress, provider, to, amount);
        setIsProcessingTransaction(false);
    }

    return { isProcessingTransaction, Erc20Transfer };
}