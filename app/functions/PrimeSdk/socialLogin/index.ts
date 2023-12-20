import { Web3Auth } from "@web3auth/modal";
import { PrimeSdk, Web3WalletProvider } from "@etherspot/prime-sdk";

export const login = async (web3auth: Web3Auth, chainId: number) => {
    if (!web3auth) {
        console.log("web3auth not initialized yet");
        return;
    }

    await web3auth.connect();

    const mappedProvider = new Web3WalletProvider(web3auth.provider!);
    await mappedProvider.refresh();

    //@ts-ignore
    const primeSdk = new PrimeSdk(mappedProvider, {
        chainId
    });

    return primeSdk;
};

export const logout = async (web3auth: Web3Auth | null) => {
    if (!web3auth) {
        console.log("web3auth not initialized yet");
        return;
    }

    await web3auth.logout({ cleanup: true });
};