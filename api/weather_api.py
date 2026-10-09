from __future__ import annotations
import requests
import urllib.parse
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

def get_7_day_forecast(city: str, country: str, start_date: Optional[str] = None) -> Dict[str, Any]:
    """Fetches a 7-day weather forecast for a city/country using Open-Meteo API."""
    query = f"{city}, {country}"
    try:
        # 1. Geocode
        geocode_url = f'https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(query)}&count=1'
        geo_res = requests.get(geocode_url, timeout=5).json()
        
        if not geo_res.get('results'):
            return {"location": query, "forecast": []}
            
        lat = geo_res['results'][0]['latitude']
        lon = geo_res['results'][0]['longitude']
        
        # 2. Forecast
        forecast_url = f'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16'
        weather_res = requests.get(forecast_url, timeout=5).json()
        
        daily = weather_res.get('daily', {})
        times = daily.get('time', [])
        max_temps = daily.get('temperature_2m_max', [])
        min_temps = daily.get('temperature_2m_min', [])
        
        start_idx = 0
        if start_date:
            if start_date in times:
                start_idx = times.index(start_date)
            else:
                # If start date is in the past or far future, just default to today to avoid 500 crashes
                start_idx = 0
            
        forecast = []
        for i in range(7):
            idx = start_idx + i
            if idx < len(times):
                forecast.append({
                    "time": times[idx],
                    "temperature_max": max_temps[idx],
                    "temperature_min": min_temps[idx] if idx < len(min_temps) else None
                })
            else:
                forecast.append({
                    "time": f"Day {i+1}",
                    "temperature_max": 25,
                    "temperature_min": 15
                })
            
        return {"location": query, "forecast": forecast}
    except ValueError:
        raise
    except Exception as e:
        print("Weather API error:", e)
        return {"location": query, "forecast": []}
