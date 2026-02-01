import sys
import json
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="travel_app")

if len(sys.argv) >= 2:
    city_name = sys.argv[1]

    location = geolocator.geocode(city_name)

    if location:
        cords = {"lat": location.latitude, "lng": location.longitude}
        print(json.dumps(cords))
    else:
        print(json.dumps({"error": "not found"}))
else:
    print(json.dumps({"error": "enter city name"}))
