"""
Solar calculation engine
Handles all solar system sizing and cost calculations
"""
from flask import current_app
import math

class SolarCalculator:
    """Core solar calculation engine"""
    
    @staticmethod
    def calculate_system_capacity(monthly_consumption_kwh, days_in_month=30):
        """
        Calculate required system capacity based on monthly consumption
        
        Args:
            monthly_consumption_kwh: Monthly energy consumption in kWh
            days_in_month: Number of days in month (default 30)
        
        Returns:
            Required system capacity in kW
        """
        # Average daily consumption
        daily_consumption = monthly_consumption_kwh / days_in_month
        
        # Average solar irradiance (peak sun hours per day)
        peak_sun_hours = 5  # India average
        
        # System losses factor (accounting for efficiency)
        system_efficiency = current_app.config.get('SYSTEM_EFFICIENCY', 0.75)
        
        # Calculate system capacity
        # System Capacity (kW) = Daily Consumption / (Peak Sun Hours × System Efficiency)
        system_capacity_kw = daily_consumption / (peak_sun_hours * system_efficiency)
        
        return round(system_capacity_kw, 2)
    
    @staticmethod
    def calculate_panel_count(system_capacity_kw):
        """
        Calculate number of solar panels needed
        
        Args:
            system_capacity_kw: System capacity in kW
        
        Returns:
            Number of panels needed
        """
        panel_wattage = current_app.config.get('PANEL_WATTAGE', 400)
        system_capacity_watts = system_capacity_kw * 1000
        
        num_panels = math.ceil(system_capacity_watts / panel_wattage)
        return num_panels
    
    @staticmethod
    def calculate_space_utilization(num_panels, available_area_sqm):
        """
        Calculate space utilization percentage
        
        Args:
            num_panels: Number of panels
            available_area_sqm: Available roof area in square meters
        
        Returns:
            Space utilization percentage
        """
        panel_area = current_app.config.get('PANEL_AREA', 2)  # sq.m per panel
        required_area = num_panels * panel_area
        
        if available_area_sqm == 0:
            return 0
        
        utilization_percent = (required_area / available_area_sqm) * 100
        return round(utilization_percent, 2)
    
    @staticmethod
    def calculate_annual_generation(system_capacity_kw, location_irradiance=5.0):
        """
        Calculate annual energy generation
        
        Args:
            system_capacity_kw: System capacity in kW
            location_irradiance: Average daily solar irradiance (kWh/m²/day)
        
        Returns:
            Annual generation in kWh
        """
        # Peak sun hours equivalent = irradiance value
        peak_sun_hours = location_irradiance
        system_efficiency = current_app.config.get('SYSTEM_EFFICIENCY', 0.75)
        
        # Annual generation = Capacity × Peak Sun Hours × Days × System Efficiency
        annual_generation = (system_capacity_kw * peak_sun_hours * 365 * system_efficiency)
        
        return round(annual_generation, 2)
    
    @staticmethod
    def calculate_total_cost(system_capacity_kw, installation_type='Residential', grid_type='On-grid'):
        """
        Calculate total system cost
        
        Args:
            system_capacity_kw: System capacity in kW
            installation_type: Type of installation
            grid_type: Type of grid connection
        
        Returns:
            Dictionary with cost breakdown
        """
        cost_per_watt = current_app.config.get('COST_PER_WATT', 80)  # INR
        installation_multiplier = current_app.config.get('INSTALLATION_COST_MULTIPLIER', 0.1)
        
        system_cost_watts = system_capacity_kw * 1000
        
        # Base system cost
        base_cost = system_cost_watts * cost_per_watt
        
        # Installation cost (10% of system cost)
        installation_cost = base_cost * installation_multiplier
        
        # Additional costs based on installation type
        additional_cost = 0
        if installation_type == 'Commercial':
            additional_cost = base_cost * 0.05  # 5% additional for commercial
        
        # Grid connection type factors
        grid_factor = 1.0
        if grid_type == 'Hybrid':
            grid_factor = 1.15  # 15% additional for battery backup
        elif grid_type == 'Off-grid':
            grid_factor = 1.25  # 25% additional for battery storage
        
        # Calculate total
        subtotal = (base_cost + installation_cost + additional_cost) * grid_factor
        
        # Add 18% GST (India)
        gst = subtotal * 0.18
        total_cost = subtotal + gst
        
        return {
            'base_cost': round(base_cost, 2),
            'installation_cost': round(installation_cost, 2),
            'additional_cost': round(additional_cost, 2),
            'subtotal_before_grid': round(subtotal / grid_factor, 2),
            'grid_factor_cost': round((subtotal / grid_factor) * (grid_factor - 1), 2),
            'subtotal': round(subtotal, 2),
            'gst': round(gst, 2),
            'total_cost': round(total_cost, 2)
        }
    
    @staticmethod
    def calculate_payback_period(total_cost, annual_savings):
        """
        Calculate payback period
        
        Args:
            total_cost: Total system cost
            annual_savings: Annual electricity savings
        
        Returns:
            Payback period in years
        """
        if annual_savings <= 0:
            return float('inf')
        
        payback_years = total_cost / annual_savings
        return round(payback_years, 2)
    
    @staticmethod
    def calculate_annual_savings(annual_generation_kwh, electricity_rate_per_kwh=8):
        """
        Calculate annual savings
        
        Args:
            annual_generation_kwh: Annual generation in kWh
            electricity_rate_per_kwh: Rate in INR per kWh (default 8)
        
        Returns:
            Annual savings in INR
        """
        annual_savings = annual_generation_kwh * electricity_rate_per_kwh
        return round(annual_savings, 2)
    
    @staticmethod
    def assess_feasibility(space_utilization_percent, system_capacity_kw, roof_type):
        """
        Assess installation feasibility
        
        Args:
            space_utilization_percent: Space utilization percentage
            system_capacity_kw: System capacity in kW
            roof_type: Type of roof (RCC / Sheet)
        
        Returns:
            Feasibility status and recommendations
        """
        feasible = True
        issues = []
        
        # Check space utilization
        if space_utilization_percent > 90:
            issues.append("Space utilization is too high (>90%). May not fit on roof.")
            feasible = False
        
        if space_utilization_percent > 70:
            issues.append("Space utilization is high (>70%). Limited space for maintenance.")
        
        # Check roof type suitability
        if roof_type == 'Sheet' and system_capacity_kw > 5:
            issues.append(f"Sheet roofing may not support systems >5kW capacity. Consider RCC or structural reinforcement.")
            feasible = False
        
        return {
            'feasible': feasible,
            'issues': issues,
            'recommendations': SolarCalculator._generate_recommendations(system_capacity_kw, feasible)
        }
    
    @staticmethod
    def _generate_recommendations(system_capacity_kw, feasible):
        """Generate recommendations based on system analysis"""
        recommendations = []
        
        if system_capacity_kw <= 3:
            recommendations.append("Suitable for residential use with moderate energy consumption.")
        elif system_capacity_kw <= 10:
            recommendations.append("Recommended for medium residential or small commercial installations.")
        else:
            recommendations.append("Suitable for large commercial or industrial installations.")
        
        if feasible:
            recommendations.append("This installation is feasible. Proceed with detailed site survey.")
        else:
            recommendations.append("Address identified issues before proceeding with installation.")
        
        return recommendations
