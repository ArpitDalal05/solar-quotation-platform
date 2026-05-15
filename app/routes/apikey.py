"""API routes for managing API keys"""
from flask import Blueprint, request, jsonify
from app import db
from app.models import APIKey, User
from datetime import datetime, timedelta

apikey_bp = Blueprint('apikey', __name__, url_prefix='/api/apikeys')


@apikey_bp.route('/generate', methods=['POST'])
def generate_api_key():
    """
    Generate a new API key
    
    Request body:
    {
        "name": "Mobile App",
        "user_id": 1,
        "expires_in_days": 365
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({'error': 'Missing "name" field'}), 400
        
        user_id = data.get('user_id')
        expires_in_days = data.get('expires_in_days')
        
        # Calculate expiration date
        expires_at = None
        if expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        # Create API key
        api_key = APIKey.create_key(
            name=data['name'],
            user_id=user_id,
            expires_at=expires_at
        )
        
        return jsonify({
            'success': True,
            'api_key': api_key.key,
            'name': api_key.name,
            'created_at': api_key.created_at.isoformat(),
            'expires_at': api_key.expires_at.isoformat() if expires_at else None,
            'message': 'Save this key! You won\'t see it again.'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@apikey_bp.route('/list', methods=['GET'])
def list_api_keys():
    """List all API keys for a user"""
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Missing user_id parameter'}), 400
        
        # Get keys for user
        keys = APIKey.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'success': True,
            'api_keys': [
                {
                    'id': key.id,
                    'name': key.name,
                    'key_preview': key.key[:8] + '...',  # Show only first 8 chars
                    'is_active': key.is_active,
                    'created_at': key.created_at.isoformat(),
                    'last_used': key.last_used.isoformat() if key.last_used else None,
                    'expires_at': key.expires_at.isoformat() if key.expires_at else None
                }
                for key in keys
            ]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@apikey_bp.route('/<int:key_id>/deactivate', methods=['PUT'])
def deactivate_api_key(key_id):
    """Deactivate an API key"""
    try:
        api_key = APIKey.query.get(key_id)
        
        if not api_key:
            return jsonify({'error': 'API key not found'}), 404
        
        api_key.is_active = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'API key deactivated'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@apikey_bp.route('/<int:key_id>/delete', methods=['DELETE'])
def delete_api_key(key_id):
    """Delete an API key"""
    try:
        api_key = APIKey.query.get(key_id)
        
        if not api_key:
            return jsonify({'error': 'API key not found'}), 404
        
        db.session.delete(api_key)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'API key deleted'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
