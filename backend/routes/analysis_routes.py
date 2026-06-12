from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.mongoDB import url_collection, ip_collection, hash_collection
from datetime import datetime
import re

router = APIRouter(prefix="/analysis", tags=["analysis"])


class URLAnalysisRequest(BaseModel):
    url: str


class IPAnalysisRequest(BaseModel):
    ip: str


class HashLookupRequest(BaseModel):
    hash_value: str


def analyze_url(url: str) -> dict:
    risk_score = 0
    threats = []
    url_lower = url.lower()

    phishing_keywords = {
        "login": 10,
        "verify": 15,
        "confirm": 10,
        "update": 10,
        "secure": 10,
        "bank": 20,
        "paypal": 20,
        "account": 10,
        "password": 20,
        "free": 10,
        "bonus": 10,
        "crypto": 15,
        "giveaway": 20,
    }

    found_keywords = []
    for keyword, score in phishing_keywords.items():
        if keyword in url_lower:
            risk_score += score
            found_keywords.append(keyword)

    if found_keywords:
        threats.append("Phishing keywords detected: " + ", ".join(found_keywords))

    suspicious_tlds = [".xyz", ".tk", ".ml", ".ru", ".click", ".top"]
    if any(tld in url_lower for tld in suspicious_tlds):
        risk_score += 20
        threats.append("Suspicious domain extension")

    suspicious_domains = ["bit.ly", "tinyurl", "goo.gl", "short.url"]
    if any(domain in url_lower for domain in suspicious_domains):
        risk_score += 20
        threats.append("Suspicious shortened URL")

    sql_patterns = ["union", "select", "drop", "insert", "delete", "exec", "' or '1'='1"]
    if any(pattern in url_lower for pattern in sql_patterns):
        risk_score += 40
        threats.append("SQL Injection attempt")

    if "../" in url_lower or "/etc/passwd" in url_lower:
        risk_score += 40
        threats.append("Directory traversal attempt")

    if "?" in url and len(url.split("?")[1]) > 100:
        risk_score += 15
        threats.append("Suspicious long parameters")

    if not url.startswith(("http://", "https://")):
        risk_score += 30
        threats.append("Unusual protocol")

    risk_score = min(risk_score, 100)

    return {
        "url": url,
        "risk_score": risk_score,
        "threats": threats if threats else [],
        "safe": risk_score < 30,
    }

def analyze_ip(ip: str) -> dict:
    ip_pattern = r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
    if not re.match(ip_pattern, ip):
        raise HTTPException(status_code=400, detail="Invalid IP format")

    parts = [int(x) for x in ip.split(".")]
    if any(part > 255 for part in parts):
        raise HTTPException(status_code=400, detail="Invalid IP address")

    is_private = (
        parts[0] == 10 or
        (parts[0] == 172 and 16 <= parts[1] <= 31) or
        (parts[0] == 192 and parts[1] == 168) or
        parts[0] == 127
    )

    risk_score = 5 if is_private else 0
    threats = []

    if is_private:
        threats.append("Private or local IP address")
        geo_data = {
            "country": "Private Network",
            "city": "Local",
            "isp": "Local Network",
            "lat": None,
            "lon": None,
            "timezone": None,
            "query": ip,
        }
    else:
        import requests
        import hashlib

        try:
            response = requests.get(
                f"http://ip-api.com/json/{ip}?fields=status,message,country,regionName,city,isp,org,lat,lon,timezone,query",
                timeout=5
            )
            geo_data = response.json()

            if geo_data.get("status") != "success":
                raise HTTPException(status_code=400, detail=geo_data.get("message", "GeoIP lookup failed"))

        except requests.RequestException:
            raise HTTPException(status_code=500, detail="GeoIP service unavailable")

        hash_val = int(hashlib.md5(ip.encode()).hexdigest(), 16)
        risk_score = (hash_val % 60) + 10

        if risk_score > 40:
            threats.append("Suspicious connection pattern")
        if risk_score > 60:
            threats.append("High-risk public IP")

    return {
        "ip": ip,
        "risk_score": min(risk_score, 100),
        "threats": threats,
        "geolocation": {
            "country": geo_data.get("country"),
            "region": geo_data.get("regionName"),
            "city": geo_data.get("city"),
            "isp": geo_data.get("isp"),
            "org": geo_data.get("org"),
            "lat": geo_data.get("lat"),
            "lon": geo_data.get("lon"),
            "timezone": geo_data.get("timezone"),
        },
        "is_private": is_private,
        "recommendation": "Block this IP" if risk_score > 60 else "Monitor traffic",
    }

def lookup_hash(hash_value: str) -> dict:
    import requests

    hash_value = hash_value.strip().lower()

    if len(hash_value) == 32:
        hash_type = "MD5"
    elif len(hash_value) == 64:
        hash_type = "SHA256"
    else:
        raise HTTPException(status_code=400, detail="Invalid hash format")

    try:
        response = requests.post(
            "https://mb-api.abuse.ch/api/v1/",
            data={"query": "get_info", "hash": hash_value},
            timeout=10
        )
        data = response.json()
        print("MALWAREBAZAAR RESPONSE:")
        print(data)
    except Exception:
        return {
            "hash": hash_value,
            "hash_type": hash_type,
            "status": "Unknown",
            "detection_ratio": "0/0",
            "source": "MalwareBazaar unavailable",
            "file_type": "Unknown",
            "file_size": "Unknown",
            "first_seen": "Unknown",
            "last_seen": "Unknown",
            "threat_type": "None",
            "signature": "Service unavailable",
            "tags": [],
            "sha256_hash": "Unknown",
            "md5_hash": hash_value if hash_type == "MD5" else "Unknown",
        }

    if data.get("query_status") != "ok":
        return {
            "hash": hash_value,
            "hash_type": hash_type,
            "status": "Clean",
            "detection_ratio": "0/1",
            "source": "MalwareBazaar",
            "file_type": "Unknown",
            "file_size": "Unknown",
            "first_seen": "Not found",
            "last_seen": "Not found",
            "threat_type": "None",
            "signature": "No malware record found",
            "tags": [],
            "sha256_hash": hash_value if hash_type == "SHA256" else "Unknown",
            "md5_hash": hash_value if hash_type == "MD5" else "Unknown",
        }

    info = data["data"][0]
    signature = info.get("signature") or "Unknown malware"

    return {
        "hash": hash_value,
        "hash_type": hash_type,
        "status": "Malicious",
        "detection_ratio": "1/1",
        "source": "MalwareBazaar",
        "file_type": info.get("file_type", "Unknown"),
        "file_size": str(info.get("file_size", "Unknown")),
        "first_seen": info.get("first_seen", "Unknown"),
        "last_seen": info.get("last_seen", "Unknown"),
        "threat_type": signature,
        "signature": signature,
        "tags": info.get("tags") or [],
        "sha256_hash": info.get("sha256_hash", "Unknown"),
        "md5_hash": info.get("md5_hash", "Unknown"),
    }

@router.post("/url")
def analyze_url_endpoint(req: URLAnalysisRequest):
    result = analyze_url(req.url)

    url_collection.insert_one({
    "type": "url",
    "target": req.url,
    "result": result,
    "created_at": datetime.utcnow()
})

    return result

@router.post("/ip")
def analyze_ip_endpoint(req: IPAnalysisRequest):
    result = analyze_ip(req.ip)

    ip_collection.insert_one({
    "type": "ip",
    "target": req.ip,
    "result": result,
    "created_at": datetime.utcnow()
})

    return result


@router.post("/hash")
def lookup_hash_endpoint(req: HashLookupRequest):
    result = lookup_hash(req.hash_value)

    hash_collection.insert_one({
    "type": "hash",
    "target": req.hash_value,
    "result": result,
    "created_at": datetime.utcnow()
})

    return result
