import {
    CHAIN_NAMESPACES,
} from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";

const web3AuthClientId = "BG9Zggel1Ifdma4ISxyqfdRbQr07VlIXsJwv2WSWjw_eK6cMeNTt96XqUIT3Kjc0d3SIMS_rKdVRt8pwkC_FHm4"; //process.env.REACT_APP_WEB3AUTH_CLIENT_ID as string; // get from https://dashboard.web3auth.io
const chainIdHex = "0x13881";

export const modalOptions: Web3AuthOptions = {
    clientId: web3AuthClientId,
    web3AuthNetwork: "sapphire_devnet", // mainnet, aqua,  cyan or testnet
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: chainIdHex,
        rpcTarget: "https://rpc.ankr.com/polygon_mumbai", // This is the public RPC we have added, please pass on your own endpoint while creating an app
    },
};