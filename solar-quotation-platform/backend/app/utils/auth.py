"""Authentication utilities for API key validation"""
from functools import wraps
from flask import request, jsonify
from app.models.api_key import APIKey


def require_api_key(f):
    """Decorator to require valid API key for endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get API key from header
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'error': 'Missing API key. Add X-API-Key header.'}), 401
        
        # Validate key
        key_obj = APIKey.validate_key(api_key)
        
        if not key_obj:
            return jsonify({'error': 'Invalid or expired API key'}), 401
        
        # Pass validated key to the route
        request.api_key = key_obj
        request.user_id = key_obj.user_id
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_api_key_optional(f):
    """Decorator allowing endpoints to work with or without API key"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if api_key:
            key_obj = APIKey.validate_key(api_key)
            if key_obj:
                request.api_key = key_obj
                request.user_id = key_obj.user_id
            else:
                return jsonify({'error': 'Invalid API key'}), 401
        else:
            request.api_key = None
            request.user_id = None
        
        return f(*args, **kwargs)
    
    return decorated_function
