var express = require('express');
var router = express.Router();
var Clarifai = require('clarifai');
var request = require('request');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Command center'});
});

router.post('/api/image', function (req, res, next) {
    var imageBase64 = req.body.image;
    console.log("calling Clarifai API...");
    submitImage(imageBase64, function (err, data) {
        if (err) {
            res.status(500).send(JSON.stringify(err));
        } else {
            res.send(data);
        }
    });
});

router.get('/api/image', function (req, res, next) {
    var Imgnamed = req.query.Imgname;
    submitImage(Imgnamed, function (err, data) {
        if (err) {
            res.status(500).send('error: ' + err);
        } else {
            res.send(JSON.stringify(data));


        }
    });
});

var api = new Clarifai.App(
    process.env.CLARIFAI_CLIENT_ID,
    process.env.CLARIFAI_CLIENT_SECRET
);

function submitImage(imageBase64, callback) {

    // predict the contents of an image by passing in a url
    api.models.predict(Clarifai.GENERAL_MODEL, {base64: imageBase64})
        .then(function (response) {

                response.outputs[0].data.concepts.forEach(function (a) {
                    console.log("TAG: " + a.name);
                });

                console.log("response from Clarifai OK");
                for (var i = 0; i < response.outputs[0].data.concepts.length; i++) {
                    console.log(response.outputs[0].data.concepts[i].name);
                    if (response.outputs[0].data.concepts[i].name === 'flame') {
                        console.log('its hot!');
                        sendNotificationFire();
                        callback(null, {'status': 3});
                        return;
                    }

                    if (response.outputs[0].data.concepts[i].name === 'sculpture') {
                        console.log('alien invasion');
                        sendNotificationAlien();
                        callback(null, {'status': 4});
                        return;
                    }
                }
                console.log('not fire');
                sendNotificationNoFire();
                callback(null, {'status': 0});
            },
            function (err) {
                console.error('resp error: ' + JSON.stringify(err));
                callback(err, null);
            }
        ).catch(function (err) {
        console.error('promise error: ' + JSON.stringify(err));
        callback(err, null);
    });
}

function sendNotificationFire() {
    var fireObj = {
        'stationID': '9346',
        'Latitude': '40.7128',
        'Longitude': '74.0059',
        'Status': true,
        'StatusDescription': 'Fire is Burning'
    };

    request.post(
        'http://johnabsher.pythonanywhere.com/notify',
        {json: fireObj},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
}

function sendNotificationAlien() {
    var fireObj = {
        'stationID': '9346',
        'Latitude': '40.7128',
        'Longitude': '74.0059',
        'Status': true,
        'StatusDescription': 'Alien invasion started'
    };

    request.post(
        'http://johnabsher.pythonanywhere.com/notify',
        {json: fireObj},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
}

function sendNotificationNoFire() {
    var noFireObj = {
        'stationID': '9346',
        'Latitude': '40.7128',
        'Longitude': '74.0059',
        'Status': false,
        'StatusDescription': 'Fire is Not Burning'
    };

    request.post(
        'http://johnabsher.pythonanywhere.com/notify',
        {json: noFireObj},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );

}

module.exports = router;
