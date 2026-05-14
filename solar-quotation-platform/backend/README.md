## Solar PV Quotation Management – Backend API

Base URL in dev: `http://localhost:4000`

All non-auth endpoints require `Authorization: Bearer <JWT>` header.

### 1. Authentication

- **POST `/auth/register`**
  - Body:
    ```json
    {
      "name": "Admin",
      "email": "admin@example.com",
      "password": "password123",
      "role": "ADMIN"
    }
    ```
- **POST `/auth/login`**
  - Body:
    ```json
    {
      "email": "admin@example.com",
      "password": "password123"
    }
    ```
  - Response: `{ token, user }`

### 2. Customers

- **POST `/customers`** – create customer (ADMIN, SALES_EXECUTIVE, MANAGER)
- **GET `/customers`** – list customers
- **GET `/customers/:id`** – get one
- **PUT `/customers/:id`** – update (ADMIN, SALES_EXECUTIVE, MANAGER)
- **DELETE `/customers/:id`** – delete (ADMIN, MANAGER)

Example (Postman JSON body for create):

```json
{
  "name": "Mr. Sharma",
  "location": "Pune",
  "state": "Maharashtra",
  "electricity_tariff": 9,
  "sanctioned_load": 7.5,
  "contact_number": "9876543210",
  "email": "sharma@example.com",
  "followup_status": "New",
  "notes": "3-floor residential"
}
```

### 3. Solar Calculations

- **GET `/calculations/generation-factor?state=Maharashtra`**
- **POST `/calculations`**
  - Body:
    ```json
    {
      "customerId": 1,
      "monthly_electricity_bill": 4000,
      "state": "Maharashtra",
      "roof_type": "RCC",
      "electricity_tariff": 9
    }
    ```
- **GET `/calculations`** – list all (includes customer + financial analysis)
- **GET `/calculations/:id`** – single with related entities

### 4. Products & Pricing

All product/config endpoints require `ADMIN` role.

- **POST `/pricing/products`**
  - Body:
    ```json
    {
      "name": "Mono PERC 540W",
      "category": "MODULE",
      "brand": "BrandX",
      "cost_per_watt": 22.5
    }
    ```
- **GET `/pricing/products`**
- **GET `/pricing/products/:id`**
- **PUT `/pricing/products/:id`**
- **DELETE `/pricing/products/:id`**

Pricing configuration (used for quotation costing):

- **POST `/pricing/configs`**
  - Body:
    ```json
    {
      "structure_type_cost": 5,
      "cabling_cost_per_watt": 3,
      "installation_cost_per_watt": 7,
      "transport_cost": 15000,
      "margin_percent": 15,
      "gst_rate": 0.18
    }
    ```
- **GET `/pricing/configs/latest`**

### 5. Quotations & Financial Analysis

- **POST `/quotations`** – create quotation + financial analysis + PDF
  - Body:
    ```json
    {
      "customer_id": 1,
      "calculation_id": 1,
      "subsidy_percent": 20,
      "electricity_tariff": 9
    }
    ```
  - Response includes `pdfUrl` such as `/files/quotations/quotation-SOL-...pdf`.
- **GET `/quotations`** – list with customer, user, financial analysis
- **GET `/quotations/:id`** – full detail
- **PATCH `/quotations/:id/status`**
  - Body:
    ```json
    { "status": "SENT" }
    ```

PDF files are served at: `GET http://localhost:4000/files/quotations/<filename>.pdf`

### 6. Solar Calculator (OpenWeatherMap + formulas)

- **POST `/solar-calc`** – no auth required
  - Input:
    ```json
    {
      "city": "Pune",
      "monthlyConsumption": 300
    }
    ```
  - Or with coordinates:
    ```json
    {
      "lat": 18.52,
      "lon": 73.86,
      "monthlyConsumption": 300
    }
    ```
  - Optional overrides: `electricityRate`, `panelWattage`, `efficiency`, `costPerWatt`, `installationMultiplier`, `gstRate`
  - Output: `location`, `irradiance`, `systemCapacity_kW`, `numberOfPanels`, `annualGeneration_kWh`, `annualSavings`, `totalSystemCost`, `paybackPeriod_years`, plus `weather` (temp, cloudCover, sunrise, sunset, coordinates) when successful

### 7. Dashboard / Reporting

- **GET `/reports/dashboard`** (ADMIN, MANAGER)
  - Returns:
    - `totalQuotations`
    - `monthlySalesPipeline`
    - `conversionRatio`
    - `revenueForecast`
    - `salesExecutivePerformance` per user

