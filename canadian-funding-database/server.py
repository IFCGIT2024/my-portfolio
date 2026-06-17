#!/usr/bin/env python3
"""
Canadian Funding Database - REST API Backend
Flask server with SQLite database
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

DB_FILE = 'funding_database.db'

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

def dict_from_row(row):
    """Convert sqlite3.Row to dictionary"""
    return dict(zip(row.keys(), row))

@app.route('/')
def index():
    """Redirect to portal"""
    return send_file('funding-portal.html')

@app.route('/funding-portal.html')
def portal():
    """Serve the portal HTML"""
    return send_file('funding-portal.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Canadian Funding API is running'})

@app.route('/api/programs', methods=['GET'])
def get_programs():
    """
    Get all programs with optional filtering and sorting
    
    Query parameters:
    - search: Search in program name, description, tags
    - status: Filter by status (OPEN, ROLLING, PERIODIC, CLOSED)
    - priority: Filter by priority (HIGHEST, HIGH, MODERATE, LIMITED)
    - geography: Filter by geography
    - funding_type: Filter by funding type
    - min_amount: Minimum funding amount
    - max_amount: Maximum funding amount
    - eligibility: Filter by eligibility (non-profit, for-profit, both)
    - operational: Filter operational funding (yes/no)
    - sector: Filter by sector (federal, provincial, private, angel, municipal, corporate)
    - sort_by: Sort field (priority, deadline, amount, name, status)
    - sort_order: Sort order (asc, desc)
    """
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Build query
    query = "SELECT * FROM programs WHERE 1=1"
    params = []
    
    # Search filter
    search = request.args.get('search', '').strip()
    if search:
        query += " AND (program_name LIKE ? OR quick_description LIKE ? OR tags LIKE ?)"
        search_term = f'%{search}%'
        params.extend([search_term, search_term, search_term])
    
    # Status filter
    status = request.args.get('status', '').strip()
    if status:
        query += " AND status = ?"
        params.append(status)
    
    # Priority filter
    priority = request.args.get('priority', '').strip()
    if priority:
        query += " AND priority = ?"
        params.append(priority)
    
    # Geography filter
    geography = request.args.get('geography', '').strip()
    if geography:
        query += " AND geography LIKE ?"
        params.append(f'%{geography}%')
    
    # Funding type filter
    funding_type = request.args.get('funding_type', '').strip()
    if funding_type:
        query += " AND funding_type LIKE ?"
        params.append(f'%{funding_type}%')
    
    # Amount filters
    min_amount = request.args.get('min_amount', '').strip()
    if min_amount:
        query += " AND amount_max >= ?"
        params.append(int(min_amount))
    
    max_amount = request.args.get('max_amount', '').strip()
    if max_amount:
        query += " AND amount_min <= ?"
        params.append(int(max_amount))
    
    # Eligibility filter
    eligibility = request.args.get('eligibility', '').strip()
    if eligibility == 'non-profit':
        query += " AND non_profit_eligible = 'Yes'"
    elif eligibility == 'for-profit':
        query += " AND for_profit_eligible = 'Yes'"
    elif eligibility == 'both':
        query += " AND non_profit_eligible = 'Yes' AND for_profit_eligible = 'Yes'"
    
    # Operational funding filter
    operational = request.args.get('operational', '').strip()
    if operational:
        if operational.lower() == 'yes':
            query += " AND operational_funding = 'Yes'"
        elif operational.lower() == 'project':
            query += " AND project_funding = 'Yes'"
        elif operational.lower() == 'multi-year':
            query += " AND multi_year = 'Yes'"
    
    # Sector filter
    sector = request.args.get('sector', '').strip().lower()
    if sector:
        if sector == 'federal':
            query += " AND id LIKE 'GOV-FED-%'"
        elif sector == 'provincial':
            query += " AND (id LIKE 'GOV-NS-%' OR id LIKE 'GOV-NB-%' OR id LIKE 'GOV-PEI-%' OR id LIKE 'GOV-NL-%' OR id LIKE 'GOV-ON-%' OR id LIKE 'GOV-QC-%' OR id LIKE 'GOV-BC-%' OR id LIKE 'GOV-AB-%' OR id LIKE 'GOV-SK-%' OR id LIKE 'GOV-MB-%')"
        elif sector == 'private':
            query += " AND id LIKE 'FOUND-%'"
        elif sector == 'angel':
            query += " AND id LIKE 'INV-%'"
        elif sector == 'municipal':
            query += " AND tags LIKE '%#municipal%'"
        elif sector == 'corporate':
            query += " AND id LIKE 'CORP-%'"
    
    # Sorting
    sort_by = request.args.get('sort_by', 'priority').strip()
    sort_order = request.args.get('sort_order', 'asc').strip()
    
    # Map sort fields
    sort_mapping = {
        'priority': 'CASE priority WHEN "HIGHEST" THEN 1 WHEN "HIGH" THEN 2 WHEN "MODERATE" THEN 3 WHEN "LIMITED" THEN 4 END',
        'deadline': 'CASE status WHEN "OPEN" THEN 1 WHEN "ROLLING" THEN 2 WHEN "PERIODIC" THEN 3 WHEN "CLOSED" THEN 4 END',
        'amount': 'amount_max',
        'name': 'program_name',
        'status': 'CASE status WHEN "OPEN" THEN 1 WHEN "ROLLING" THEN 2 WHEN "PERIODIC" THEN 3 WHEN "CLOSED" THEN 4 END'
    }
    
    sort_field = sort_mapping.get(sort_by, 'priority')
    sort_dir = 'DESC' if sort_order.lower() == 'desc' and sort_by == 'amount' else 'ASC'
    
    query += f" ORDER BY {sort_field} {sort_dir}"
    
    # Execute query
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    # Convert to list of dictionaries
    programs = [dict_from_row(row) for row in rows]
    
    conn.close()
    
    return jsonify({
        'success': True,
        'count': len(programs),
        'programs': programs
    })

@app.route('/api/programs/<program_id>', methods=['GET'])
def get_program(program_id):
    """Get single program by ID"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM programs WHERE id = ?", (program_id,))
    row = cursor.fetchone()
    
    conn.close()
    
    if row:
        return jsonify({
            'success': True,
            'program': dict_from_row(row)
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Program not found'
        }), 404

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get database statistics"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Total programs
    cursor.execute("SELECT COUNT(*) as count FROM programs")
    total = cursor.fetchone()['count']
    
    # Open programs
    cursor.execute("SELECT COUNT(*) as count FROM programs WHERE status IN ('OPEN', 'ROLLING')")
    open_count = cursor.fetchone()['count']
    
    # Highest priority
    cursor.execute("SELECT COUNT(*) as count FROM programs WHERE priority = 'HIGHEST'")
    highest = cursor.fetchone()['count']
    
    # Operational funding
    cursor.execute("SELECT COUNT(*) as count FROM programs WHERE operational_funding = 'Yes'")
    operational = cursor.fetchone()['count']
    
    # By geography
    cursor.execute("""
        SELECT geography, COUNT(*) as count 
        FROM programs 
        GROUP BY geography 
        ORDER BY count DESC
        LIMIT 10
    """)
    by_geography = [dict_from_row(row) for row in cursor.fetchall()]
    
    # By status
    cursor.execute("""
        SELECT status, COUNT(*) as count 
        FROM programs 
        GROUP BY status
    """)
    by_status = [dict_from_row(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'success': True,
        'stats': {
            'total': total,
            'open': open_count,
            'highest_priority': highest,
            'operational': operational,
            'by_geography': by_geography,
            'by_status': by_status
        }
    })

@app.route('/api/search', methods=['GET'])
def search_programs():
    """Full-text search across all programs"""
    search_term = request.args.get('q', '').strip()
    
    if not search_term:
        return jsonify({
            'success': False,
            'error': 'Search term required (q parameter)'
        }), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = """
        SELECT * FROM programs 
        WHERE program_name LIKE ? 
        OR quick_description LIKE ? 
        OR tags LIKE ?
        OR purpose LIKE ?
        ORDER BY 
            CASE priority 
                WHEN 'HIGHEST' THEN 1 
                WHEN 'HIGH' THEN 2 
                WHEN 'MODERATE' THEN 3 
                WHEN 'LIMITED' THEN 4 
            END
    """
    
    search_pattern = f'%{search_term}%'
    cursor.execute(query, [search_pattern, search_pattern, search_pattern, search_pattern])
    rows = cursor.fetchall()
    
    programs = [dict_from_row(row) for row in rows]
    
    conn.close()
    
    return jsonify({
        'success': True,
        'count': len(programs),
        'search_term': search_term,
        'programs': programs
    })

if __name__ == '__main__':
    # Check if database exists
    if not Path(DB_FILE).exists():
        print(f"❌ Database not found: {DB_FILE}")
        print(f"🔧 Run: python create_database.py")
        exit(1)
    
    print("\n" + "="*60)
    print("🚀 Canadian Funding Database API Server")
    print("="*60)
    print(f"\n📊 Database: {DB_FILE}")
    print(f"🌐 Server: http://localhost:8000")
    print(f"\n📡 API Endpoints:")
    print(f"   GET  /api/health              - Health check")
    print(f"   GET  /api/programs            - Get all programs (with filters)")
    print(f"   GET  /api/programs/<id>       - Get single program")
    print(f"   GET  /api/stats               - Get statistics")
    print(f"   GET  /api/search?q=<term>     - Search programs")
    print(f"\n💡 Example queries:")
    print(f"   http://localhost:8000/api/programs?status=OPEN")
    print(f"   http://localhost:8000/api/programs?priority=HIGHEST&status=OPEN")
    print(f"   http://localhost:8000/api/search?q=retrofit")
    print(f"\n⏸️  Press Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=8000)
