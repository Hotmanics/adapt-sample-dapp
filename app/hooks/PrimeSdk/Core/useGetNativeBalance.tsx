import { useEffect, useState } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';

export default function useGetNativeBalance(primeSdk: PrimeSdk | null) {
    const [value, setValue] = useState("");

    async function get() {
        if (!primeSdk)
            return;

        let balance = await primeSdk.getNativeBalance();
        setValue(balance);
    }

    useEffect(() => {
        get();
    }, [primeSdk])

    return { value, get };
}