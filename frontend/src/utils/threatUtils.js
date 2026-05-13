export function describeThreat(name) {
  const normalized = name.toLowerCase();

  if (normalized.includes('sql')) {
    return {
      name,
      severity: 'Critical',
      detail: 'Backend detected database keywords inside request activity.',
    };
  }

  if (normalized.includes('command') || normalized.includes('xss')) {
    return {
      name,
      severity: 'High',
      detail: 'Backend matched a dangerous payload signature in the log stream.',
    };
  }

  if (normalized.includes('brute')) {
    return {
      name,
      severity: 'High',
      detail: 'Backend found repeated failed authentication attempts.',
    };
  }

  if (normalized.includes('suspicious') || normalized.includes('directory')) {
    return {
      name,
      severity: 'Medium',
      detail: 'Backend flagged an abnormal connection or path pattern.',
    };
  }

  return {
    name,
    severity: 'Medium',
    detail: 'Backend returned a suspicious security event.',
  };
}