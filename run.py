"""
Solar Quotation Platform - Main Application Entry Point
"""
import os
from app import create_app

app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'service': 'Solar Quotation Platform'
    }, 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
