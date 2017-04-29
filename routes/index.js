var express = require('express');
var router = express.Router();
var Clarifai = require('clarifai');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Command center' });
});


router.get('/api/image', function(req, res, next) {
	var Imgnamed = req.query.Imgname;
	submitImage(Imgnamed, function(err, data){
		if (err) {
			res.status(500).send('error: ' + err);
        } else {
            res.send(JSON.stringify(data));
            
        
		}
	});
});

function submitImage(Imgnamed, callback)
{
var imgURL = Imgnamed;	
var api = new Clarifai.App(
        process.env.CLARIFAI_CLIENT_ID,
        process.env.CLARIFAI_CLIENT_SECRET
      );
      
      // predict the contents of an image by passing in a url
      api.models.predict(Clarifai.GENERAL_MODEL, {base64: imgURL}).then(
        function(response) {
          // console.log(Imgnamed+'this is the camera');
          for (var i = 0; i < response.outputs[0].data.concepts.length; i++) {
          	console.log(response.outputs[0].data.concepts[i].name);
          	if (response.outputs[0].data.concepts[i].name === 'flame') {
          		console.log('its hot!');
          		sendNotificationFire();
          		callback(null,  {'status': 'Fire Is Burning!'});	
          	}
          	else{
          		sendNotificationNoFire();
          		console.log('not fire');
          		
          	}
            
          }
          callback(null, {'status': 'No Fire Here'});
          	}
        ,
        function(err) {
          console.error(err+'error');
        }
      );
}
function sendNotificationFire(){
    var fireObj = {
    	'stationID':'9346',
    	'Latitude': '40.7128',
    	'Longitude': '74.0059',
    	'Status': true,
    	'StatusDescription': 'Fire is Burning'
    };
}

function sendNotificationNoFire(){
	var noFireObj = {
    	'stationID':'9346',
    	'Latitude': '40.7128',
    	'Longitude': '74.0059',
    	'Status': false,
    	'StatusDescription': 'Fire is Not Burning'
    };

}


module.exports = router;
