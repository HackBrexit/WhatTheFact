var express            = require('express');
var router             = express.Router();


var factsController    = require("../controllers/factController");

router.route('/fact/:url').get(factsController.index);
