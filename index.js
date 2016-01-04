let http = require('http')
let request = require('request')
let path = require('path')
let through = require('through')

let fs = require('fs')

let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
 let scheme = 'http://'
 let port = argv.port || (argv.host === '127.0.0.1' ? 8000 :80 )
    // Build the destinationUrl using the --host value
let destinationUrl = argv.url || scheme + argv.host + ':' + port
// let logPath = argv.log && path.join(__dirname, argv.log)
// let getLogStream = ()=> logPath ? fs.createWriteStream(logPath) : process.stdout
let logStream = argv.logfile ? fs.createWriteStream(argv.logfile) : process.stdout


http.createServer((req, res) => {
    console.log('Request received at: ${req.url}')
    for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
   }
   logStream.write('\n\n\n' + JSON.stringify(req.headers))
   through(req,logStream,{autoDestroy:false})
    req.pipe(res)
}).listen(8000)

http.createServer((req, res) => {
	console.log('in Proxy 1' )
	let url=destinationUrl
	if(req.headers['x-destination-url']){
		url=req.headers['x-destination-url']
	}
    // Proxy code
    let options = {
        headers: req.headers,
        url: url
    }
     // options.method = req.method
     console.log('in Proxy 2')

    let downstreamResponse = req.pipe(request(options))
    logStream.write(JSON.stringify(downstreamResponse.headers))
    through(downstreamResponse,logStream,{autoDestroy:false})
    downstreamResponse.pipe(res)
   }).listen(8002)