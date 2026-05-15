import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    
    # Solar constants
    PANEL_WATTAGE = 400  # Watts per panel
    PANEL_AREA = 2  # Square meters per panel
    SYSTEM_EFFICIENCY = 0.75  # 75% system efficiency
    
    # Cost parameters (can be updated via admin panel)
    COST_PER_WATT = 80  # INR per watt
    INSTALLATION_COST_MULTIPLIER = 0.1  # 10% of system cost
    MAINTENANCE_ANNUAL_PERCENTAGE = 0.02  # 2% of system cost annually
    
    # Solar irradiance (kWh/m²/day) - average values
    IRRADIANCE_DATA = {
        'default': 5.0,  # Default solar irradiance
        'high': 6.5,     # High irradiance regions
        'medium': 5.0,   # Medium irradiance regions
        'low': 3.5       # Low irradiance regions
    }

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///solar_quotation.db'
    )

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
