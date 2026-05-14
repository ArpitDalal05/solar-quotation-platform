-- Solar Quotation Platform Database Schema

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(15),
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Calculations Table
CREATE TABLE calculations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    monthly_consumption FLOAT NOT NULL,
    roof_area FLOAT NOT NULL,
    building_height FLOAT,
    location VARCHAR(200) NOT NULL,
    roof_type VARCHAR(50) NOT NULL,
    installation_type VARCHAR(50) NOT NULL,
    grid_type VARCHAR(50) NOT NULL,
    results JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Quotations Table
CREATE TABLE quotations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    calculation_id INT NOT NULL UNIQUE,
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    system_capacity_kw FLOAT NOT NULL,
    number_of_panels INT NOT NULL,
    space_utilization_percent FLOAT NOT NULL,
    total_cost FLOAT NOT NULL,
    cost_breakdown JSON,
    annual_generation_kwh FLOAT NOT NULL,
    payback_period_years FLOAT NOT NULL,
    annual_savings FLOAT NOT NULL,
    feasible BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'generated',
    pdf_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (calculation_id) REFERENCES calculations(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_quotation_number (quotation_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cost Parameters Table
CREATE TABLE cost_parameters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key VARCHAR(100) UNIQUE NOT NULL,
    value FLOAT NOT NULL,
    description VARCHAR(500),
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default cost parameters
INSERT INTO cost_parameters (key, value, description, unit) VALUES
('cost_per_watt', 80, 'Cost per watt of solar panel', 'INR/W'),
('installation_cost_multiplier', 0.1, 'Installation cost as % of system cost', '%'),
('maintenance_annual_percentage', 0.02, 'Annual maintenance as % of system cost', '%'),
('gst_rate', 18, 'Goods and Services Tax rate', '%'),
('electricity_rate', 8, 'Electricity rate for savings calculation', 'INR/kWh'),
('panel_wattage', 400, 'Standard solar panel wattage', 'W'),
('panel_area', 2, 'Area of one solar panel', 'sq.m'),
('system_efficiency', 0.75, 'Overall system efficiency', 'Decimal');

-- Create indexes for better query performance
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_calculations_roof_type ON calculations(roof_type);
CREATE INDEX idx_calculations_installation_type ON calculations(installation_type);
CREATE INDEX idx_calculations_grid_type ON calculations(grid_type);
