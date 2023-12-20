import { useState } from "react";
import { Whitelist as _whitelist } from "@/app/functions/PrimeSdk/whitelist";

export default function useWhitelist() {
    const [isLoading, setIsLoading] = useState(false);

    async function Whitelist(address: string, chainIdNum: number) {
        setIsLoading(true);
        const result = await _whitelist(address, chainIdNum);
        setIsLoading(false);
        return result;
    }

    return { Whitelist, isLoading };
}