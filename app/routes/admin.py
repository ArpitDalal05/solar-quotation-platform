"""Admin routes"""
from flask import Blueprint, request, jsonify
from app import db
from app.models import CostParameter

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/cost-parameters', methods=['GET'])
def get_cost_parameters():
    """Get all cost parameters"""
    params = CostParameter.query.all()
    return jsonify([p.to_dict() for p in params]), 200

@admin_bp.route('/cost-parameters', methods=['POST'])
def create_cost_parameter():
    """Create or update a cost parameter"""
    try:
        data = request.get_json()
        
        # Check if parameter exists
        param = CostParameter.query.filter_by(key=data['key']).first()
        
        if param:
            param.value = float(data['value'])
            param.description = data.get('description', param.description)
            param.unit = data.get('unit', param.unit)
        else:
            param = CostParameter(
                key=data['key'],
                value=float(data['value']),
                description=data.get('description'),
                unit=data.get('unit')
            )
            db.session.add(param)
        
        db.session.commit()
        return jsonify(param.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/cost-parameters/<int:param_id>', methods=['PUT'])
def update_cost_parameter(param_id):
    """Update a cost parameter"""
    try:
        param = CostParameter.query.get(param_id)
        if not param:
            return jsonify({'error': 'Parameter not found'}), 404
        
        data = request.get_json()
        param.value = float(data.get('value', param.value))
        param.description = data.get('description', param.description)
        param.unit = data.get('unit', param.unit)
        
        db.session.commit()
        return jsonify(param.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/cost-parameters/<int:param_id>', methods=['DELETE'])
def delete_cost_parameter(param_id):
    """Delete a cost parameter"""
    try:
        param = CostParameter.query.get(param_id)
        if not param:
            return jsonify({'error': 'Parameter not found'}), 404
        
        db.session.delete(param)
        db.session.commit()
        return jsonify({'success': True}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
