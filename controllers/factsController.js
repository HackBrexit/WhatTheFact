var Fact    = require("../models/fact");
var rp      = require("request-promise");
var cheerio = require("cheerio");
var url = "https://www.theguardian.com/world/2016/jul/24/brexit-deal-free-movement-exemption-seven-years";

function getFact(req, res) {
  return rp(url)
    .then(function(body) {
      var $ = cheerio.load(body);
      var articles = [];
      $("div.content__article-body").each(function() {
        articles.push($(this).text());
        console.log(articles);
      });
      Fact.find(function(err, fact){
        if (err) return res.status(404).json({ message: 'Something went wrong.' });
        res.status(200).json(fact);
      });
    })
    .catch(function(err) {
      return res.status(500).send(err);
    });

  }

  module.exports = {
      getFact:   getFact
  };
