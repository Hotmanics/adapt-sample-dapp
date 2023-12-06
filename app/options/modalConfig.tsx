import {
    WALLET_ADAPTERS,
} from "@web3auth/base";

export const modalConfig = {
    // Disable Wallet Connect V2
    [WALLET_ADAPTERS.WALLET_CONNECT_V2]: {
        label: "wallet_connect",
        showOnModal: false,
    },
    // Disable Metamask
    [WALLET_ADAPTERS.METAMASK]: {
        label: "metamask",
        showOnModal: false,
    },
    [WALLET_ADAPTERS.TORUS_EVM]: {
        label: "torus",
        showOnModal: false,
    },
    [WALLET_ADAPTERS.OPENLOGIN]: {
        label: "openlogin",
        loginMethods: {
            facebook: {
                name: "facebook",
                showOnModal: false,
            },
            reddit: {
                name: "reddit",
                showOnModal: false,
            },
            discord: {
                name: "discord",
                showOnModal: false,
            },
            twitch: {
                name: "twitch",
                showOnModal: false,
            },
            apple: {
                name: "apple",
                showOnModal: false,
            },
            kakao: {
                name: "kakao",
                showOnModal: false,
            },
            line: {
                name: "line",
                showOnModal: false,
            },
            github: {
                name: "github",
                showOnModal: false,
            },
            twitter: {
                name: "twitter",
                showOnModal: false,
            },
            linkedin: {
                name: "linkedin",
                showOnModal: false,
            },
            weibo: {
                name: "weibo",
                showOnModal: false,
            },
            wechat: {
                name: "wechat",
                showOnModal: false
            },
            // Disable email_passwordless and sms_passwordless
            email_passwordless: {
                name: "email_passwordless",
                showOnModal: false,
            },
            sms_passwordless: {
                name: "sms_passwordless",
                showOnModal: false,
            },
        },
    },
};