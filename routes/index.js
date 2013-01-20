var async = require('async');
var Zaim = require('../zaim').Zaim;

/*
 * GET home page.
 */

function toObjWithId(array) {
  return array.reduce(function (dict, item) {
    dict[item.id] = item;
    return dict;
  }, {});
}

exports.index = function(req, res) {
  if (req.session.oauth && req.session.oauth.access_token) {
    var zaim = new Zaim(
      req.session.oauth.access_token,
      req.session.oauth.access_token_secret
    );
    async.parallel({
      moneys: function (callback) {
        zaim.getMoneyIndex({ limit: 100 }, callback);
      },
      categories: function (callback) {
        zaim.getCategoryPay({}, callback);
      },
      genres: function (callback) {
        zaim.getGenrePay({}, callback);
      }
    }, function (err, results) {
      if (err) return res.send(err.statusCode, err);
      var moneys = results.moneys.money;
      var categories = toObjWithId(results.categories.categories);
      var genres = toObjWithId(results.genres.genres);
      var none = { id: 0, title: '' };
      moneys.forEach(function (money) {
        if (money.type === 'pay') {
          money.category = categories[money.category_id] || none;
          money.genre = genres[money.genre_id] || none;
        }
      });
      res.render('index', { title: 'Zaim Dashboard', moneys: moneys });
    });
  } else {
    res.render('index', { title: 'Zaim Dashboard', moneys: [] });
  }
};