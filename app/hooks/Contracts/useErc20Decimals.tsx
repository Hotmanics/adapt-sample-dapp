import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { AbstractProvider } from "ethers";

const contractInterface = new ethers.Interface([
    "function decimals() view returns (uint256)"
])

export default function useErc20Decimals(tokenAddress: string, provider: AbstractProvider) {
    const [value, setValue] = useState();

    async function get(tokenAddress: string, provider: AbstractProvider) {
        const contract = new ethers.Contract(tokenAddress, contractInterface, provider);
        let balance = await contract.decimals();
        setValue(balance);
    }

    useEffect(() => {
        get(tokenAddress, provider);
    }, [])

    return { value, setValue, get };
}