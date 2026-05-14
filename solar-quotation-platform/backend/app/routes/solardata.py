"""API routes for solar data"""
from flask import Blueprint, request, jsonify
from app.utils.solar_data import SolarDataService

solardata_bp = Blueprint('solardata', __name__, url_prefix='/api/solar')


@solardata_bp.route('/irradiance', methods=['GET'])
def get_irradiance():
    """
    Get solar irradiance data for a location
    
    Query parameters:
    - city: City name (e.g., "Bangalore, India")
    - lat: Latitude (alternative to city)
    - lon: Longitude (alternative to city)
    
    Example:
    GET /api/solar/irradiance?city=Bangalore
    GET /api/solar/irradiance?lat=12.97&lon=77.59
    """
    try:
        city = request.args.get('city')
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        
        if not city and (lat is None or lon is None):
            return jsonify({
                'error': 'Provide either "city" or both "lat" and "lon" parameters'
            }), 400
        
        if city:
            # Get data by city name
            data = SolarDataService.get_irradiance_for_city(city)
        else:
            # Get data by coordinates
            data = SolarDataService.get_solar_irradiance(lat, lon)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@solardata_bp.route('/irradiance/batch', methods=['POST'])
def get_irradiance_batch():
    """
    Get solar irradiance for multiple locations
    
    Request body:
    {
        "locations": [
            {"city": "Bangalore"},
            {"lat": 12.97, "lon": 77.59},
            {"city": "Delhi"}
        ]
    }
    """
    try:
        data = request.get_json()
        locations = data.get('locations', [])
        
        if not locations:
            return jsonify({'error': 'No locations provided'}), 400
        
        results = []
        for loc in locations:
            if 'city' in loc:
                irradiance = SolarDataService.get_irradiance_for_city(loc['city'])
            elif 'lat' in loc and 'lon' in loc:
                irradiance = SolarDataService.get_solar_irradiance(loc['lat'], loc['lon'])
            else:
                continue
            
            results.append({
                'location': loc,
                'irradiance': irradiance
            })
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@solardata_bp.route('/cache-stats', methods=['GET'])
def cache_stats():
    """Get solar data cache statistics"""
    stats = SolarDataService.get_cache_stats()
    
    return jsonify({
        'success': True,
        'cache_stats': stats
    }), 200


@solardata_bp.route('/cache-clear', methods=['POST'])
def clear_cache():
    """Clear solar data cache"""
    SolarDataService.clear_cache()
    
    return jsonify({
        'success': True,
        'message': 'Cache cleared'
    }), 200


@solardata_bp.route('/cities', methods=['GET'])
def get_supported_cities():
    """Get list of supported Indian cities with hardcoded coordinates"""
    cities = SolarDataService.INDIAN_CITIES
    
    return jsonify({
        'success': True,
        'count': len(cities),
        'cities': [
            {
                'name': name.title(),
                'coordinates': coords
            }
            for name, coords in cities.items()
        ]
    }), 200
