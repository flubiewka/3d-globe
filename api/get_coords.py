import sys
import json
import requests
from geopy.geocoders import Nominatim

sys.stdout.reconfigure(encoding="utf-8")

geolocator = Nominatim(user_agent="travel_app")


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

        display_city = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or city_name
        )
        country = address.get("country", "Unknown")
        country_code = address.get("country_code", "").upper()

        temp, desc = 0, "no data"
        try:
            api_key = "b7793540092c72477148972e259b316f"
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&units=metric&appid={api_key}"
            w = requests.get(url, timeout=3).json()
            temp = round(w["main"]["temp"])
            desc = w["weather"][0]["description"]
        except:
            pass

        return {
            "city": f"{display_city}, {country}",
            "country_code": country_code,
            "lat": lat,
            "lng": lng,
            "temp": temp,
            "desc": desc,
        }
    except Exception as e:
        return {"error": str(e)}


print(json.dumps(get_data(), ensure_ascii=True))
