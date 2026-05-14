from app import db
from datetime import datetime

class Quotation(db.Model):
    """Quotation model"""
    __tablename__ = 'quotations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    calculation_id = db.Column(db.Integer, db.ForeignKey('calculations.id'), nullable=False)
    
    # Quotation details
    quotation_number = db.Column(db.String(50), unique=True, nullable=False)
    system_capacity_kw = db.Column(db.Float, nullable=False)
    number_of_panels = db.Column(db.Integer, nullable=False)
    space_utilization_percent = db.Column(db.Float, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)
    
    # Cost breakdown (stored as JSON)
    cost_breakdown = db.Column(db.JSON, nullable=True)
    
    # Estimates
    annual_generation_kwh = db.Column(db.Float, nullable=False)
    payback_period_years = db.Column(db.Float, nullable=False)
    annual_savings = db.Column(db.Float, nullable=False)
    feasible = db.Column(db.Boolean, default=True)
    
    # Status
    status = db.Column(db.String(50), default='generated')  # generated / finalized / rejected
    pdf_path = db.Column(db.String(500), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'quotation_number': self.quotation_number,
            'system_capacity_kw': self.system_capacity_kw,
            'number_of_panels': self.number_of_panels,
            'space_utilization_percent': self.space_utilization_percent,
            'total_cost': self.total_cost,
            'cost_breakdown': self.cost_breakdown,
            'annual_generation_kwh': self.annual_generation_kwh,
            'payback_period_years': self.payback_period_years,
            'annual_savings': self.annual_savings,
            'feasible': self.feasible,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
