/* server define */
var restServer = require('restify').createServer(),
    http = require("http"),
    url  = require("url"),
    path = require("path"),
    fs   = require("fs"),
    port = process.argv[2] || 80;

/* listen */
restServer.listen(8081, function() {
	console.log('listening at ', restServer.name, restServer.url);
});

http.createServer(function(request, response) {
    var Response = {
        "200":function(file, filename){
            var extname = path.extname(filename);
            var header = {
                "Access-Control-Allow-Origin":"*",
                "Pragma": "no-cache",
                "Cache-Control" : "no-cache"       
            }

            response.writeHead(200, header);
            response.write(file, "binary");
            response.end();
        },
        "404":function(){
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();

        },
        "500":function(err){
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();

        }
    }

    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd() + '/public', uri);

    fs.exists(filename, function(exists){
        console.log(filename+" "+exists);
        if (!exists) { Response["404"](); return ; }
        if (fs.statSync(filename).isDirectory()) { filename += 'index.html'; }

        fs.readFile(filename, "binary", function(err, file){
        if (err) { Response["500"](err); return ; }
            Response["200"](file, filename);   
        }); 
    });

}).listen(parseInt(port, 10));

console.log("Server running at http://localhost:" + port );


/************************  REST Server *******************************/
restServer.use(
	/* cross Origin Option */
	function crossOrigin(req,res,next){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		return next();
	}
);


/* rest function */
var rPost = function(req,res,next){
	res.send(201,"post action!");
	return next();
}
var rSend = function(req,res,next){
	console.log('/get', req.params.XxxX);
	var param = req.params.XxxX;
	try{
		res.send(JSON.stringify({ p : param }));
	}catch(e){ 
		console.log('err:',e);
		res.send(JSON.stringify({err:"505 server error!"}));
	}
	//return next();
}

/* rest URI */
restServer.put('/get', rSend);
restServer.get('/get/:XxxX', rSend);
restServer.head('/get/:XxxX',rSend);
restServer.del('/get/:XxxX', rSend);
restServer.post('/hello', rPost);