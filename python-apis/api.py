# A very simple Flask Hello World app for you to get started with...

from flask import Flask
from flask_restful import Api, Resource, request, reqparse

app = Flask(__name__)
api=Api(app)

@app.route('/')
def hello_world():
    return 'Hello from Flask!'


#path = '/home/johnabsher/mysite'
#if path not in sys.path:
#   sys.path.append(path)

#from flask_app import app as application

import json
import boto3
import imp
import pandas as pd

parser = reqparse.RequestParser()
parser.add_argument('lat')
parser.add_argument('lon')

filename='.credentials'
f = open(filename)
cfg = imp.load_source('data', '', f)
f.close()

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
        #jsdat=self.__add_default__(jsdat)
        response = clt.publish(
            TopicArn=tarn,
            #TargetArn='',
            #PhoneNumber='18649063607',	
            Message=jsdat,
            Subject='disaster_sighting',
            MessageStructure='string',
            #MessageAttributes={
            #    'json': {
            #        'DataType': 'string',
            #        'StringValue': 'string',
            #        'BinaryValue': b'bytes'
            #    }
            #}
        )
        return((response, jsdat))

    def __add_default__(self, js):
        jst=json.loads(js)
        if 'default' not in jst.keys():
            jst['default']='blank_message'
        jst=json.dumps(jst)
        with open("sent_internal.log", "a") as file:
            file.write(jst+'\n')
        return(jst)

    def push(self, js):
        return(self.__push_msg__(self.client, js, self.topic_arn))

msg=push_msg(cfg.region_name, cfg.key_id, cfg.secret_key, cfg.arn)

sample_data=json.JSONEncoder().encode({
            "disaster": {
                "lat": 0,
                "lon": 0,
                "type": 'sample'
                }
            })

from geopy import distance as distance
def getclosest(lat, lon):
    fires=pd.read_csv("https://firms.modaps.eosdis.nasa.gov/active_fire/viirs/text/VNP14IMGTDL_NRT_USA_contiguous_and_Hawaii_24h.csv")
    fires['gc_dist']=fires[['latitude','longitude']].apply(lambda x: distance.distance((lat, lon),(x[0],x[1])).km, axis=1)
    nearest=fires['gc_dist'].min()
    n_fire=fires[fires.gc_dist==nearest]
    return(nearest)

#@app.route('/notify')
class notify(Resource):
    def get(self):
        return(msg.push(sample_data))
    def post(self):
        data=json.dumps(request.json)
        with open("sent.log", "a") as file:
            file.write(data+'\n')
        return(msg.push(data), 201)

class nearest(Resource):
    def get(self):
        args = parser.parse_args()
        print(args)
        return(getclosest(args['lat'],args['lon']))

##
## Actually setup the Api resource routing here
##
api.add_resource(notify, '/notify')
api.add_resource(nearest, '/nearest')

if __name__ == '__main__':
    app.run(debug=True)
