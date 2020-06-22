"use strict";

// M o d u l e s :
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
    timeout: 30000, // <---------------------------------- wow that's high!
    enableRateLimit: true,
    options: {
      createMarketBuyOrderRequiresPrice: false,
    },
  });

// S a n d b o x  M o d e :
exchange.setSandboxMode(true);

// E x c h a n g e   H a s 
//console.log (exchange.has)

async function buy() {
  try {
        
    // L o a d  M a r k e t s
    let markets = await exchange.load_markets (); 
    //console.log (markets);

    // F e t c h  U S D T  B a l a n c e :
    let balances = await exchange.fetchBalance();
    let usdtBalance = balances.USDT.free;
    // console.log(`USDT Available Balance: ${balances.USDT.free}`);

    // F e t c h  O r d e r  B o o k
    const orderBook = await exchange.fetchOrderBook('BTC/USDT');
    let price =  orderBook.asks[0][0];
    // console.log('BTC/USDT Orderbook: ', orderBook.asks[0][0]);

    // C r e a t e  M a r k e t  B u y  O r d e r :
    const qty = usdtBalance/price;
    console.log(qty)
    const placeResult = await exchange.createMarketBuyOrder('BTC/USDT', qty);
    console.log('result of placing order: ', placeResult);
    
    } catch (e) {

    if (e instanceof ccxt.NetworkError) {
      console.log( 'fetchTicker failed due to a network error:', e.message)

    } else if (e instanceof ccxt.ExchangeError) {
      console.log( 'fetchTicker failed due to exchange error:', e.message)

    } else {
      console.log( 'fetchTicker failed with:', e.message)
    }
  }
};
buy();