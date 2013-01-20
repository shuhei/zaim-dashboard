var async = require('async');
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
      var categories = results.categories.categories.reduce(function (dict, cat) {
        dict[cat.id] = cat;
      }, {});
      var genres = results.genres.genres.reduce(function (dict, gen) {
        dict[gen.id] = gen;
        gen.category = categories[gen.category_id];
      }, {});
      moneys.forEach(function (money) {
        money.category = categories[money.category_id];
        money.genre = genres[money.genre_id];
      });
      res.render('index', { title: 'Zaim Dashboard', moneys: moneys });
    });
  } else {
    res.render('index', { title: 'Zaim Dashboard', moneys: [] });
  }
};