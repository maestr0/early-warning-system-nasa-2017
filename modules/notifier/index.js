var twilio = require('twilio');
var client = new twilio.RestClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function Notifier(){};

Notifier.prototype.sendSms = function(msg, recipients, callback){
  client.messages.create({
      body: msg,
      to: process.env.TWILIO_TEST_MOBILE_NO,  // Text this number
      from: process.env.TWILIO_MOBILE_NO // From a valid Twilio number
  }, callback);
}

module.exports = new Notifier();
