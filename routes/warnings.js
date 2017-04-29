var express = require('express');
var router = express.Router();
var notifier = require('../modules/notifier');

/* GET active warnings listing. */
router.get('/', function(req, res, next) {
    res.send('something here TODO list of active warnings');
});

router.get('/send', function(req, res, next) {
    notifier.sendSms('Warning. Wild fire in your area. Evacuate immediately.', [], function(error, message) {
        if (error) {
            console.error(error.message);
            res.status(500).send('error: ' + error);
        } else {
            res.send('notification sent: ' + message);
        }
    });

});


module.exports = router;
