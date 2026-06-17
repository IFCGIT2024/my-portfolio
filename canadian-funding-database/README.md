# Canadian Funding Database

A comprehensive database of 141 funding opportunities for housing and climate initiatives across Canada.

## Features

- **141 verified programs** across federal, provincial, and private sectors
- **Advanced filtering** by status, geography, funding type, amount, and eligibility
- **Real-time search** across program names, descriptions, and tags
- **Responsive design** with professional UI
- **RESTful API** for programmatic access

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Requirements:
- Python 3.8+
- Flask
- Flask-CORS

### 2. Run the Server

```bash
python3 server.py
```

The portal will be available at **http://localhost:8000**

### 3. Access the Portal

Open http://localhost:8000 in your browser to explore funding opportunities.

## API Endpoints

### GET `/api/programs`
Get all programs with optional filtering

**Query Parameters:**
- `search` - Search in name, description, tags
- `status` - Filter by status (OPEN, ROLLING, PERIODIC, CLOSED)
- `geography` - Filter by geography
- `sector` - Filter by sector
- `min_amount` - Minimum funding amount
- `max_amount` - Maximum funding amount

**Example:**
```bash
curl "http://localhost:8000/api/programs?status=OPEN&min_amount=100000"
```

### GET `/api/programs/:id`
Get single program by ID

### GET `/api/stats`
Get database statistics

## Database Statistics

- **Total Programs:** 141
- **By Sector:**
  - Provincial: 46
  - Federal: 43
  - Private/Foundation: 21
  - Investor/Accelerator: 16
  - Social Finance: 7
  - Corporate: 4

- **By Status:**
  - ROLLING: 94 (ongoing applications)
  - PERIODIC: 18 (specific deadlines)
  - CLOSED: 19 (temporarily closed)
  - OPEN: 2 (currently open)

## Deployment

### Local Development
```bash
python3 server.py
```

### Production (with Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 server:app
```

### Static Hosting
The portal can be deployed to:
- GitHub Pages (requires converting database to JSON)
- Netlify / Vercel (with backend API)
- Any cloud platform (Heroku, Railway, etc.)

## File Structure

```
canadian-funding-database/
├── funding-portal.html    # Frontend interface
├── server.py              # Flask API backend
├── funding_database.db    # SQLite database (141 programs)
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Technologies

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Python Flask with Flask-CORS
- **Database:** SQLite
- **API:** RESTful JSON API

## License

Open source - feel free to use and modify for your needs.

## Updates

Last verified: June 2026

For questions or corrections, please submit an issue on GitHub.
