var express = require('express')
var app = express()
const Binance = require('node-binance-api');
require('dotenv').config();

const port = 80
const min = 0.015;

// B i n a n c e - N o d e - A P I   O p t i o n s
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_APIKEY,
  APISECRET: process.env.BINANCE_SECRET,
  useServerTime: true,
  recvWindow: 5000, // Set a higher recvWindow to increase response timeout
  verbose: true, // Add extra output when subscribing to WebSockets, etc
  test: false,
  reconnect: true
  // to do: enable Logging
});

app.use(express.json({ extended: false })) // for parsing application/json

// app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/*
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
*/
async function btcUsdtPrice (req, res, next) {
  let ticker = await binance.prices();
  req.btcUsdtPrice = ticker.BTCUSDT;
  next();
}

async function getBalances(req, res, next) {
  //let bal = await binance.futuresBalance();
  //req.btcBal = bal.BTC;

  binance.balance((error, balances) => {
    if ( error ) return console.error(error);
    req.btcBalance = balances.BTC.available;
    req.usdtBalance = balances.USDT.available;
    next();
  });
}

app.use(getBalances);
//app.use(btcUsdtPrice);

app.post('/', function (req, res, next) {
  let { body } = req;
  
  if( body.side == 'buy' ) {
    binance.marketBuy('BTCUSDT', min);
  }
  else if( body.side == 'sell' ) {
    //if(req.btcBal >= min) {
    binance.marketSell('BTCUSDT', min);
  }
  else if( body.side == 'stop' ) {
    let max = req.btcBalance
    binance.marketSell('BTCUSDT', max);
    //}
  }
  console.log(body);
  res.status(200).end();
})

app.listen(port, function(){
  console.log(`listening on *:${port}`);
});