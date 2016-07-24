var mongoose    =   require("mongoose");

var factSchema  = new mongoose.Schema ({
  title            : {type : String, required: true},
  content          : {type : String, required: true}
});

module.exports = mongoose.model("Fact", factSchema);
