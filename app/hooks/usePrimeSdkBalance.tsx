import { useEffect, useState } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';

export default function usePrimeSdkBalance(primeSdk: PrimeSdk | null) {
    const [balance, setBalance] = useState("");

    useEffect(() => {
        async function getBalance() {
            if (!primeSdk)
                return;

            let balance = await primeSdk.getNativeBalance();
            setBalance(balance);
        }

        getBalance();
    })

    return balance;
}