const functions = require("firebase-functions");
const ccxt = require("ccxt");
require("dotenv").config();

// I n s t a n t i a t e  T h e  E x c h a n g e :
const exchangeId = "binance",
  exchangeClass = ccxt[exchangeId],
  exchange = new exchangeClass({
    apiKey: process.env.SANDBOX_APIKEY,
    secret: process.env.SANDBOX_SECRET,
    //verbose: process.argv.includes ('--verbose'),
    verbose: false,
    timeout: 30000,
    enableRateLimit: true,
  });

// S a n d b o x  M o d e :
exchange.setSandboxMode(true);

(async () => {
  try {

    // F e t c h  B T C  B a l a n c e
    let binanceBalance = await exchange.fetchBalance();
    console.log(binanceBalance.BTC.free);
    
    // I m p l i c i t l y  F e t c h  A l l  B a l a n c e s
    // console.log(await exchange.fetchBalance());

  } catch (error) {
    console.log(error);
  }
})();
exports.btc = functions.https.onRequest((req, res) => {
  const hours = (new Date().getHours() % 12) + 1; // London is UTC + 1hr;
  const x = binanceBalance.BTC.free;
  res.status(200).send(`<!doctype html>
    <head>
      <title>Time</title>
    </head>
    <body>
      ${"BONG ".repeat(hours)}
      ${x}
    </body>
  </html>`);
});
