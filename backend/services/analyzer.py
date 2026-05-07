def analyze_logs(logs: str):
    threats = []
    risk_score = 0

    # Brute Force
    if "failed login" in logs.lower():
        threats.append("Brute Force Attack")
        risk_score += 30

    # SQL Injection
    if (
        "select" in logs.lower()
        or "drop" in logs.lower()
        or "insert" in logs.lower()
        or "delete" in logs.lower()
    ):
        threats.append("SQL Injection")
        risk_score += 50

    # XSS Attack
    if "<script>" in logs.lower():
        threats.append("XSS Attack")
        risk_score += 40

    # Suspicious IP
    if "192.168" not in logs:
        threats.append("Suspicious IP Connection")
        risk_score += 20

    # Directory Traversal
    if "../" in logs:
        threats.append("Directory Traversal Attack")
        risk_score += 35

    # Command Injection
    if "cmd.exe" in logs.lower() or "powershell" in logs.lower():
        threats.append("Command Injection")
        risk_score += 45

    # No threat detected
    if not threats:
        threats.append("No Threat Detected")

    return {
        "threats": threats,
        "risk_score": risk_score
    }