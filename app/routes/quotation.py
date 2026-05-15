"""API routes for quotations"""
from flask import Blueprint, request, jsonify, send_file
from app import db
from app.models import Quotation, Calculation, User
from app.utils.pdf_generator import QuotationPDFGenerator
from datetime import datetime
import os

quotation_bp = Blueprint('quotation', __name__, url_prefix='/api/quotations')

@quotation_bp.route('/generate', methods=['POST'])
def generate_quotation():
    """Generate quotation from calculation"""
    try:
        data = request.get_json()
        calculation_id = data.get('calculation_id')
        
        if not calculation_id:
            return jsonify({'error': 'calculation_id is required'}), 400
        
        calculation = Calculation.query.get(calculation_id)
        if not calculation:
            return jsonify({'error': 'Calculation not found'}), 404
        
        # Generate quotation number
        quotation_count = Quotation.query.filter_by(user_id=calculation.user_id).count() + 1
        quotation_number = f"QT-{calculation.user_id:04d}-{quotation_count:03d}-{datetime.now().strftime('%Y%m%d')}"
        
        # Create quotation
        results = calculation.results
        quotation = Quotation(
            user_id=calculation.user_id,
            calculation_id=calculation.id,
            quotation_number=quotation_number,
            system_capacity_kw=results['system_capacity_kw'],
            number_of_panels=results['num_panels'],
            space_utilization_percent=results['space_utilization_percent'],
            total_cost=results['cost_breakdown']['total_cost'],
            cost_breakdown=results['cost_breakdown'],
            annual_generation_kwh=results['annual_generation_kwh'],
            payback_period_years=results['payback_period_years'],
            annual_savings=results['annual_savings'],
            feasible=results['feasibility']['feasible']
        )
        
        db.session.add(quotation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'quotation_id': quotation.id,
            'quotation': quotation.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quotation_bp.route('/<int:quotation_id>/pdf', methods=['GET'])
def download_quotation_pdf(quotation_id):
    """Download quotation as PDF"""
    try:
        quotation = Quotation.query.get(quotation_id)
        if not quotation:
            return jsonify({'error': 'Quotation not found'}), 404
        
        user = User.query.get(quotation.user_id)
        calculation = Calculation.query.get(quotation.calculation_id)
        
        # Generate PDF
        pdf_filename = f"quotation_{quotation.quotation_number}.pdf"
        pdf_path = os.path.join('/tmp', pdf_filename)
        
        QuotationPDFGenerator.generate_quotation_pdf(
            quotation.to_dict(),
            user.to_dict(),
            calculation.to_dict(),
            pdf_path
        )
        
        # Update quotation with PDF path
        quotation.pdf_path = pdf_path
        quotation.status = 'finalized'
        db.session.commit()
        
        return send_file(pdf_path, as_attachment=True, download_name=pdf_filename), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quotation_bp.route('/<int:quotation_id>', methods=['GET'])
def get_quotation(quotation_id):
    """Get quotation details"""
    quotation = Quotation.query.get(quotation_id)
    if not quotation:
        return jsonify({'error': 'Quotation not found'}), 404
    
    return jsonify(quotation.to_dict()), 200

@quotation_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_quotations(user_id):
    """Get all quotations for a user"""
    quotations = Quotation.query.filter_by(user_id=user_id).all()
    return jsonify([q.to_dict() for q in quotations]), 200
