# Solar Quotation Platform - Clean Project

## 📁 Project Structure (Cleaned)

```
solar-quotation-platform/
├── backend/
│   ├── .env                    (Configuration with API keys)
│   ├── config.py               (Flask configuration)
│   ├── requirements.txt         (Python dependencies)
│   ├── run.py                  (Main server entry point)
│   ├── instance/
│   │   └── solar_quotation.db  (SQLite database)
│   └── app/
│       ├── __init__.py         (Flask app factory)
│       ├── models/             (Database models)
│       │   ├── user.py
│       │   ├── calculation.py
│       │   ├── quotation.py
│       │   ├── cost_parameter.py
│       │   └── api_key.py
│       ├── routes/             (API endpoints)
│       │   ├── calculation.py  (POST /api/calculations/create)
│       │   ├── quotation.py    (GET/POST /api/quotations/*)
│       │   ├── admin.py        (CRUD /api/admin/cost-parameters)
│       │   ├── apikey.py       (API key management)
│       │   └── solardata.py    (Solar irradiance data)
│       └── utils/              (Core logic)
│           ├── calculator.py   (Solar calculations)
│           ├── pdf_generator.py (Quotation PDFs)
│           ├── solar_data.py   (OpenWeatherMap integration)
│           └── auth.py         (API authentication)
├── frontend/
│   └── index.html              (Web interface)
└── database/
    └── schema.sql              (Database schema reference)
```

## ✅ What's Essential (Kept)

| Component | Purpose |
|-----------|---------|
| **backend/run.py** | Main server entry point |
| **backend/config.py** | Flask configuration |
| **backend/.env** | API keys and settings |
| **backend/requirements.txt** | Python package dependencies |
| **backend/app/** | Complete Flask application |
| **frontend/index.html** | Web user interface |
| **database/instance/** | SQLite database file |

## ❌ What Was Removed (Not Required)

- Documentation files (README.md, QUICKSTART.md, etc.)
- Setup guides (ENVIRONMENT_SETUP.md, START_HERE.txt)
- Helper scripts (test_env.py, verify_environment.py)
- Command files (COMMANDS.bat, COMMANDS.ps1)
- Example files (.env.example)
- Python cache (__pycache__ directories)
- Empty folders (docs/, mobile/)

## 🚀 Quick Start

### 1. Start Server
```bash
cd backend
python run.py
```

Server runs on: `http://localhost:5000`

### 2. Test API
```bash
curl http://localhost:5000/api/health
```

### 3. Open Frontend
```
Open in browser: frontend/index.html
```

### 4. Create Quotation
```bash
curl -X POST http://localhost:5000/api/calculations/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "User Name",
    "monthly_consumption": 500,
    "roof_area": 50,
    "location": "Bangalore",
    "roof_type": "Sloped Concrete",
    "installation_type": "Residential",
    "grid_type": "On-grid"
  }'
```

## 📊 Technology Stack

- **Backend**: Flask 3.0.0
- **Database**: SQLAlchemy 2.0.46 + SQLite
- **Authentication**: API Keys
- **PDF**: ReportLab 4.0.4
- **Solar Data**: OpenWeatherMap API
- **Frontend**: HTML5 + CSS3 + JavaScript

## 🔑 Configuration

Edit `.env` to set:
- `OPENWEATHER_API_KEY` - Real-time solar data
- `FLASK_ENV` - development/production
- `DATABASE_URL` - Database connection
- Solar system parameters

## 📝 API Endpoints

### Calculations
- `POST /api/calculations/create` - New calculation
- `GET /api/calculations/<id>` - Get calculation

### Quotations
- `POST /api/quotations/generate` - Generate quotation
- `GET /api/quotations/<id>/pdf` - Download PDF

### Solar Data
- `GET /api/solar/irradiance?city=<city>` - Get irradiance
- `GET /api/solar/cities` - List supported cities

### API Keys
- `POST /api/apikeys/generate` - Create API key
- `GET /api/apikeys/list?user_id=<id>` - List keys

### Admin
- `GET/POST/PUT/DELETE /api/admin/cost-parameters` - Manage costs

## 🎯 Ready for Development

The project is now clean and minimal. All core features are present:
- ✅ Solar system calculations
- ✅ Cost estimation with real irradiance data
- ✅ Quotation generation
- ✅ PDF export
- ✅ API authentication
- ✅ Web interface

**Start the server and begin testing!** 🚀
