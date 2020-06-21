function jsonAPI(anExport, aFunction) 
{
    var runkitExpress = require("@runkit/runkit/express-endpoint/1.0.0")
    var bodyParser = require('body-parser');
    var app = runkitExpress(anExport)

    app.set('json spaces', 2);
    app.use(require('compression')())
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    // add CORS headers, so the API is available anywhere
    app.use(function(req, res, next)
    {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Expose-Headers", "runkit-rate-limit-remaining");
        res.header("Access-Control-Expose-Headers", "tonic-rate-limit-remaining");
        
        var reqHeaders = req.get("Access-Control-Request-Headers")
        if (reqHeaders) res.header("Access-Control-Allow-Headers", reqHeaders);
        
        var reqMethods = req.get("Access-Control-Request-Methods")
        if (reqMethods) res.header("Access-Control-Allow-Methods", reqMethods);

        next()
    })

    app.all('/', async function(request, response, next) 
    {
        try 
        {
            var requestData = {
                method: request.method,
                body: request.body,
                query: request.query
            }

            var responseData = await (aFunction.length === 2 ? 
                                (new Promise(function(resolve) {
                                    aFunction(requestData, resolve)
                                })) : aFunction(requestData))

            if (responseData)
                response.json(responseData)
            else
                response.status(201).end()
        } 
        catch(anException) 
        {
            response.status(500)
            response.json({
                message: "unable to process request",
                error: anException.toString()
            })
        }
    })
    
    return app;
}

module.exports = jsonAPI;