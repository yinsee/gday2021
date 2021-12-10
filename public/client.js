
// allow user to swap network
const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
// eth = 1, bsc = 56, bsc testnet = 97
const chainId = 97;
let prevNetwork;
let receiver = '0x31BFaf2534e2aB311ad6CF6fB80870D8e3C3a714';

async function connectWallet() {
    try {
        await provider.send("eth_requestAccounts", []);
        app.wallet = await provider.getSigner().getAddress();
        app.buyable = true;
        streamBalance();
    } catch (error) {
        //
    }
}

async function validateNetwork() {
    let network = await provider.getNetwork()
    if (network.chainId !== chainId) {

        app.buyable = false;
        app.balance = 0;

        alert('Please switch to BSC network');
        switchChain();
        throw "Invalid network";
    }
}


async function streamBalance() {
    try {
        let b = await provider.getBalance(app.wallet);
        // BNB is 18 decimals
        app.balance = (b / 10 ** 18).toFixed(2);
    } catch (error) {
        //
    } finally {
        setTimeout(streamBalance, 1000);
    }

}

async function purchase() {
    validateNetwork();
    if (!app.wallet) {
        await connectWallet();
        return;
    }

    try {
        app.buyable = false;
        let transaction = await provider.getSigner().sendTransaction({
            to: receiver,
            value: ethers.utils.parseEther("0.01"),
        });

        app.buying = true;
        let receipt = await transaction.wait(1);
        console.log(receipt);

        try {
            var r = await axios.post('/buy', { transactionHash: receipt.transactionHash });
            app.message = r.data;
        } catch (error) {
            app.message = error.response.data;
        } finally {
            let dlg = new bootstrap.Modal(document.getElementById('dialog'));
            dlg.show();
        }
    }
    finally {
        app.buyable = true;
        app.buying = false;
    }
}


async function switchChain() {
    provider.send('wallet_addEthereumChain',
        [{ chainId: '0x' + chainId.toString(16), chainName: 'BSC', nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }, rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'], blockExplorerUrls: ['https://testnet.bscscan.com/'] }]
    );
    // rpcUrls: ['https://bsc-dataseed.binance.org/'], blockExplorerUrls: ['https://bscscan.com/']
}


var app = new Vue({
    el: '#app',
    data: {
        wallet: '',
        buyable: false,
        buying: false,
        balance: 0,
        message: '',
    },
    mounted: function () {
        // detect network changes
        provider.on('network', async () => {
            if (prevNetwork) {
                console.log('network changed:', (await provider.getNetwork()).chainId);
                window.location.reload();
            }
            else {
                validateNetwork();
                prevNetwork = await provider.getNetwork();
            }
        });
        connectWallet();
    },
    methods: {
        connect: function () {
            connectWallet();
        },
        purchase: function () {
            purchase();
        }
    },
});
