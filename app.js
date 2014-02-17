/* server define */
var restify  = require('restify'),
    mongoose = require('mongoose'),
    express  = require('express'),
    http = require("http"),
    url  = require("url"),
    path = require("path"),
    OAuth = require('oauth').OAuth;

/************************ OAuth ************************/
var twoa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    process.env.TW_OAUTH_KEY, 
    process.env.TW_OAUTH_SECRET, 
    "1.0",
　   "http://" + process.env.SERVICE_URL + "/auth/twitter/callback",
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
//app.get('/', '');
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

app.get('/auth/twitter', function(req, res){
    twoa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
        if (error) {
            console.log(error);
            res.send("yeah no. didn't work.");
        } else {
            req.session.oauth = {};
            req.session.oauth.token = oauth_token;
            console.log('oauth.token: ' + req.session.oauth.token);
            req.session.oauth.token_secret = oauth_token_secret;
            console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);
        }
    });
});

app.get('/auth/twitter/callback', function(req, res, next){
    if (req.session.oauth) {
        var url_parts = url.parse(req.url, true);
        console.log('oauth_verifier:', url_parts.query.oauth_verifier);
        req.session.oauth.verifier = url_parts.query.oauth_verifier;
        console.log('oauth:', req.session.oauth);
        var oauth = req.session.oauth;
        twoa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier,
        function(error, oauth_access_token, oauth_access_token_secret, results){
            if (error){
                console.log(error);
                res.send("yeah something broke.");
            } else {
                req.session.oauth.access_token = oauth_access_token;
                req.session.oauth.access_token_secret = oauth_access_token_secret;
                console.log(results);
                res.send("worked. nice one.");
            }
        });
    } else {
        next(new Error("you're not supposed to be here."));
    }
});

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
