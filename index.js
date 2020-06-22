/* 'LILBOT
 * TradingView charts and indicators are the best. I prefer them to Binance's 
 * charts, so I made a bot that trades on Binance's exchange useing
 * TradingView indicators, strategies, and alerts. It's simple enough that even
 * a javascript novice can start using it right away. 'LILBOT was designed to 
 * be used as a base for other projects.
 * 
 * This version of 'LILBOT makes extensive use of Jon Eryck's Node-Binance-API 
 * project which can be found here: 
 * https://github.com/jaggedsoft/node-binance-api
 * 
 *****************************************************************************/
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
const min = 0.0016;
const hostname = '127.0.0.1';
const port = 80;

// Are we in test mode?
console.log ("Test Mode: ", binance.getOption('test'));


const usdt = binance.balance((error, balances) => {
  if ( error ) return console.error(error);
  const usdtBal = balances.USDT.available;
}) // binance.balance

// E v e n t  E m i t t e r s
var eventEmitter = new events.EventEmitter();

eventEmitter.on('error', (err) => {
  console.error(err);
})

eventEmitter.on('bal', () => {
    console.log(usdt);
}) // eventemitter.on('bal')

eventEmitter.on('buy', () => {
  binance.marketBuy(symbol, min);
}) // eventemitter.on('buy')

eventEmitter.on('sell', () => {

  binance.balance((error, balances) => {
    if ( error ) return console.error(error);
    
    if ( balances.BTC.available > quantity ) {
      binance.marketSell(symbol, quantity);
    }
  
    else {
      
      binance.marketSell(symbol, balances.BTC.available);
    }
    console.log(balances.BTC.available);
  }) // binance.balance
}) // end eventemitter.on('sell')

//  S T O P
eventEmitter.on('stop', () => {
  
  binance.balance((error, balances) => {
    if ( error ) return console.error(error);

    if( balances.BTC.available > 0) {
      btcBalance = parseFloat(balances.BTC.available);
      console.log(btcBalance);
      binance.marketSell(symbol, btcBalance);
    }
  }) // binance.balance
  
}) // end eventemitter.on('stop')

const server = http.createServer((req, res) => {
  //const { headers, method, url } = req;
  let body = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    if(body === 'bal') { 
      eventEmitter.emit('bal'); // <----------------------- BAL
    } 
    if(body === 'buy') { 
      eventEmitter.emit('buy'); // <----------------------- BUY
    } 
    
    if(body === 'sell') {
      eventEmitter.emit('sell'); // <---------------------- SELL
    }
    
    if(body === 'stop') {
      eventEmitter.emit('stop'); // <---------------------- SELL
    }
    console.log(body);
    res.statusCode = 200;
    res.end();
    }
  )}
);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
