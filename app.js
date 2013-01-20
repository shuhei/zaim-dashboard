
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , OAuth = require('oauth').OAuth
;

var REQUEST_URL = 'https://api.zaim.net/v1/auth/request';
var ACCESS_URL = 'https://api.zaim.net/v1/auth/access';
var AUTH_URL = 'https://www.zaim.net/users/auth';

var oa = new OAuth(
  REQUEST_URL, // request URL
  ACCESS_URL, // access URL
  process.env.OAUTH_CONSUMER_KEY, // consumer key
  process.env.OAUTH_CONSUMER_SECRET, // consumer secret
  '1.0', // version
  'http://zaim-dashboard.herokuapp.com/auth/callback', // authorize callback
  'HMAC-SHA1' // signature method
);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

// OAuth authorization
// 1. Get a request token.
// 2. Redirect user to the authorize page with the request token.
// 3. User authorizes this app.
// 4. User is redirected to the callback URL with the verifier.
// 5. Get an access token using the verifier.

app.get('/auth', function (req, res) {
  oa.getOAuthRequestToken(function (err, oauth_token, oauth_token_secret, results) {
    if (err) {
      console.log(err);
      return res.send(err.statusCode, 'Something went wrong.');
    }
    req.session.oauth = {};
    req.session.oauth.token = oauth_token;
    req.session.oauth.token_secret = oauth_token_secret;
    res.redirect(AUTH_URL + '?oauth_token=' + oauth_token);
  });
});

app.get('/auth/callback', function (req, res, next) {
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth = req.session.oauth;
    oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier,
      function (err, oauth_access_token, oauth_access_token_secret, results) {
        if (err) {
          console.log(err);
          return res.send(err.statusCode, 'Something went wrong.');
        }
        req.session.oauth.access_token = oauth_access_token;
        req.session.oauth.access_token_secret = oauth_access_token_secret;
        res.send('Successfully got access token.');
      }
    );
  } else {
    res.send(403, { error: 'Forbidden.' });
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
