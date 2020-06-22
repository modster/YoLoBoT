"use strict";

// M o d u l e s :
var express = require('express')
var app = express()
const ccxt = require('ccxt');
require('dotenv').config();

const port = 80

// I n s t a n t i a t e  T h e  E x c h a n g e :
const exchangeId = 'binance',
exchangeClass = ccxt[exchangeId],
exchange = new exchangeClass({
  apiKey: process.env.BINANCE_APIKEY,
  secret: process.env.BINANCE_SECRET,
  //verbose: process.argv.includes ('--verbose'),
  verbose: false,
  timeout: 30000,
  enableRateLimit: true,
});

// S a n d b o x  M o d e :
exchange.setSandboxMode(true);

app.post('/', function (req, res, next) {
  
  let { body } = req;
  if( body.side == 'buy' ) {
    (async () => {
        try {
        let markets = await exchange.load_markets();
        // F e t c h  U S D T  B a l a n c e :
        let balances = await exchange.fetchBalance();
        //let qty = balances.USDT.free;
        let qty = 0.01;
        const marketOrder = await exchange.createMarketBuyOrder('BTC/USDT', qty);
        console.log("marketOrder: ", marketOrder);
        console.log(qty);
        console.log(`BTC Available Balance Free: ${balances.BTC.total}`);
        console.log(`USDT Available Balance Free: ${balances.USDT.total}`);
      } catch (e) {
        if (e instanceof ccxt.NetworkError) {
          console.log("fetchTicker failed due to a network error:", e.message);
        } else if (e instanceof ccxt.ExchangeError) {
          console.log("fetchTicker failed due to exchange error:", e.message);
        } else {
          console.log("fetchTicker failed with:", e.message);
        }
      }
    })
  }
});

app.listen(port, function(){
  console.log(`listening on *:${port}`);
});
