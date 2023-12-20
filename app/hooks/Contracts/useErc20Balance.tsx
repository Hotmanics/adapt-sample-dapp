import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { AbstractProvider } from "ethers";

const contractInterface = new ethers.Interface([
    "function balanceOf(address owner) view returns (uint256)",
])

export default function useErc20Balance(address: string, tokenAddress: string, provider: AbstractProvider) {
    const [value, setValue] = useState("0");

    async function get(address: string, tokenAddress: string, provider: AbstractProvider) {
        if (!address)
            return;

        const contract = new ethers.Contract(tokenAddress, contractInterface, provider);
        let balance = await contract.balanceOf(address);
        setValue(balance);
    }

    useEffect(() => {
        get(address, tokenAddress, provider);
    }, [address])

    return { value, setValue, get };
}