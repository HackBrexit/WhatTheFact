var express                     = require('express');
var router                      = express.Router();
var factsController             = require("../controllers/factsController");


//******* Routes ***********//

router.route('/fact').get(factsController.getFact);


module.exports = router;
