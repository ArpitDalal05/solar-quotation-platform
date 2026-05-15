from app import db
from datetime import datetime

class CostParameter(db.Model):
    """Cost parameter model for admin panel"""
    __tablename__ = 'cost_parameters'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(500), nullable=True)
    unit = db.Column(db.String(50), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value,
            'description': self.description,
            'unit': self.unit
        }
