"""
Advanced threat detection and analysis engine for CyberShield
Implements multiple detection algorithms for comprehensive security analysis
"""
import re
from collections import Counter

class ThreatAnalyzer:
    """Advanced threat detection engine"""

    # SQL Injection patterns
    SQL_INJECTION_PATTERNS = [
        r"(\bor\b|\band\b).{0,10}['\"]?\s*=\s*['\"]",
        r"(\bunion\b|\bselect\b|\bfrom\b|\bwhere\b|\bdrop\b|\binsert\b|\bupdate\b|\bdelete\b)",
        r"(;|--|#|\*)",
        r"(\bhaving\b|\bgroup\s+by\b|\bexec\b|\bexecute\b)",
    ]

    # XSS patterns
    XSS_PATTERNS = [
        r"<script[^>]*>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe",
        r"<object",
        r"<embed",
    ]

    # Command Injection patterns
    COMMAND_INJECTION_PATTERNS = [
        r"[;&|`]",
        r"(\$\(|\`)",
        r"(bash|sh|cmd|powershell)",
    ]

    # Directory Traversal patterns
    TRAVERSAL_PATTERNS = [
        r"\.\./",
        r"\.\.\\",
        r"%2e%2e",
        r"..;/",
    ]

    # Brute Force indicators
    BRUTE_FORCE_PATTERNS = [
        r"failed\s+login",
        r"unauthorized\s+access",
        r"invalid\s+password",
        r"authentication\s+failed",
    ]

    # Suspicious IP patterns (simplified)
    SUSPICIOUS_IPS = {
        "192.168": 10,  # Private
        "10.": 10,      # Private
        "172.": 10,     # Private
        "127.": 5,      # Localhost
    }

    @staticmethod
    def analyze_logs(logs_text: str) -> dict:
        """Analyze logs for security threats"""
        threats = []
        threat_scores = {}

        lines = logs_text.split('\n')
        risk_score = 0

        # SQL Injection Detection
        sql_injection_score = ThreatAnalyzer._detect_sql_injection(logs_text)
        if sql_injection_score > 0:
            threats.append("SQL Injection")
            threat_scores["SQL Injection"] = sql_injection_score
            risk_score += sql_injection_score

        # XSS Attack Detection
        xss_score = ThreatAnalyzer._detect_xss(logs_text)
        if xss_score > 0:
            threats.append("XSS Attack")
            threat_scores["XSS Attack"] = xss_score
            risk_score += xss_score

        # Command Injection Detection
        command_score = ThreatAnalyzer._detect_command_injection(logs_text)
        if command_score > 0:
            threats.append("Command Injection")
            threat_scores["Command Injection"] = command_score
            risk_score += command_score

        # Directory Traversal Detection
        traversal_score = ThreatAnalyzer._detect_directory_traversal(logs_text)
        if traversal_score > 0:
            threats.append("Directory Traversal")
            threat_scores["Directory Traversal"] = traversal_score
            risk_score += traversal_score

        # Brute Force Detection
        brute_force_score = ThreatAnalyzer._detect_brute_force(logs_text)
        if brute_force_score > 0:
            threats.append("Brute Force")
            threat_scores["Brute Force"] = brute_force_score
            risk_score += brute_force_score

        # Suspicious IP Detection
        suspicious_ip_score = ThreatAnalyzer._detect_suspicious_ips(logs_text)
        if suspicious_ip_score > 0:
            threats.append("Suspicious IP")
            threat_scores["Suspicious IP"] = suspicious_ip_score
            risk_score += suspicious_ip_score

        # Anomaly Detection (unusual patterns)
        anomaly_score = ThreatAnalyzer._detect_anomalies(lines)
        if anomaly_score > 0:
            threats.append("Anomalous Activity")
            threat_scores["Anomalous Activity"] = anomaly_score
            risk_score += anomaly_score

        # Normalize risk score
        risk_score = min(int(risk_score / len(threats)) if threats else 0, 100)

        return {
            "threats": threats if threats else ["No Threat Detected"],
            "risk_score": risk_score,
            "threat_details": threat_scores,
        }

    @staticmethod
    def _detect_sql_injection(text: str) -> int:
        """Detect SQL injection attempts"""
        score = 0
        text_lower = text.lower()

        for pattern in ThreatAnalyzer.SQL_INJECTION_PATTERNS:
            matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
            score += matches * 15

        # Additional scoring for suspicious SQL keywords combination
        sql_keywords = ['select', 'union', 'from', 'where', 'or', 'and']
        keyword_count = sum(1 for kw in sql_keywords if kw in text_lower)
        if keyword_count >= 3:
            score += 30

        return min(score, 100)

    @staticmethod
    def _detect_xss(text: str) -> int:
        """Detect XSS attack vectors"""
        score = 0
        text_lower = text.lower()

        for pattern in ThreatAnalyzer.XSS_PATTERNS:
            matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
            score += matches * 25

        return min(score, 100)

    @staticmethod
    def _detect_command_injection(text: str) -> int:
        """Detect command injection attempts"""
        score = 0
        text_lower = text.lower()

        for pattern in ThreatAnalyzer.COMMAND_INJECTION_PATTERNS:
            matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
            score += matches * 15

        # Check for shell commands
        shell_commands = ['bash', 'sh', 'cmd', 'powershell', 'exec', 'system']
        for cmd in shell_commands:
            if cmd in text_lower:
                score += 20

        return min(score, 100)

    @staticmethod
    def _detect_directory_traversal(text: str) -> int:
        """Detect directory traversal attempts"""
        score = 0

        for pattern in ThreatAnalyzer.TRAVERSAL_PATTERNS:
            matches = len(re.findall(pattern, text, re.IGNORECASE))
            score += matches * 20

        # Check for common traversal targets
        targets = ['/etc/passwd', '/windows/system32', '/root/', '/admin/', '/config']
        for target in targets:
            if target.lower() in text.lower():
                score += 30

        return min(score, 100)

    @staticmethod
    def _detect_brute_force(text: str) -> int:
        """Detect brute force attack patterns"""
        score = 0
        text_lower = text.lower()

        # Count failed login attempts
        failed_attempts = len(re.findall(r'failed\s+login|unauthorized|invalid\s+password', text_lower))
        if failed_attempts >= 3:
            score += failed_attempts * 10

        # Count similar patterns (indicating repetition)
        lines = text.split('\n')
        line_patterns = Counter(lines)
        for line, count in line_patterns.items():
            if count >= 3 and len(line) > 5:  # Repeated lines
                score += count * 5

        return min(score, 100)

    @staticmethod
    def _detect_suspicious_ips(text: str) -> int:
        """Detect suspicious IP addresses"""
        score = 0

        # Extract IP addresses
        ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
        ips = re.findall(ip_pattern, text)

        for ip in ips:
            for suspicious_prefix, suspicious_score in ThreatAnalyzer.SUSPICIOUS_IPS.items():
                if ip.startswith(suspicious_prefix):
                    score += suspicious_score

        # Check for blacklisted IPs (demo)
        blacklisted = ['192.168.1.105', '10.0.0.50']
        for blacklist_ip in blacklisted:
            if blacklist_ip in text:
                score += 40

        return min(score, 100)

    @staticmethod
    def _detect_anomalies(lines: list) -> int:
        """Detect anomalous patterns"""
        score = 0

        # Detect unusual line lengths
        line_lengths = [len(line) for line in lines if line]
        if line_lengths:
            avg_length = sum(line_lengths) / len(line_lengths)
            for length in line_lengths:
                if length > avg_length * 2:
                    score += 10

        # Detect unusual timestamp patterns
        timestamp_pattern = r'\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}'
        timestamps = re.findall(timestamp_pattern, ' '.join(lines))
        
        if len(timestamps) < len([l for l in lines if l]) / 2:  # Less than 50% with timestamps
            score += 15

        return min(score, 100)
