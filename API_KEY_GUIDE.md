# 🔐 API Key Authentication Guide

## Overview
The Solar Quotation Platform now supports API key authentication for secure API access.

---

## 1️⃣ Generate an API Key

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/apikeys/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App",
    "user_id": 1,
    "expires_in_days": 365
  }'
```

### Response:
```json
{
  "success": true,
  "api_key": "token_abc123def456ghi789...",
  "name": "Mobile App",
  "created_at": "2026-01-30T22:10:00",
  "expires_at": "2027-01-30T22:10:00",
  "message": "Save this key! You won't see it again."
}
```

⚠️ **Save the API key immediately!** It won't be shown again.

---

## 2️⃣ Use API Key in Requests

Add the API key to the request header:

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/calculations/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: token_abc123def456ghi789..." \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "monthly_consumption": 500,
    "roof_area": 50,
    "location": "Bangalore",
    "roof_type": "Sloped Concrete",
    "installation_type": "Residential",
    "grid_type": "On-grid"
  }'
```

### Using JavaScript/Fetch:
```javascript
const response = await fetch('http://localhost:5000/api/calculations/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'token_abc123def456ghi789...'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    monthly_consumption: 500,
    roof_area: 50,
    location: 'Bangalore',
    roof_type: 'Sloped Concrete',
    installation_type: 'Residential',
    grid_type: 'On-grid'
  })
});
```

### Using Python:
```python
import requests

headers = {
    'X-API-Key': 'token_abc123def456ghi789...',
    'Content-Type': 'application/json'
}

data = {
    'email': 'user@example.com',
    'name': 'John Doe',
    'monthly_consumption': 500,
    'roof_area': 50,
    'location': 'Bangalore',
    'roof_type': 'Sloped Concrete',
    'installation_type': 'Residential',
    'grid_type': 'On-grid'
}

response = requests.post(
    'http://localhost:5000/api/calculations/create',
    headers=headers,
    json=data
)

print(response.json())
```

---

## 3️⃣ List Your API Keys

```bash
curl http://localhost:5000/api/apikeys/list?user_id=1
```

Response:
```json
{
  "success": true,
  "api_keys": [
    {
      "id": 1,
      "name": "Mobile App",
      "key_preview": "token_ab...",
      "is_active": true,
      "created_at": "2026-01-30T22:10:00",
      "last_used": "2026-01-30T22:15:00",
      "expires_at": "2027-01-30T22:10:00"
    },
    {
      "id": 2,
      "name": "Partner Integration",
      "key_preview": "secret_xy...",
      "is_active": true,
      "created_at": "2026-01-25T10:00:00",
      "last_used": "2026-01-30T21:00:00",
      "expires_at": "2026-02-25T10:00:00"
    }
  ]
}
```

---

## 4️⃣ Deactivate an API Key

```bash
curl -X PUT http://localhost:5000/api/apikeys/1/deactivate
```

Response:
```json
{
  "success": true,
  "message": "API key deactivated"
}
```

---

## 5️⃣ Delete an API Key

```bash
curl -X DELETE http://localhost:5000/api/apikeys/1/delete
```

---

## 📋 API Key Features

| Feature | Details |
|---------|---------|
| **Key Generation** | Cryptographically secure random tokens |
| **Activation** | Can be activated/deactivated without deletion |
| **Expiration** | Optional expiration date (default: never) |
| **Last Used Tracking** | Automatically updated on each valid request |
| **User Association** | Can be tied to specific users |
| **Naming** | Custom names for organizational purposes |

---

## 🔒 Security Best Practices

1. **Store Keys Securely**
   - Never commit to Git
   - Use environment variables for local development
   - Use secret management (AWS Secrets, Vault, etc.) for production

2. **Example: .env file**
   ```
   SOLAR_API_KEY=token_abc123def456ghi789...
   PARTNER_API_KEY=secret_xyz789abc123...
   ```

3. **Rotate Keys Regularly**
   - Create new keys
   - Update applications
   - Delete old keys

4. **Monitor Usage**
   - Check "last_used" timestamp
   - Set reasonable expiration dates
   - Deactivate unused keys

5. **Set Expiration Dates**
   - Create temporary keys with short lifespans
   - Long-term keys should still have set expiration

---

## 🧪 Test with Postman

### Create Request:
```
POST http://localhost:5000/api/apikeys/generate
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "name": "Test Key",
  "user_id": 1,
  "expires_in_days": 30
}
```

### Use Key in Request:
```
POST http://localhost:5000/api/calculations/create
Headers:
  Content-Type: application/json
  X-API-Key: <paste-your-api-key-here>

Body (raw JSON):
{
  "email": "test@example.com",
  "name": "Test User",
  "monthly_consumption": 500,
  "roof_area": 50,
  "location": "Bangalore",
  "roof_type": "Sloped Concrete",
  "installation_type": "Residential",
  "grid_type": "On-grid"
}
```

---

## ❌ Error Responses

### Missing API Key:
```json
{
  "error": "Missing API key. Add X-API-Key header."
}
```
Status: `401 Unauthorized`

### Invalid API Key:
```json
{
  "error": "Invalid or expired API key"
}
```
Status: `401 Unauthorized`

### Missing Required Field:
```json
{
  "error": "Missing \"name\" field"
}
```
Status: `400 Bad Request`

---

## 🔄 API Key Lifecycle

```
Create → Active → Use → Track Usage → Expire/Deactivate → Delete
```

1. **Create**: Generate new key with optional expiration
2. **Active**: Key is ready for use
3. **Use**: Include in API requests as `X-API-Key` header
4. **Track**: Last used timestamp updated automatically
5. **Expire/Deactivate**: Key stops working after expiration or deactivation
6. **Delete**: Permanently remove key from database

---

## 📊 Database Schema

```sql
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY,
    key VARCHAR(64) UNIQUE NOT NULL,
    user_id INTEGER FOREIGN KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME,
    expires_at DATETIME
);
```

---

## 🎯 Next Steps

1. Run `python run.py` to start the server
2. Generate your first API key using `/api/apikeys/generate`
3. Test it with cURL, Postman, or your application
4. Update your frontend/mobile apps to use API keys
5. Monitor key usage and rotate as needed

---

## 📚 Integration Examples

### Node.js Example:
```javascript
const apiKey = process.env.SOLAR_API_KEY;

const headers = {
  'X-API-Key': apiKey,
  'Content-Type': 'application/json'
};

fetch('http://api.solar-quotation.com/api/calculations/create', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(formData)
})
.then(res => res.json())
.then(data => console.log(data));
```

### React/Frontend Example:
```javascript
const API_KEY = process.env.REACT_APP_SOLAR_API_KEY;

const calculateQuotation = async (formData) => {
  const response = await fetch(
    `${process.env.REACT_APP_API_BASE_URL}/api/calculations/create`,
    {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    }
  );
  return response.json();
};
```

---

**Status**: ✅ API Key authentication system is now live!
