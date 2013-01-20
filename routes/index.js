
/*
 * GET home page.
 */

exports.index = function(req, res) {
  if (req.session.oauth.access_token) {
    var MONEY_INDEX_URL = 'https://api.zaim.net/v1/money/index.json';
    app.get('oa').getProtectedResource(
      MONEY_INDEX_URL,
      'GET',
      req.session.oauth.access_token,
      req.session.oauth.access_token_secret,
      function (err, data, response) {
        if (err) {
          return res.send(err.statusCode, err);
        }
        res.render('index', { title: 'Zaim Dashboard', moneys: data })
      }
    );
  } else {
    res.render('index', { title: 'Zaim Dashboard', moneys: '' });
  }
};