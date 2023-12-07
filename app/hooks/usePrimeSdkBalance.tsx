import { useEffect, useState } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';



export default function usePrimeSdkBalance(primeSdk: PrimeSdk | null) {
    const [nativeBalance, setBalance] = useState("");

    async function getBalance() {
        if (!primeSdk)
            return;

        let balance = await primeSdk.getNativeBalance();
        setBalance(balance);
    }

    useEffect(() => {
        getBalance();
    }, [primeSdk])

    return { nativeBalance, getBalance };
}