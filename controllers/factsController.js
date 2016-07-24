var Fact = require("../models/fact");
var rp = require("request-promise");
var cheerio = require("cheerio");


function factFind(req, res) {
    var url = "http://www.theguardian.com/politics/reality-check/2016/may/23/does-the-eu-really-cost-the-uk-350m-a-week";
    return rp(url)
        .then(function(body) {
            var $ = cheerio.load(body);
            var article = [];
            $("article").each(function() {
                article.push($(this).text());
                console.log(article);
            });
            Fact.findBy(article).exec(function(err, user) {
                if (err) return res.status(404).json({
                    message: 'Something went wrong.'
                });
                res.status(200).json(user);
            });
        })
        .catch(function(err) {
            console.log("something went wrong...");
        });
}

module.exports = {
    find: factFind
};
