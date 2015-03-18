var express = require('express');
var router = express.Router();
var moment = require('moment');

/* GET home page. */
router.post('/saveImage', function(req, res,next) {
	var collection = req.db.get('images');
	var image = {
		base_64: req.body.imgBase64.replace("data:image/jpeg;base64,", "").replace(" ", "+"),
		created: moment().format(), //current time
		pokemon: req.body.pokemon.toLowerCase()
	};
	collection.insert(image, function(err, record){
		if (err){
			next(err);
		}
		else{
			res.contentType('application/json');
			res.send(JSON.stringify({_id: record._id}));
		}
	});
});
router.get('/getDrawingFilenames/:limit', function(req, res) {
	var collection = req.db.get('images');
	var options = {
		limit: req.param('limit'),
		sort: [['_id','desc']],
		fields: {_id: 1, created: 1, pokemon: 1}
	};
	collection.find({}, options, function(err, records){
		if (err){
			console.log(err);
		}
		res.contentType('application/json');
		res.send(JSON.stringify(records));
	});
});
module.exports = router;