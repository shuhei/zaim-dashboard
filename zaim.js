var OAuth = require('oauth').OAuth;
var querystring = require('querystring');

var REQUEST_URL = 'https://api.zaim.net/v1/auth/request';
var ACCESS_URL = 'https://api.zaim.net/v1/auth/access';
var AUTH_URL = 'https://www.zaim.net/users/auth';

var oa = exports.oa = new OAuth(
  REQUEST_URL, // request URL
  ACCESS_URL, // access URL
  process.env.OAUTH_CONSUMER_KEY, // consumer key
  process.env.OAUTH_CONSUMER_SECRET, // consumer secret
  '1.0', // version
  'http://zaim-dashboard.herokuapp.com/auth/callback', // authorize callback
  'HMAC-SHA1' // signature method
);

// OAuth authorization
// 1. Get a request token.
// 2. Redirect user to the authorize page with the request token.
// 3. User authorizes this app.
// 4. User is redirected to the callback URL with the verifier.
// 5. Get an access token using the verifier.

exports.auth = function (req, res) {
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
};

exports.authCallback = function (req, res, next) {
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
        res.redirect('/');
      }
    );
  } else {
    res.send(403, { error: 'Forbidden.' });
  }
};

var MONEY_INDEX_URL = 'https://api.zaim.net/v1/money/index.json';
function Zaim(accessToken, accessTokenSecret) {
  this.accessToken = accessToken;
  this.accessTokenSecret = accessTokenSecret;
};
Zaim.prototype._request = function (url, method, callback) {
  oa.getProtectedResource(
    url, method,
    this.accessToken, this.accessTokenSecret,
    function (err, data, response) {
      if (err) {
        return callback(err, data);
      }
      callback(err, JSON.parse(data));
    }
  );
};
Zaim.prototype.getMoneyIndex = function (options, callback) {
  if (callback == null && typeof options === 'function') {
    callback = options;
    options = {};
  }
  var url = MONEY_INDEX_URL + '?' + querystring.stringify(options);
  this._request(url, 'GET', callback);
};
exports.Zaim = Zaim;

