var mongoose       = require("mongoose");
var config         = require("../../config/config");

// Models
var Fact       = require("../../models/fact");

// Data
var factsData   = require("../data/facts.json");

// Connect to database
mongoose.connect(config.database, function(){
  console.log("Connected to database");
});

// Drop collections
Fact.collection.drop();

factsData.forEach(function(fact){
  Fact
  .create(fact)
  .then(function(fact){
    console.log("[Fact] " + fact.name + " was created");
  });
});
