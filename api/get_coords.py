import sys
import json
import requests
from geopy.geocoders import Nominatim

sys.stdout.reconfigure(encoding="utf-8")

geolocator = Nominatim(user_agent="my_travel_app_v2")


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
            or address.get("municipality")
            or city_name.split(",")[0]
        )
        country_code = address.get("country_code", "").upper()

        temp, desc = 0, "no data"

        api_key = "2e862bb925197a53dc057a3be363d2ab"
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
            "lat": lat,
            "lng": lng,
            "temp": temp,
            "desc": desc,
        }
    except Exception as e:
        return {"error": str(e)}


print(json.dumps(get_data(), ensure_ascii=True))
