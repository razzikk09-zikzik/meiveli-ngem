export function generateIndicatorKey(type, content) {
  if (!content) return 'unknown';
  
  const text = content.toLowerCase().trim();
  
  if (type === 'web') {
    try {
      // Try to extract domain
      let urlStr = text;
      if (!urlStr.startsWith('http')) {
        urlStr = 'http://' + urlStr;
      }
      const url = new URL(urlStr);
      let domain = url.hostname;
      if (domain.startsWith('www.')) domain = domain.slice(4);
      return domain;
    } catch (e) {
      // fallback if not a valid URL
      const parts = text.split('/');
      let domain = parts[0];
      if (domain.startsWith('www.')) domain = domain.slice(4);
      return domain;
    }
  } else {
    // For SMS/Text, look for phone numbers or UPI IDs first
    // Simple UPI ID regex
    const upiMatch = text.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/);
    if (upiMatch) {
      return upiMatch[0];
    }
    
    // Simple phone number extraction (10 digits)
    const phoneMatch = text.match(/(?:\+91|0)?[ -]?([6-9]\d{9})/);
    if (phoneMatch) {
      return phoneMatch[1]; // just the 10 digits
    }

    // fallback: hash the text (simple hash)
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash)}`;
  }
}
