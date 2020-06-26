const Binance = require( 'node-binance-api' );
const http = require('http');
const events = require('events');
require('dotenv').config();

// B i n a n c e - N o d e - A P I   O p t i o n s
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_APIKEY,
  APISECRET: process.env.BINANCE_SECRET,
  useServerTime: true,
  recvWindow: 1500, // Set a higher recvWindow to increase response timeout
  verbose: false, // Add extra output when subscribing to WebSockets, etc
  test: false,
  reconnect: true
  // to do: enable Logging
});

const symbol = 'BTCUSDT';
const quantity = 0.0016;
const hostname = '127.0.0.1';
const port = 80;

binance.balance((error, balances) => {
  if ( error ) return console.error(error);
  console.log(balances.BTC.available);
});