def analyze_logs(logs: str):
    threats = []

    if "failed login" in logs:
        threats.append("Brute Force")

    if "SELECT" in logs or "DROP" in logs:
        threats.append("SQL Injection")

    return {
        "threats": threats,
        "risk_score": len(threats) * 10
    }