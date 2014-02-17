/* server define */
var restify  = require('restify'),
    mongoose = require('mongoose'),
    express  = require('express'),
    http = require("http"),
    url  = require("url"),
    path = require("path"),
    fs   = require("fs"),
    //port = process.argv[2] || 80,
    OAuth = require('oauth').OAuth;

/************************ OAuth ************************/
var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "", 
    "", 
    "1.0",
　   "http://127.0.0.1/auth/twitter/callback",
 　  "HMAC-SHA1"
  );

/* listen */
var restServer  =restify.createServer();
var restService = restServer.listen(8081, function() {
	console.log('listening at ', restServer.name, restServer.url);
});

var app = express();
app.configure(function(){
    app.set('port', 80);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    //express -s をつけると以下の2行が付きます。
    app.use(express.cookieParser('one day creathion'));
    app.use(express.session());
    app.use(express.static(path.join(__dirname, 'public')));
});
app.get('/', routes.index);
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
/*
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

    var twitterAouth = function(req, res){
        oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
          if (error) {
            console.log(error);
           res.send("yeah no. didn't work.");
          } else {
            req.session={};
            req.session.oauth = {};
            req.session.oauth.token = oauth_token;
            console.log('oauth.token: ' + req.session.oauth.token);
            req.session.oauth.token_secret = oauth_token_secret;
            console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
            res.writeHead(302, {'Location': 'https://twitter.com/oauth/authenticate?oauth_token='+oauth_token});
            res.end();
          }
       });
    };
    var twitterAouthCallback = function(req, res){

        var url_parts = url.parse(req.url, true);
        //console.log('url_parts',url_parts);
        var query = url_parts.query;
        //console.log('query',query);
      if (query) {
        req.session ={};
        req.session.oauth ={};
        req.session.oauth.verifier = query.oauth_verifier;
        var oauth = req.session.oauth;
        oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
        function(error, oauth_access_token, oauth_access_token_secret, results){
          if (error){
            console.log('[ERROR]',error);
          } else {
            req.session.oauth.access_token = oauth_access_token;
            req.session.oauth.access_token_secret = oauth_access_token_secret;
            console.log('[SUCESS]',results);
          }
        });
      }
    }

    var send = function(_file){
        fs.exists(_file, function(exists){
            console.log(_file+" "+exists);
            if (!exists) { Response["404"](); return ; }
            if (fs.statSync(_file).isDirectory()) { _file += '/index.html'; }

            fs.readFile(_file, "binary", function(err, file){
                if (err) { Response["500"](err); return ; }
                Response["200"](file, _file);   
            }); 
        });
    }

    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd() + '/public', uri);
    console.log("uri", uri);
    switch(uri){
        case "/auth/twitter":
            twitterAouth(request, response);
            break;
        case "/auth/twitter/callback":
            twitterAouthCallback(request, response);
            send(process.cwd() + '/public');
            break;
        default:
            send(filename);
            break;
    }

}).listen(parseInt(port, 10));
*/



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
    //dbUpd(req.params.address, keyg);
}catch(e){
    console.log('err:',e);
}
    res.send(200, JSON.stringify({ key : keyg }));
    res.end();
    console.log('fixd');
    return next();
});

/* DB制御 
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
