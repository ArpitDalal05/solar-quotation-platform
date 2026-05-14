"""API Key model for authentication"""
import secrets
from datetime import datetime
from app import db


class APIKey(db.Model):
    """Store API keys for external integrations"""
    __tablename__ = 'api_keys'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., "Mobile App", "Partner XYZ"
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_used = db.Column(db.DateTime)
    expires_at = db.Column(db.DateTime)  # Optional expiration
    
    # Relationships
    user = db.relationship('User', backref='api_keys')
    
    @staticmethod
    def generate_key():
        """Generate a random API key"""
        return secrets.token_urlsafe(32)
    
    @classmethod
    def create_key(cls, name, user_id=None, expires_at=None):
        """Create a new API key"""
        api_key = cls(
            key=cls.generate_key(),
            name=name,
            user_id=user_id,
            expires_at=expires_at
        )
        db.session.add(api_key)
        db.session.commit()
        return api_key
    
    @classmethod
    def validate_key(cls, key):
        """Validate an API key and update last_used"""
        api_key = cls.query.filter_by(key=key, is_active=True).first()
        
        if not api_key:
            return None
        
        # Check expiration
        if api_key.expires_at and datetime.utcnow() > api_key.expires_at:
            return None
        
        # Update last used
        api_key.last_used = datetime.utcnow()
        db.session.commit()
        
        return api_key
    
    def __repr__(self):
        return f'<APIKey {self.name}>'
