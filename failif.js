
// Copyright 2011 Sleepless Software Inc.  All Rights Reserved

var fs = require("fs"),
	http = require("http"),
	stats = { hits: 0, errors: 0 }

process.on('uncaughtException', function (e) {
	if(e.cb)
		e.cb(e)
	else 
		console.log(e.stack)
});

function failIf(c, msg, cb) {
	if(c) {
		var e = new Error(msg || "Failed assertion") 
		e.cb = cb
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

function accept(req, res) {
	stats.hits++
	var tx = { req: req, res: res }
	var cb = function(err) { mopUp(tx, err) }
	fs.stat("."+req.url, function(err, st) {
		failIf(err, "File not found", cb)
		res.write("\""+req.url+"\" is "+st.size+" bytes long\n");
		res.write("hits/errors = "+stats.hits+"/"+stats.errors+"\n")
		res.end()
	})
}

http.createServer(accept).listen(1234);

