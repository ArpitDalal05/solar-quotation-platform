"""API routes for calculations"""
from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Calculation
from app.utils.calculator import SolarCalculator
from app.utils.solar_data import SolarDataService

calculation_bp = Blueprint('calculation', __name__, url_prefix='/api/calculations')

@calculation_bp.route('/create', methods=['POST'])
def create_calculation():
    """Create a new solar calculation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'name', 'monthly_consumption', 'roof_area', 
                          'location', 'roof_type', 'installation_type', 'grid_type']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Get or create user
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            user = User(
                email=data['email'],
                name=data['name'],
                phone=data.get('phone'),
                location=data.get('location')
            )
            db.session.add(user)
            db.session.commit()
        
        # Create calculation
        calculation = Calculation(
            user_id=user.id,
            monthly_consumption=float(data['monthly_consumption']),
            roof_area=float(data['roof_area']),
            building_height=float(data.get('building_height', 0)),
            location=data['location'],
            roof_type=data['roof_type'],
            installation_type=data['installation_type'],
            grid_type=data['grid_type']
        )
        
        # Perform calculations
        system_capacity_kw = SolarCalculator.calculate_system_capacity(
            calculation.monthly_consumption
        )
        num_panels = SolarCalculator.calculate_panel_count(system_capacity_kw)
        space_util = SolarCalculator.calculate_space_utilization(
            num_panels, calculation.roof_area
        )
        
        # Get real solar irradiance data from OpenWeatherMap
        solar_data = SolarDataService.get_irradiance_for_city(
            calculation.location
        )
        irradiance = solar_data['daily_irradiance']
        solar_source = solar_data['source']
        
        # Use real irradiance for more accurate generation calculations
        annual_generation = SolarCalculator.calculate_annual_generation(
            system_capacity_kw, irradiance
        )
        annual_savings = SolarCalculator.calculate_annual_savings(annual_generation)
        cost_breakdown = SolarCalculator.calculate_total_cost(
            system_capacity_kw, calculation.installation_type, calculation.grid_type
        )
        payback_period = SolarCalculator.calculate_payback_period(
            cost_breakdown['total_cost'], annual_savings
        )
        feasibility = SolarCalculator.assess_feasibility(
            space_util, system_capacity_kw, calculation.roof_type
        )
        
        # Store results
        calculation.results = {
            'system_capacity_kw': system_capacity_kw,
            'num_panels': num_panels,
            'space_utilization_percent': space_util,
            'solar_irradiance_kwh_m2_day': irradiance,
            'solar_data_source': solar_source,
            'annual_generation_kwh': annual_generation,
            'annual_savings': annual_savings,
            'cost_breakdown': cost_breakdown,
            'payback_period_years': payback_period,
            'feasibility': feasibility
        }
        
        db.session.add(calculation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'calculation_id': calculation.id,
            'results': calculation.results
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@calculation_bp.route('/<int:calculation_id>', methods=['GET'])
def get_calculation(calculation_id):
    """Get calculation details"""
    calculation = Calculation.query.get(calculation_id)
    if not calculation:
        return jsonify({'error': 'Calculation not found'}), 404
    
    return jsonify(calculation.to_dict()), 200

@calculation_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_calculations(user_id):
    """Get all calculations for a user"""
    calculations = Calculation.query.filter_by(user_id=user_id).all()
    return jsonify([c.to_dict() for c in calculations]), 200
