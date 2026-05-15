from app import db
from datetime import datetime
import json

class Calculation(db.Model):
    """Solar calculation model"""
    __tablename__ = 'calculations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Input parameters
    monthly_consumption = db.Column(db.Float, nullable=False)  # kWh
    roof_area = db.Column(db.Float, nullable=False)  # sq.m
    building_height = db.Column(db.Float, nullable=True)  # meters
    location = db.Column(db.String(200), nullable=False)
    roof_type = db.Column(db.String(50), nullable=False)  # RCC / Sheet
    installation_type = db.Column(db.String(50), nullable=False)  # Residential / Commercial
    grid_type = db.Column(db.String(50), nullable=False)  # On-grid / Off-grid / Hybrid
    
    # Calculated outputs (stored as JSON)
    results = db.Column(db.JSON, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    quotation = db.relationship('Quotation', backref='calculation', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'monthly_consumption': self.monthly_consumption,
            'roof_area': self.roof_area,
            'building_height': self.building_height,
            'location': self.location,
            'roof_type': self.roof_type,
            'installation_type': self.installation_type,
            'grid_type': self.grid_type,
            'results': self.results,
            'created_at': self.created_at.isoformat()
        }
