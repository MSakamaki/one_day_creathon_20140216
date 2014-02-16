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
/* rLogin 
 $.ajax({
           url: "http://localhost:8081/login",
            async: false,
            type: "POST",
            data: {
                blob: {wob:"1",job:"2", ar:[1,2,{a:'b'}]}
            },
            success: function(msg){
                console.log('msg', msg);
            }
        });

 $.ajax({
           url: "http://localhost:8081/login/xxxxx@gmail.com",
            async: false,
            type: "GET",
            success: function(msg){
                console.log('msg', msg);
            },
            contentType: "application/x-www-form-urlencoded",
            dataType: "json",
        });

*/
restServer.get('/login/:address', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var keyg = keygen(50,'');
    // console.log(keyg)
    // console.log(req.params)
    // console.log(req.params.address)
    userDB.add(req.params.address, keyg);

    res.send(200, JSON.stringify({ key : keyg }));
    
    res.end();
    return next();
});

var userDB = {
    userList: [],
    add: function(id, key){
        console.log('user add!', userDB.userList);
        userDB.userList.push({"id": id,"key": key});
    }
};

/* rest URI 
restServer.put('/get', rSend);
restServer.get('/get/:XxxX', rSend);
restServer.head('/get/:XxxX',rSend);
restServer.del('/get/:XxxX', rSend);
restServer.post('/hello', rPost);
*/

/* DB制御 */
/*
var db = mongoose.connect('mongodb://localhost/hedb');
var heschema = new mongoose.Schema({ sect  : Number, point : Number });
var model = db.model('heDB', heschema);

var heUpd = function(_sect, _point){
    fncSect(_sect, function(){
        //console.log('update',_sect,_point);
        //var mdl = new model();
        model.update(
            {sect:_sect},
            {$inc : {point : _point }},
            { upsert : false , multi : false},
            function(err){ 
                if(err){ console.log('heUpd err:',err);}
            }
        );
    }, function() {
        //console.log('insert', _sect, _point);
        var mdl = new model();
        mdl.sect=_sect;
        mdl.point=_point;
        mdl.save(function(err){ if(err){ console.log('err', err);} });
    });
}
var fncSect = function(_sect, updfnc, insfnc){
    model.find({sect:_sect}, function(err,item){
        if(err || item===null){return;}
        //console.log('isSect : ',item);
        if(item.length){
            updfnc();
        }else{
            insfnc();
        }
        //shows();
    });
}
var shows = function(){
    model.find({}, function(err, item){
        item.forEach(function(lst){
            console.log('SECTION:',lst.sect, 'POINT:', lst.point, 'JSON:', lst);
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
*/

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
