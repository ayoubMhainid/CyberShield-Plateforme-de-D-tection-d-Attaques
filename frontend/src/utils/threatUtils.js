export function getRecommendation(name) {
  const normalized = (name || '').toLowerCase();

  if (normalized.includes('brute')) {
    return 'Use account lockout, rate limiting, strong passwords and multi-factor authentication.';
  }

  if (normalized.includes('sql')) {
    return 'Use prepared statements, input validation and ORM protection.';
  }

  if (normalized.includes('suspicious')) {
    return 'Block suspicious IPs, monitor traffic and check firewall rules.';
  }

  if (normalized.includes('directory')) {
    return 'Validate file paths and avoid exposing filesystem directories.';
  }

  if (normalized.includes('command') || normalized.includes('xss')) {
    return 'Sanitize input, enforce least privilege, and validate payloads before execution.';
  }

  return 'Review log content and strengthen detection rules for the reported event.';
}

export function describeThreat(name) {
  const normalized = name.toLowerCase();

  if (normalized.includes('sql')) {
    return {
      name,
      severity: 'Critical',
      detail: 'Backend detected database keywords inside request activity.',
      recommendation: getRecommendation(name),
    };
  }

  if (normalized.includes('command') || normalized.includes('xss')) {
    return {
      name,
      severity: 'High',
      detail: 'Backend matched a dangerous payload signature in the log stream.',
      recommendation: getRecommendation(name),
    };
  }

  if (normalized.includes('brute')) {
    return {
      name,
      severity: 'High',
      detail: 'Backend found repeated failed authentication attempts.',
      recommendation: getRecommendation(name),
    };
  }

  if (normalized.includes('suspicious') || normalized.includes('directory')) {
    return {
      name,
      severity: 'Medium',
      detail: 'Backend flagged an abnormal connection or path pattern.',
      recommendation: getRecommendation(name),
    };
  }

  return {
    name,
    severity: 'Medium',
    detail: 'Backend returned a suspicious security event.',
    recommendation: getRecommendation(name),
  };
}