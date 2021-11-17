from pymongo import MongoClient
from datetime import datetime
from ciso8601 import parse_datetime
from time import sleep

def launch_drone(targetId):
    #Connect to DB
    client = MongoClient('mongodb://127.0.0.1:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')    
    if client:
        result = getCurrentLatLon(client,targetId)
        if result:
            print('There are coordinates Lat:',result['coordinates']['lat'],'Lon:',result['coordinates']['lon'])  
            
            #lets see if the result timestamp is newer than the last 15 seconds as it should be updated every 33ms
            while  parse_datetime(result['timestamp']) > (datetime.now() - datetime.timedelta(seconds=15)):
                print("Going to target now ...")
                #insert drone code here about launching and going to the target
                #goTo(result['coordinates']['lat],result['coordinates']['lon'],60)

                sleep(10) #lets sleep for testing
                #requery db
                result = getCurrentLatLon(client,targetId)
            
            #while condition is no longer valid put drone in position hold and rely on failsafes for RTL and end script

def getCurrentLatLon(client,targetId):
    return client['opendatacam']['app'].find_one(
            {
                'id': 'calculated_gps', 
                'trackedItemId': targetId
            },
            {
                "_id":0,
                "coordinates":1,
                "timestamp": 1
            }
        )               
     
def main():
    #process command line arguments
    targetId = 0
    res = launch_drone(targetId)
    print(res)

if __name__ == "__main__":
    main()