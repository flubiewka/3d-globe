import sys
import json
import requests
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="travel_app")

if len(sys.argv) >= 2:
    city_name = sys.argv[1]
    location = geolocator.geocode(city_name)

    if location:
        lat = location.latitude
        lng = location.longitude

        api_key = "b7793540092c72477148972e259b316f"
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&units=metric&lang=ru&appid={api_key}"

        try:
            w = requests.get(url).json()
            temp = round(w["main"]["temp"])
            desc = w["weather"][0]["description"]
        except Exception as e:
            temp = 0
            desc = e

        print(json.dumps({"lat": lat, "lng": lng, "temp": temp, "desc": desc}))
    else:
        print(json.dumps({"error": "not found"}))
else:
    print(json.dumps({"error": "enter city name"}))
