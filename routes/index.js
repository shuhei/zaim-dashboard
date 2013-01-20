var oa = require('../zaim').oa;

/*
 * GET home page.
 */

exports.index = function(req, res) {
  if (req.session.oauth && req.session.oauth.access_token) {
    var MONEY_INDEX_URL = 'https://api.zaim.net/v1/money/index.json?limit=100';
    oa.getProtectedResource(
      MONEY_INDEX_URL,
      'GET',
      req.session.oauth.access_token,
      req.session.oauth.access_token_secret,
      function (err, data, response) {
        if (err) {
          return res.send(err.statusCode, err);
        }
        var moneys = JSON.parse(data).money;
        res.render('index', { title: 'Zaim Dashboard', moneys: moneys })
      }
    );
  } else {
    res.render('index', { title: 'Zaim Dashboard', moneys: [] });
  }
};