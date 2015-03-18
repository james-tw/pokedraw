var express = require('express');
var router = express.Router();

router.get('/:image_id', function(req, res) {
	var collection = req.db.get('images');
	collection.findOne({"_id": req.param("image_id")}, {fields: {base_64: 1}}, function(err, record) {
		if (err) {
			console.log(err);
			next(err);
		}
		else {
			if (record != undefined)
			{
				//console.log("Dev: IP Connection From: " + req.connection.remoteAddress);
				var img = new Buffer(record.base_64, 'base64');
				res.contentType('image/jpeg');
				res.send(img);
			}
			else{
				res.contentType('text/html');
				res.send("That drawing is no longer available.");
			}
		}
	});
});

module.exports = router;
