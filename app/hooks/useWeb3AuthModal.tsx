import { useEffect, useState } from "react";
import { PrimeSdk } from '@etherspot/prime-sdk';
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapterOptions } from "@web3auth/openlogin-adapter";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

export default function useWeb3AuthModal(modalOptions: Web3AuthOptions, adapterOptions: OpenloginAdapterOptions, modalConfig: any) {
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    const [isModalInitialized, setIsModalInitialized] = useState<boolean>(false);

    useEffect(() => {
        async function getWeb3Auth() {
            if (web3auth)
                return;

            try {
                const web3auth = new Web3Auth(modalOptions);
                const adapter = new OpenloginAdapter(adapterOptions);
                web3auth.configureAdapter(adapter);
                setWeb3auth(web3auth);

                await web3auth.initModal({
                    modalConfig
                });

                setIsModalInitialized(true);
            } catch (error) {
                console.error(error);
            }
        }

        getWeb3Auth();
    })

    return { web3auth, isModalInitialized };
}