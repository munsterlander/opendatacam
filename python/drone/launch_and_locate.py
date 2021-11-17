from pymongo import MongoClient
from datetime import datetime
from ciso8601 import parse_datetime
from time import sleep

def launch_drone(targetId):
    #Connect to DB
    client = MongoClient('mongodb://127.0.0.1:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')    
    if client:
        initialLocation = getInitialLatLon(client,targetId)
        if initialLocation:
            print('There are coordinates Lat:',initialLocation['coordinates']['lat'],'Lon:',initialLocation['coordinates']['lon'])  
            
            #Send drone to initial location
            #insert drone code here about launching and going to the target
            #goTo(initialLocation['coordinates']['lat],initialLocation['coordinates']['lon'],60)

            currentLocation = getCurrentLatLon(client,initialLocation['recordingId'],targetId)

            #lets see if the result timestamp is newer than the last 15 seconds as it should be updated every 33ms
            while  ((parse_datetime(currentLocation['timestamp']) > (datetime.now() - datetime.timedelta(seconds=15))) and (not currentLocation['objects']['calculated_lat'] is None and not currentLocation['objects']['calculated_lon'] is None)) :
                print('There are NEW coordinates Lat:',currentLocation['currentLocation']['calculated_lat'],'Lon:',currentLocation['objects']['calculated_lon'])  
                #insert drone code here about going to the target
                #goTo(currentLocation['objects']['calculated_lat'],currentLocation['objects']['calculated_lon'],60)
                
                sleep(1) #lets sleep for testing
                #requery db
                currentLocation = getCurrentLatLon(client,initialLocation['recordingId'],targetId)
            
            #while condition is no longer valid put drone in position hold and rely on failsafes for RTL and end script
            print("Drone will hold position as the vehicle is lost")

def getInitialLatLon(client,targetId):
    return client['opendatacam']['app'].find_one(
            {
                'id': 'calculated_gps', 
                'trackedItemId': targetId
            },
            {
                "_id":0,
                "recordingId":1,
                "coordinates":1
            }
        )   

def getCurrentLatLon(client,recordingId,targetId):
    filter={
        'recordingId': recordingId, 
        'objects': {
            '$elemMatch': {
                'id': targetId, 
                'calculated_lat': {
                    '$exists': True
                }, 
                'calculated_lon': {
                    '$exists': True
                }
            }
        }
    }
    project={
        'timestamp': 1, 
        'objects.$': 1, 
        '_id': 0, 
    }
    sort=list({
        '_id': -1
    }.items())
    limit=1

    return client['opendatacam']['tracker'].find_one(
    filter=filter,
    projection=project,
    sort=sort,
    limit=limit
    )

def main():
    #process command line arguments
    targetId = 0
    res = launch_drone(targetId)
    print(res)

if __name__ == "__main__":
    main()