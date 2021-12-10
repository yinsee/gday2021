const ITEM_PRICE = 0.01;

const express = require('express')
const bodyParser = require('body-parser')

const hostname = '127.0.0.1';
const port = 3000;
const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));


// blockchain stuff
// BSC Mainnet https://bsc-dataseed.binance.org/
const ethers = require("ethers");
const defaultProvider = ethers.getDefaultProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");


// validate tx, return message
app.post('/buy', async (req, res, next) => {
    try {

        let r = await defaultProvider.getTransaction(req.body.transactionHash);
        console.log(r);
        console.log('sender', r.from,
            'receiver', r.to,
            'value', r.value.div(10 ** 9).toNumber() / 10 ** 9,
        );
        const price = ethers.BigNumber.from(ITEM_PRICE * 10 ** 9).mul(10 ** 9);
        if (r.value.eq(price)) {
            res.status(200).send('Payment is verified');
        }
        else {
            res.status(400).send('Unable to verify payment');
        }
    } catch (e) {
        next(e);
    }
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
