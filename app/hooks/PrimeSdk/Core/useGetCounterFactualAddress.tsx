import { useEffect, useState } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';

export default function useGetCounterFactualAddress(primeSdk: PrimeSdk | null) {
    const [value, setValue] = useState("");

    async function get() {
        if (!primeSdk)
            return;

        const value = await primeSdk.getCounterFactualAddress();
        setValue(value);
    }

    useEffect(() => {
        get();
    }, [primeSdk])

    return { value, get };
}