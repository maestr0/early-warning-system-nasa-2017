// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
var notifier = require('../notifier');


if (!AWS.config.region) {
    AWS.config.update({
        region: 'eu-west-1'
    });
}

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var queueURL = "https://sqs.us-east-1.amazonaws.com/611519595603/status_notifications_nasa";

var params = {
    AttributeNames: [
        "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
        "All"
    ],
    QueueUrl: queueURL,
    VisibilityTimeout: 0,
    WaitTimeSeconds: 2
};

function deleteMessageFromSqs(Message) {
    var deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: Message.ReceiptHandle
    };
    sqs.deleteMessage(deleteParams, function (err, data) {
        if (err) {
            console.log("Delete Error", err);
        } else {
            console.log("Message Deleted", data);
        }
    });
}

function Worker() {
};

function sendSMSALert(msg) {
    notifier.sendSms(msg, [], function (error, message) {
        if (error) {
            console.error(error.message);
        } else {
            console.log('notification sent: ' + message);
        }
    });
}
function processMessage(payload) {
    var message = JSON.parse(payload.Body).Message;
    console.log("Message: " + message);

    try {
        var m = JSON.parse(message);
        if (m.Status) {
            sendSMSALert(m.StatusDescription);
        } else {
            //sendSMSALert('No warnings in your area.');
        }
    } catch (e) {
        console.error("Unsupported message format: " + message);
    }
}

Worker.prototype.process = function () {
    console.log("Checking for SQS messages...");
    sqs.receiveMessage(params, function (err, data) {
        if (err) {
            console.log("Receive Error", err);
        } else {

            if (data.Messages && data.Messages.length > 0) {
                data.Messages.forEach(function (Message) {
                    processMessage(Message);
                    deleteMessageFromSqs(Message);
                });
            } else {
                console.log("Empty SQS response.");
            }
        }
    });
}

Worker.prototype.start = function () {
    console.log("SQS worker started.");
    setInterval(this.process, 5 * 1000);
};

module.exports = new Worker();
