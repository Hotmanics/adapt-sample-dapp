import { useState } from "react";
import { PrimeSdk } from "@etherspot/prime-sdk";
import { Erc20Mint as _ERC20Mint } from "../../../functions/PrimeSdk/Erc20/index";

export default function useErc20Mint() {
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);

    async function Erc20Mint(primeSdk: PrimeSdk | null, tokenAddress: string) {
        if (!primeSdk)
            return;

        setIsProcessingTransaction(true);
        await _ERC20Mint(primeSdk, tokenAddress);
        setIsProcessingTransaction(false);
    }

    return { isProcessingTransaction, setIsProcessingTransaction, Erc20Mint };
}