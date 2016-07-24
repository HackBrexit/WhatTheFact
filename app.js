var express         = require("express");
var parser          = require("body-parser");
var morgan          = require("morgan");
var methodOverride  = require("method-override");
var app             = express();

mongoose.connect(config.database);

app.use(morgan("dev"));

app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === "object" && "_method" in req.body){
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.listen(3000, function(){
  console.log("Hello Storyhunter listening on port 3000");
});
