"""Routes module"""
from .calculation import calculation_bp
from .quotation import quotation_bp
from .admin import admin_bp
from .apikey import apikey_bp
from .solardata import solardata_bp

__all__ = ['calculation_bp', 'quotation_bp', 'admin_bp', 'apikey_bp', 'solardata_bp']
