import { OpenloginAdapterOptions } from "@web3auth/openlogin-adapter";

const googleClientId = "269932770027-iiq8o6plf4a2agdp0lt4ad5spa4qma6p.apps.googleusercontent.com";

export const adapterOptions: OpenloginAdapterOptions = {
    loginSettings: {
        mfaLevel: "none", // Pass on the mfa level of your choice: default, optional, mandatory, none
    },
    adapterSettings: {
        loginConfig: {
            // Add login configs corresponding to the provider
            // Google login
            google: {
                name: "Google Login", // The desired name you want to show on the login button
                verifier: "TestVerifier", // Please create a verifier on the developer dashboard and pass the name here
                typeOfLogin: "google", // Pass on the login provider of the verifier you've created
                clientId: googleClientId //process.env.REACT_APP_GOOGLE as string, // use your app client id you got from google
            },
            // Add other login providers here
        },
    }
}