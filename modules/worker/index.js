// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

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
    WaitTimeSeconds: 20
};

function deleteMessageFromSqs(data) {
    var deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
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

Worker.prototype.process = function () {
    console.log("Checking for SQS messages...");
    sqs.receiveMessage(params, function (err, data) {
        if (err) {
            console.log("Receive Error", err);
        } else {

            if (data.Messages && data.Messages.length > 0) {
                deleteMessageFromSqs(data);
            }
        }
    });
}

Worker.prototype.start = function () {
    console.log("SQS worker started.");
    setInterval(this.process, 5 * 1000);
};

module.exports = new Worker();
