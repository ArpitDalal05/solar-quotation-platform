"""
Solar irradiance data service using OpenWeatherMap API
Fetches real-time solar radiation data for accurate calculations
"""
import requests
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class SolarDataService:
    """Service to fetch real-time solar irradiance data"""
    
    OPENWEATHER_SOLAR_URL = "https://api.openweathermap.org/solar/v1/radiation"
    OPENWEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"
    
    # In-memory cache with 24-hour expiration
    _cache = {}
    _cache_expiry = {}
    
    # Hardcoded Indian city coordinates (fallback)
    INDIAN_CITIES = {
        'bangalore': {'lat': 12.97, 'lon': 77.59},
        'delhi': {'lat': 28.70, 'lon': 77.10},
        'mumbai': {'lat': 19.08, 'lon': 72.88},
        'chennai': {'lat': 13.09, 'lon': 80.27},
        'kolkata': {'lat': 22.57, 'lon': 88.36},
        'pune': {'lat': 18.52, 'lon': 73.86},
        'hyderabad': {'lat': 17.37, 'lon': 78.47},
        'jaipur': {'lat': 26.91, 'lon': 75.78},
        'ahmedabad': {'lat': 23.03, 'lon': 72.58},
        'lucknow': {'lat': 26.85, 'lon': 80.95},
        'kochi': {'lat': 9.93, 'lon': 76.26},
        'indore': {'lat': 22.72, 'lon': 75.84},
        'bhopal': {'lat': 23.18, 'lon': 77.41},
        'chandigarh': {'lat': 30.76, 'lon': 76.78},
        'visakhapatnam': {'lat': 17.69, 'lon': 83.20},
    }
    
    @classmethod
    def get_solar_irradiance(cls, latitude, longitude, api_key=None):
        """
        Get solar irradiance data for a location
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            api_key: OpenWeatherMap API key (optional, uses env var if not provided)
        
        Returns:
            {
                'irradiance': float,  # Current irradiance in W/m²
                'daily_irradiance': float,  # Expected daily in kWh/m²
                'source': 'openweathermap' or 'fallback',
                'timestamp': str (ISO format),
                'cached': bool
            }
        """
        
        # Generate cache key
        cache_key = f"{latitude:.2f}_{longitude:.2f}"
        
        # Check cache (24-hour expiration)
        if cache_key in cls._cache:
            if datetime.utcnow() < cls._cache_expiry.get(cache_key, datetime.min):
                logger.info(f"Returning cached solar data for {cache_key}")
                return {**cls._cache[cache_key], 'cached': True}
        
        # Get API key
        if not api_key:
            api_key = os.getenv('OPENWEATHER_API_KEY')
        
        # Try to fetch from API
        if api_key:
            try:
                data = cls._fetch_from_api(latitude, longitude, api_key)
                if data:
                    # Cache for 24 hours
                    cls._cache[cache_key] = data
                    cls._cache_expiry[cache_key] = datetime.utcnow() + timedelta(days=1)
                    logger.info(f"Fetched real data for {cache_key}: {data['daily_irradiance']} kWh/m²/day")
                    return {**data, 'cached': False}
            except Exception as e:
                logger.warning(f"Failed to fetch from OpenWeatherMap: {str(e)}")
        
        # Fallback to latitude-based values
        return cls._get_fallback_irradiance(latitude, longitude)
    
    @staticmethod
    def _fetch_from_api(latitude, longitude, api_key):
        """
        Fetch solar irradiance from OpenWeatherMap Solar Radiation API
        
        API Documentation:
        https://openweathermap.org/api/solar-radiation
        
        Returns:
            Dict with irradiance data or None if failed
        """
        try:
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': api_key
            }
            
            response = requests.get(
                SolarDataService.OPENWEATHER_SOLAR_URL,
                params=params,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Current irradiance in W/m²
                current_irradiance = data.get('irradiance', 0)
                
                # Convert W/m² to kWh/m²/day
                # Assume 12 peak sun hours per day on average
                daily_irradiance = (current_irradiance * 12) / 1000
                
                return {
                    'irradiance': current_irradiance,
                    'daily_irradiance': round(daily_irradiance, 2),
                    'source': 'openweathermap',
                    'timestamp': datetime.utcnow().isoformat()
                }
            else:
                logger.error(f"OpenWeatherMap API error: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            return None
    
    @staticmethod
    def _get_fallback_irradiance(latitude, longitude):
        """
        Return default irradiance values based on latitude
        Used as fallback when API is unavailable
        
        Solar irradiance varies by latitude:
        - Equator (0°): ~6.5 kWh/m²/day
        - Tropics (±23°): ~6.0 kWh/m²/day
        - Temperate (±35-45°): ~5.0 kWh/m²/day
        - Far north/south (±50+°): ~3.5 kWh/m²/day
        
        Returns: kWh/m²/day
        """
        
        abs_lat = abs(latitude)
        
        if abs_lat < 10:
            daily_irradiance = 6.5  # Equatorial region
        elif abs_lat < 25:
            daily_irradiance = 6.0  # Tropical region (covers most of India)
        elif abs_lat < 40:
            daily_irradiance = 5.0  # Temperate region
        else:
            daily_irradiance = 3.5  # Far north/south
        
        return {
            'irradiance': None,
            'daily_irradiance': daily_irradiance,
            'source': 'fallback',
            'timestamp': datetime.utcnow().isoformat(),
            'note': 'Using latitude-based fallback (API unavailable)'
        }
    
    @classmethod
    def get_irradiance_for_city(cls, city_name, api_key=None):
        """
        Get solar irradiance for a city by name
        
        Args:
            city_name: City name (e.g., "Bangalore, India")
            api_key: OpenWeatherMap API key
        
        Returns:
            Solar irradiance data dict
        """
        
        # Try to geocode the city using API
        lat, lon = cls._geocode_city(city_name, api_key)
        
        if lat and lon:
            return cls.get_solar_irradiance(lat, lon, api_key)
        
        # Fallback: use hardcoded coordinates for known Indian cities
        city_key = city_name.lower().split(',')[0].strip()
        
        if city_key in cls.INDIAN_CITIES:
            coords = cls.INDIAN_CITIES[city_key]
            return cls.get_solar_irradiance(coords['lat'], coords['lon'], api_key)
        
        # Default to Bangalore if city not found
        logger.warning(f"City '{city_name}' not found, using Bangalore as default")
        return cls.get_solar_irradiance(12.97, 77.59, api_key)
    
    @staticmethod
    def _geocode_city(city_name, api_key=None):
        """
        Convert city name to coordinates using OpenWeatherMap Geocoding API
        
        Returns:
            (latitude, longitude) tuple or (None, None) if failed
        """
        try:
            if not api_key:
                api_key = os.getenv('OPENWEATHER_API_KEY')
            
            if not api_key:
                return None, None
            
            params = {
                'q': city_name,
                'limit': 1,
                'appid': api_key
            }
            
            response = requests.get(
                SolarDataService.OPENWEATHER_GEO_URL,
                params=params,
                timeout=5
            )
            
            if response.status_code == 200 and response.json():
                data = response.json()[0]
                logger.info(f"Geocoded '{city_name}' to ({data['lat']}, {data['lon']})")
                return data['lat'], data['lon']
            
        except Exception as e:
            logger.warning(f"Geocoding failed for '{city_name}': {str(e)}")
        
        return None, None
    
    @classmethod
    def clear_cache(cls):
        """Clear all cached data (useful for testing or manual refresh)"""
        cls._cache.clear()
        cls._cache_expiry.clear()
        logger.info("Solar data cache cleared")
    
    @classmethod
    def get_cache_stats(cls):
        """Get cache statistics"""
        return {
            'cached_locations': len(cls._cache),
            'cache_keys': list(cls._cache.keys())
        }
