import { useState } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';
import { sendEther as send } from "../../../functions/PrimeSdk/Core/index";

export default function useSendEther(primeSdk: PrimeSdk | null) {
    const [isProcessing, setIsProcessing] = useState(false);

    async function sendEther(to: string, amount: bigint) {
        if (!primeSdk)
            return;

        setIsProcessing(true);
        await send(primeSdk, to, amount);
        setIsProcessing(false);
    }

    return { isProcessing, sendEther };
}