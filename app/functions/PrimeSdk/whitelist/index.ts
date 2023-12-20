const api_key = 'arka_public_key';//etherspotApiKey;

export const Whitelist = async (walletAddress: string, chainId: number) => {

    const addresses = [walletAddress];
    const returnedValue = await fetch('https://arka.etherspot.io/whitelist', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "params": [addresses, chainId, api_key] })
    })
        .then((res) => {
            return res.json()
        }).catch((err) => {
            console.log(err);
            // throw new Error(JSON.stringify(err.response))
        });
    return returnedValue;
}

export const CheckWhitelist = async (accountAddress: string, chainId: number) => {
    const sponsorAddress = ('0x8350355c08aDAC387b443782124A30A8942BeC2e');
    // const accountAddress = ('0xE008De2fc3D19B51dC6Ff5379Af9b970fB21E43D');

    console.log(accountAddress);
    const returnedValue = await fetch('https://arka.etherspot.io/checkWhitelist', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "params": [sponsorAddress, accountAddress, chainId, api_key] })
    })
        .then((res) => {
            return res.json()
        }).catch((err) => {
            console.log(err);
            // throw new Error(JSON.stringify(err.response))
        });

    if (returnedValue.message === "Not added yet") {
        return false;
    } else {
        return true;
    }

}