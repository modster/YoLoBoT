var express = require('express')
var app = express()
const Binance = require('node-binance-api');
require('dotenv').config();

const port = 80
const min = 0.0015;

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

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

async function btcUsdtPrice (req, res, next) {
  let ticker = await binance.prices();
  req.btcUsdtPrice = ticker.BTCUSDT;
  next();
}

function getBalances(req, res, next) {
  console.info( await binance.futuresBalance() );

  binance.balance((error, balances) => {
    if ( error ) return console.error(error);
    req.btcBalance = balances.BTC.available;
    req.usdtBalance = balances.USDT.available;
    next();
  });
}

app.use(getBalances);
app.use(btcUsdtPrice);

app.post('/', function (req, res, next) {
  let { body } = req;
  console.log(body);
  console.log(`BTC Current Price: ${req.btcUsdtPrice}`);
  console.log(`USDT Available Balance: ${req.usdtBalance}`);
  console.log(`BTC Available Balance: ${req.btcBalance}`);
  
  let ticker = body.ticker;
  if( body.direction == 'buy' ) {

  }
  else if( body.direction == 'sell' ) {
    let min = 0.0016
    if(req.btcBalance >= min) {
      console.log(`Sell: ${min} BTC`);
      binance.marketSell('BTCUSDT', min);
    }
  }
  else if( body.direction == 'stop' ) {
    let min = req.btcBalance
    //if(req.btcBalance >= 0.0016) {
    console.log(`Sell: ${min} BTC`);
    binance.marketSell('BTCUSDT', min);
    //}
  }
  else {
    console.log(`${body} ERROR`);
  }
  console.log(body)
  res.status(200).end();
})

app.listen(port, function(){
  console.log(`listening on *:${port}`);
});