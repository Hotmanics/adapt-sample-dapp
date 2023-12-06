import { useEffect, useState } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';

export default function getUserBalanceHook(primeSdk: PrimeSdk | null) {
    const [balance, setBalance] = useState("0");

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