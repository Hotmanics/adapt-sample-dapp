import { useEffect, useState } from "react";
import { CheckWhitelist as _checkWhitelist } from "@/app/functions/PrimeSdk/whitelist";

export default function useCheckWhitelist(address: string, chainIdNum: number) {
    const [isWhitelisted, setIsWhitelisted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function CheckWhitelist(address: string, chainIdNum: number) {
        if (!address)
            return;

        setIsLoading(true);
        let result = await _checkWhitelist(address, chainIdNum);
        setIsWhitelisted(result);
        setIsLoading(false);
        return result;
    }

    useEffect(() => {
        CheckWhitelist(address, chainIdNum);
    }, [address])

    return { CheckWhitelist, isWhitelisted, setIsWhitelisted, isLoading };
}