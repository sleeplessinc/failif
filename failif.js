
// Copyright 2011 Sleepless Software Inc.  All Rights Reserved

var fs = require("fs")
var http = require("http")

var stats = { hits: 0, errors: 0 }


process.on('uncaughtException', function (e) {
	if(e.payload && e.payload.cb)
		e.payload.cb(e.payload, e)
	else 
		console.log(e.stack)
});


function failIf(c, msg, payload) {
	if(c) {
		var e = new Error(msg || "Failed assertion") 
		e.payload = payload
		throw e	
	}
}

function mopUp(tx, e) {
	stats.errors++
	var res = tx.res
	res.writeHead(500, {"Content-Type": "text/plain"})
	res.write("hits/errors = "+stats.hits+"/"+stats.errors+"\n")
	res.write("500 "+e.message+"\n")
	res.end()
}

function doStuff(tx) {
	var req = tx.req
	var res = tx.res
	fs.stat("."+req.url, function(err, st) {

		// exceptional condition - throw from arbitrary location/context
		failIf(err, "File not found", tx)

		res.write("\""+req.url+"\" is "+st.size+" bytes long\n");
		res.write("hits/errors = "+stats.hits+"/"+stats.errors+"\n")
		res.end()
	})
}

function accept(req, res) {
	stats.hits++
	doStuff({req: req, res: res, cb:mopUp })
}

http.createServer(accept).listen(1234);

