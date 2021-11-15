import numpy as np
import PixelMapper

def convertCoordinates(tr_x,tr_y,tl_x,tl_y,bl_x,bl_y,br_x,br_y,tr_lat,tr_lon,tl_lat,tl_lon,bl_lat,bl_lon,br_lat,br_lon,target_x,target_y):
    quad_coords = {
        "lonlat": np.array([
            [tr_lat,tr_lon], # top right
            [tl_lat,tl_lon], # top left
            [bl_lat,bl_lon], # bottom left
            [br_lat,br_lon] # bottom right
        ]),
        "pixel": np.array([
            [tr_x,tr_y], # top right
            [tl_x,tl_y], # top left
            [bl_x,bl_y], # bottom left
            [br_x,br_y] # bottom right
        ])
    }
    pm = PixelMapper(quad_coords["pixel"], quad_coords["lonlat"])
    #pm = PixelMapper(np.array([[tr_lat,tr_lon],[tl_lat,tl_lon],[bl_lat,bl_lon],[br_lat,br_lon]]),np.array([[tr_x,tr_y],[tl_x,tl_y],[bl_x,bl_y],[br_x,br_y]]))

    #uv_0 = (target_x,target_y) 
    #lonlat_0 = pm.pixel_to_lonlat(uv_0)
    lonlat_0 = pm.testItWorks(target_x)

    #lonlat_1 = (6.603361, 52.036639)
    #uv_1 = pm.lonlat_to_pixel(lonlat_1)
    return lonlat_0

def main():
    #process command line arguments
    tr_x = 0
    tr_y = 0
    tl_x = 0
    tl_y = 0
    bl_x = 0
    bl_y = 0
    br_x = 0
    br_y = 0
    tr_lat = 0
    tr_lon = 0
    tl_lat = 0
    tl_lon = 0
    bl_lat = 0
    bl_lon = 0
    br_lat = 0
    br_lon = 0
    target_x = 0
    target_y = 0
    res = convertCoordinates(tr_x,tr_y,tl_x,tl_y,bl_x,bl_y,br_x,br_y,tr_lat,tr_lon,tl_lat,tl_lon,bl_lat,bl_lon,br_lat,br_lon,target_x,target_y)
    print(res)

if __name__ == "__main__":
    main()