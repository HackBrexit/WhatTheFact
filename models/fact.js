var mongoose    =   require("mongoose");

var factSchema  = new mongoose.Schema ({
  url            : {type : String, required: true},
  fact          : {type : String, required: true}
});

module.exports = mongoose.model("Fact", factSchema);
