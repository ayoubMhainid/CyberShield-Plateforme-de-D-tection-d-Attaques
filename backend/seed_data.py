"""
Seed test accounts and sample data into MongoDB for CyberShield
"""
from pymongo import MongoClient
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['cybershield']
users_collection = db['users']
analyses_collection = db['analyses']

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    return pwd_context.hash(password)

# Clear existing data (optional - comment out to preserve)
# users_collection.delete_many({})
# analyses_collection.delete_many({})

# Test accounts
test_users = [
    {
        'username': 'admin',
        'email': 'admin@cybershield.com',
        'hashed_password': hash_password('admin123'),
        'role': 'admin',
        'created_at': datetime.now(),
    },
    {
        'username': 'security_analyst',
        'email': 'analyst@cybershield.com',
        'hashed_password': hash_password('analyst123'),
        'role': 'analyst',
        'created_at': datetime.now(),
    },
    {
        'username': 'demo_user',
        'email': 'demo@cybershield.com',
        'hashed_password': hash_password('demo123'),
        'role': 'user',
        'created_at': datetime.now(),
    },
]

# Insert users (skip if already exist)
for user in test_users:
    existing = users_collection.find_one({'username': user['username']})
    if not existing:
        users_collection.insert_one(user)
        print(f"✓ Created user: {user['username']}")
    else:
        print(f"~ User already exists: {user['username']}")

# Sample threat analysis data
threat_types = [
    ('Brute Force', 65),
    ('SQL Injection', 85),
    ('Directory Traversal', 45),
    ('XSS Attack', 70),
    ('Suspicious IP', 55),
    ('Phishing Attempt', 75),
]

sample_logs = [
    "2026-06-07 10:23:45 failed login admin\n2026-06-07 10:23:52 failed login admin\n2026-06-07 10:24:01 failed login admin",
    "2026-06-07 11:15:22 GET /products?id=1' OR '1'='1\n2026-06-07 11:15:28 GET /users?name=admin",
    "2026-06-07 09:45:33 GET /../../etc/passwd\n2026-06-07 09:45:40 GET /admin/../../config.php",
    "2026-06-07 12:30:15 POST /search?q=<script>alert('xss')</script>\n2026-06-07 12:30:22 GET /profile?id=<img src=x>",
    "2026-06-07 08:22:11 Connection from 192.168.1.105\n2026-06-07 08:22:18 Unusual packet sequence detected",
    "2026-06-07 14:10:05 Click on: suspicious-link.ru\n2026-06-07 14:10:12 Email from unknown sender",
]

# Create sample analyses for the past 7 days
for i in range(7):
    threat_type, risk = random.choice(threat_types)
    created_at = datetime.now() - timedelta(days=i)
    
    analysis = {
        'logs': random.choice(sample_logs),
        'threats': [threat_type],
        'risk_score': risk + random.randint(-10, 10),
        'created_at': created_at,
        'username': random.choice(['admin', 'security_analyst', 'demo_user']),
    }
    
    analyses_collection.insert_one(analysis)
    print(f"✓ Created analysis: {threat_type} (Risk: {analysis['risk_score']}%)")

print("\n✅ Seeding complete! Test accounts created:")
print("  Username: admin       | Password: admin123")
print("  Username: security_analyst | Password: analyst123")
print("  Username: demo_user   | Password: demo123")
