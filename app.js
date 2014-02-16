/* server define */
var restify = require('restify'),
    mongoose    = require('mongoose'),
    http = require("http"),
    url  = require("url"),
    path = require("path"),
    fs   = require("fs"),
    port = process.argv[2] || 80;

/* listen */
var restServer  =restify.createServer();
var restService = restServer.listen(8081, function() {
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
restServer.use(restify.bodyParser());
restServer.use(restify.CORS());

/*      var request = $.ajax({
            url: "http://localhost:8081/login/gmail@gmail.com",
            async: false,
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            dataType: "json",
       });
*/
/* rest function */
restServer.get('/login/:address', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var keyg = keygen(50,'');
    console.log('keyg',keyg);
try{
    dbUpd(req.params.address, keyg);
}catch(e){
    console.log('err:',e);
}
    res.send(200, JSON.stringify({ key : keyg }));
    res.end();
    console.log('fixd');
    return next();
});

/* DB制御 */
var db = mongoose.connect('mongodb://localhost/hedb');
var heschema = new mongoose.Schema({ address: String, keyg: String });
var model = db.model('heDB', heschema);

var dbUpd = function(address, keyg){
    fncSect(address, function(){
        console.log('update', address, keyg);
        model.update(
            {"address": address},
            {$set : {keyg : keyg }},
            { upsert : false , multi : false},
            function(err){ 
                if(err){ console.log('heUpd err:',err);}
            }
        );
    }, function() {
        console.log('insert', address, keyg);
        var mdl = new model();
        mdl.address=address;
        mdl.keyg=keyg;
        mdl.save(function(err){ if(err){ console.log('err', err);} });
    });
}
var fncSect = function(address, updfnc, insfnc){
    console.log('fncSect');
    model.find({"address": address}, function(err,item){
        console.log('fncSect-001',err,item);
        if(err || item===null){return;}
        if(item.length){
            updfnc();
        }else{
            insfnc();
        }
        show();
    });
}

/* db base */
var shows = function(){
    model.find({}, function(err, item){
        item.forEach(function(lst){
            console.log('address:',lst.address, 'keyg:', lst.keyg, 'JSON:', lst);
        });
    });
}
var getGdata=function(fnc){
    model.find({}, function(err, item){
        fnc(item);
    });
}
var deleteAllGdata=function(){
    model.remove({}, function(err){
        console.log('err:', err);
    });
}

/* utill*/
var keygen = function(n, b) {
    b = b || '';
    var a = 'abcdefghijklmnopqrstuvwxyz'
        + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        + '0123456789'
        + b;
    a = a.split('');
    var s = '';
    for (var i = 0; i < n; i++) {
        s += a[Math.floor(Math.random() * a.length)];
    }
    return s;
};
