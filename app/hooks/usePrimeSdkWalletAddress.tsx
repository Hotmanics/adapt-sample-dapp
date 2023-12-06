import { useEffect, useState } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';

export default function usePrimeSdkWalletAddress(primeSdk: PrimeSdk | null) {
    const [walletAddress, setWalletAddress] = useState("");

    useEffect(() => {
        async function getWallet() {
            if (!primeSdk)
                return;

            const address = await primeSdk.getCounterFactualAddress();
            if (!address) {
                console.log("FAILURE TO GET ADDRESS");
                return;
            }

            setWalletAddress(address);
        }

        getWallet();
    })

    return walletAddress;
}