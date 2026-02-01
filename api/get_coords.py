import sys
import json
import os
import requests
from geopy.geocoders import Nominatim

sys.stdout.reconfigure(encoding="utf-8")

geolocator = Nominatim(user_agent="my_travel_app_v2")

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if line.startswith("WEATHER_API_KEY="):
                os.environ["WEATHER_API_KEY"] = line.strip().split("=", 1)[1]


def title_case(name):
    if name[0].islower():
        return name[0].upper() + name[1:]
    return name


def get_data():
    if len(sys.argv) < 2:
        return {"error": "no city"}

    city_name = sys.argv[1]
    try:
        location = geolocator.geocode(
            city_name, language="en", addressdetails=True, timeout=10
        )

        if not location:
            return {"error": "not found"}

        lat = location.latitude
        lng = location.longitude
        address = location.raw.get("address", {})

        display_city = title_case(
            address.get("city")
            or address.get("town")
            or address.get("village")
            or location.raw.get("name")
            or city_name.split(",")[0]
        )
        country_code = address.get("country_code", "").upper()
        country_name = address.get("country", "")

        temp, desc = 0, "no data"

        api_key = os.getenv("WEATHER_API_KEY", "")
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&units=metric&appid={api_key}"

        try:
            response = requests.get(weather_url, timeout=5)
            if response.status_code == 200:
                w_data = response.json()
                temp = int(round(w_data["main"]["temp"]))
                desc = w_data["weather"][0]["description"]
            else:
                desc = f"API Error: {response.status_code}"
        except Exception as e:
            desc = f"Conn Error: {str(e)}"

        return {
            "city": display_city,
            "country_code": country_code,
            "country_name": country_name,
            "lat": lat,
            "lng": lng,
            "temp": temp,
            "desc": desc,
        }
    except Exception as e:
        return {"error": str(e)}


print(json.dumps(get_data(), ensure_ascii=True))
