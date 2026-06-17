from sklearn.ensemble import IsolationForest
import numpy as np


X_train = np.array([
    [0, 0, 1, 0],
    [1, 0, 2, 0],
    [1, 1, 3, 0],
    [2, 0, 4, 1],
    [0, 0, 2, 0],
    [1, 0, 1, 0],
])

model = IsolationForest(
    contamination=0.25,
    random_state=42
)

model.fit(X_train)


def analyze_ai_log(log_text: str) -> dict:
    text = log_text.lower()

    failed_logins = text.count("failed login") + text.count("invalid password")
    sql_patterns = text.count("select") + text.count("union") + text.count("drop") + text.count("' or")
    total_lines = len([line for line in log_text.split("\n") if line.strip()])
    traversal = text.count("../") + text.count("/etc/passwd")

    sample = np.array([[failed_logins, sql_patterns, total_lines, traversal]])

    prediction = model.predict(sample)[0]

    ai_score = 10

    if failed_logins >= 3:
        ai_score += 30
    if sql_patterns >= 2:
        ai_score += 35
    if traversal >= 1:
        ai_score += 25
    if total_lines > 20:
        ai_score += 10

    ai_score = min(ai_score, 100)

    if prediction == -1 or ai_score >= 60:
        return {
            "model": "Isolation Forest",
            "ai_result": "Anomaly Detected",
            "ai_score": ai_score,
            "explanation": "The AI model detected abnormal behavior based on login failures, SQL patterns, traversal attempts, and log density."
        }

    return {
        "model": "Isolation Forest",
        "ai_result": "Normal Activity",
        "ai_score": ai_score,
        "explanation": "The analyzed logs look close to normal behavior according to the trained anomaly detection model."
    }