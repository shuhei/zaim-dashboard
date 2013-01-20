var Zaim = require('../zaim').Zaim;

/*
 * GET home page.
 */

exports.index = function(req, res) {
  if (req.session.oauth && req.session.oauth.access_token) {
    var zaim = new Zaim(
      req.session.oauth.access_token,
      req.session.oauth.access_token_secret
    );
    zaim.getMoneyIndex({ limit: 100 }, function (err, data) {
      if (err) {
        return res.send(err.statusCode, err);
      }
      res.render('index', { title: 'Zaim Dashboard', moneys: data.money });
    });
  } else {
    res.render('index', { title: 'Zaim Dashboard', moneys: [] });
  }
};