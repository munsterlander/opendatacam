from pymongo import MongoClient
from datetime import datetime, timedelta
from time import sleep
import cmath
from dronekit import connect, VehicleMode, LocationGlobalRelative
import time

def launch_drone(targetId):
    #Connect to DB
    client = MongoClient('mongodb://127.0.0.1:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')    
    if client:
        initialLocation = getInitialLatLon(client,targetId)
        if initialLocation:
            print('There are coordinates Lat: %s Lon: %s' % (initialLocation['coordinates']['lat'],initialLocation['coordinates']['lon']))  

            vehicle = connect('127.0.0.1:14551', wait_ready=True,baud=57600)
            vehicle.wait_ready('autopilot_version')
            
            #Initialize Drone
            # Get all vehicle attributes (state)
            print("\nGet all vehicle attribute values:")
            print(" Autopilot Firmware version: %s" % vehicle.version)
            print("   Major version number: %s" % vehicle.version.major)
            print("   Minor version number: %s" % vehicle.version.minor)
            print("   Patch version number: %s" % vehicle.version.patch)
            print("   Release type: %s" % vehicle.version.release_type())
            print("   Release version: %s" % vehicle.version.release_version())
            print("   Stable release?: %s" % vehicle.version.is_stable())
            print(" Autopilot capabilities")
            print("   Supports MISSION_FLOAT message type: %s" % vehicle.capabilities.mission_float)
            print("   Supports PARAM_FLOAT message type: %s" % vehicle.capabilities.param_float)
            print("   Supports MISSION_INT message type: %s" % vehicle.capabilities.mission_int)
            print("   Supports COMMAND_INT message type: %s" % vehicle.capabilities.command_int)
            print("   Supports PARAM_UNION message type: %s" % vehicle.capabilities.param_union)
            print("   Supports ftp for file transfers: %s" % vehicle.capabilities.ftp)
            print("   Supports commanding attitude offboard: %s" % vehicle.capabilities.set_attitude_target)
            print("   Supports commanding position and velocity targets in local NED frame: %s" % vehicle.capabilities.set_attitude_target_local_ned)
            print("   Supports set position + velocity targets in global scaled integers: %s" % vehicle.capabilities.set_altitude_target_global_int)
            print("   Supports terrain protocol / data handling: %s" % vehicle.capabilities.terrain)
            print("   Supports direct actuator control: %s" % vehicle.capabilities.set_actuator_target)
            print("   Supports the flight termination command: %s" % vehicle.capabilities.flight_termination)
            print("   Supports mission_float message type: %s" % vehicle.capabilities.mission_float)
            print("   Supports onboard compass calibration: %s" % vehicle.capabilities.compass_calibration)
            print(" Global Location: %s" % vehicle.location.global_frame)
            print(" Global Location (relative altitude): %s" % vehicle.location.global_relative_frame)
            print(" Local Location: %s" % vehicle.location.local_frame)
            print(" Attitude: %s" % vehicle.attitude)
            print(" Velocity: %s" % vehicle.velocity)
            print(" GPS: %s" % vehicle.gps_0)
            print(" Gimbal status: %s" % vehicle.gimbal)
            print(" Battery: %s" % vehicle.battery)
            print(" EKF OK?: %s" % vehicle.ekf_ok)
            print(" Last Heartbeat: %s" % vehicle.last_heartbeat)
            print(" Rangefinder: %s" % vehicle.rangefinder)
            print(" Rangefinder distance: %s" % vehicle.rangefinder.distance)
            print(" Rangefinder voltage: %s" % vehicle.rangefinder.voltage)
            print(" Heading: %s" % vehicle.heading)
            print(" Is Armable?: %s" % vehicle.is_armable)
            print(" System status: %s" % vehicle.system_status.state)
            print(" Groundspeed: %s" % vehicle.groundspeed)    # settable
            print(" Airspeed: %s" % vehicle.airspeed)    # settable
            print(" Mode: %s" % vehicle.mode.name)    # settable
            print(" Armed: %s" % vehicle.armed)    # settable

            #Send drone to initial location
            print("Basic pre-arm checks")
            # Don't try to arm until autopilot is ready
            while not vehicle.is_armable:
                print(" Waiting for vehicle to initialise...")
                time.sleep(1)

            print("Arming motors")
            # Copter should arm in GUIDED mode
            vehicle.mode = VehicleMode("GUIDED")
            vehicle.armed = True

            # Confirm vehicle armed before attempting to take off
            while not vehicle.armed:
                print(" Waiting for arming...")
                time.sleep(1)

            print("Taking off!")
            vehicle.simple_takeoff(60)

            while True:
                print (" Altitude: ",vehicle.location.global_relative_frame.alt)
                if vehicle.location.global_relative_frame.alt >= 60*0.95:
                    print ("Reached target altitude")
                    break
                time.sleep(1)

            vehicle.airspeed=3 #TODO:  Determine the speed somehow

            #send drone to target
            target = LocationGlobalRelative(initialLocation['coordinates']['lat'],initialLocation['coordinates']['lon'],60)
            vehicle.simple_goto(target)

            while get_distance_meters(vehicle.location.global_frame, target) >=0.25:
                print ("Still going to target")
                time.sleep(1)

            print ("Made it")
            #check for new location of target
            currentLocation = getCurrentLatLon(client,initialLocation['recordingId'],targetId)

            print('There are NEW coordinates Lat: %s Lon: %s' % (currentLocation['objects'][0]['calculated_lat'],currentLocation['objects'][0]['calculated_lon']))  
            if currentLocation:
                #lets see if the result timestamp is newer than the last 15 seconds as it should be updated every 33ms
                while  ((currentLocation['timestamp'] > (datetime.utcnow() - timedelta(seconds=15))) and (not currentLocation['objects'][0]['calculated_lat'] is None and not currentLocation['objects'][0]['calculated_lon'] is None)) :
                    print('There are NEW coordinates Lat: %s Lon: %s and Timestamp is %s with Timedelta %s' % (currentLocation['objects'][0]['calculated_lat'],currentLocation['objects'][0]['calculated_lon'],currentLocation['timestamp'],(datetime.utcnow() - timedelta(seconds=15))))                    
                    target = LocationGlobalRelative(currentLocation['objects']['calculated_lat'],currentLocation['objects']['calculated_lon'],60)
                    vehicle.simple_goto(target)
                    #requery db
                    currentLocation = getCurrentLatLon(client,initialLocation['recordingId'],targetId)
                
            #if or while condition is no longer valid put drone in position hold and rely on failsafes for RTL and end script
            print("Drone will hold position as the vehicle is lost")
            vehicle.mode = VehicleMode("LOITER")
            vehicle.close()

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

def get_distance_meters(origin,destination):
    dlat = destination.lat - origin.lat
    print("Dlat: ",dlat)
    dlon = destination.lon - origin.lon
    print("Dlon: ",dlon)
    return cmath.sqrt((dlat*dlon) + (dlon*dlon)) * 1.113195e5

def main():
    #process command line arguments
    targetId = 0
    res = launch_drone(targetId)
    print(res)

if __name__ == "__main__":
    main()