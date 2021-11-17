#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
© Copyright 2015-2016, 3D Robotics.
simple_goto.py: GUIDED mode "simple goto" example (Copter Only)

Demonstrates how to arm and takeoff in Copter and how to navigate to points using Vehicle.simple_goto.

Full documentation is provided at http://python.dronekit.io/examples/simple_goto.html
"""

from __future__ import print_function
import time
from dronekit import connect, VehicleMode, LocationGlobalRelative
from pymongo import MongoClient


def arm_and_takeoff(aTargetAltitude):
    """
    Arms vehicle and fly to aTargetAltitude.
    """

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
    vehicle.simple_takeoff(aTargetAltitude)  # Take off to target altitude

    # Wait until the vehicle reaches a safe height before processing the goto
    #  (otherwise the command after Vehicle.simple_takeoff will execute
    #   immediately).
    while True:
        print(" Altitude: ", vehicle.location.global_relative_frame.alt)
        # Break and return from function just below target altitude.
        if vehicle.location.global_relative_frame.alt >= aTargetAltitude * 0.95:
            print("Reached target altitude")
            break
        time.sleep(1)

def launch_drone(targetId):
    #Connect to DB
    client = MongoClient('mongodb://127.0.0.1:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')    
    if client:
        result = client['opendatacam']['app'].find_one(
            {
                'id': 'calculated_gps', 
                'trackedItemId': targetId
            },
            {
                "_id":0,
                "coordinates":1
            }
        )
        if result:
            print('There are coordinates Lat:',result['coordinates']['lat'],'Lon:',result['coordinates']['lon'])

            # Connect to the Vehicle
            vehicle = connect('127.0.0.1', wait_ready=True)
            arm_and_takeoff(10)

            print("Set default/target airspeed to 3")
            vehicle.airspeed = 3

            print("Going to target now ...")
            point1 = LocationGlobalRelative(result['coordinates']['lat'], result['coordinates']['lon'], 60)
            vehicle.simple_goto(point1)

            # Close vehicle object before exiting script
            print("Close vehicle object")
            vehicle.close()

def main():
    #process command line arguments
    targetId = 0
    res = launch_drone(targetId)
    print(res)

if __name__ == "__main__":
    main()