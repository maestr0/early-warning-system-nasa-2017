from flask import Flask
from flask_restful import reqparse, abort, Api, Resource, request
import json
import boto3


app = Flask(__name__)
api = Api(app)

#parser = reqparse.RequestParser()
#parser.add_argument('data')

key_id='AKIAJIYXSO4H2LPLEFJA'
secret_key='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'
region_name='us-west-2'
arn='arn:aws:sns:us-west-2:572892346531:natural_disasters'

class push_msg(object):
    def __init__(self, region_name, key_id, secret_key, topic_arn):
        self.region_name=region_name
        self.key_id=key_id
        self.secret_key=secret_key
        self.topic_arn=topic_arn
        self.client=self.__getclient__(self.region_name, self.key_id, self.secret_key)
        
    def __getclient__(self, region_name, key_id, secret_key):
        client = boto3.client('sns'
                          ,region_name=region_name
                          ,aws_access_key_id=key_id
                          ,aws_secret_access_key=secret_key
                     # ,aws_session_token=SESSION_TOKEN
                         )
        return(client)

    def __push_msg__(self, clt, jsdat, tarn):
        response = clt.publish(
            TopicArn=tarn,
            #TargetArn='',
            #PhoneNumber='18649063607',
            Message=self.__add_default__(jsdat),
            Subject='disaster_sighting',
            MessageStructure='json',
            #MessageAttributes={
            #    'json': {
            #        'DataType': 'string',
            #        'StringValue': 'string',
            #        'BinaryValue': b'bytes'
            #    }
            #}
        )
        return(response)
    
    def __add_default__(self, js):
        jst=json.loads(js)
        if 'default' not in jst.keys():
            jst['default']='None'
        jst=json.dumps(jst)
        return(jst)
    
    def push(self, js):
        return(self.__push_msg__(self.client, js, self.topic_arn))
		
msg=push_msg(region_name, key_id, secret_key, arn)

sample_data=json.JSONEncoder().encode({
            "disaster": {
                "lat": 0,
                "lon": 0,
                "type": 'sample'
                }
            })

#@app.route('/notify', methods=['POST'])

class notify(Resource):
    def get(self):
        return(msg.push(sample_data))
    def post(self):
        return(msg.push(json.dumps(request.json)), 201)
		
##
## Actually setup the Api resource routing here
##
api.add_resource(notify, '/notify')
#api.add_resource(Todo, '/todos/<todo_id>')


if __name__ == '__main__':
    app.run(debug=True)
