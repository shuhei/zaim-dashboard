var OAuth = require('oauth').OAuth;

var REQUEST_URL = 'https://api.zaim.net/v1/auth/request';
var ACCESS_URL = 'https://api.zaim.net/v1/auth/access';

module.exports = new OAuth(
  REQUEST_URL, // request URL
  ACCESS_URL, // access URL
  process.env.OAUTH_CONSUMER_KEY, // consumer key
  process.env.OAUTH_CONSUMER_SECRET, // consumer secret
  '1.0', // version
  'http://zaim-dashboard.herokuapp.com/auth/callback', // authorize callback
  'HMAC-SHA1' // signature method
);
