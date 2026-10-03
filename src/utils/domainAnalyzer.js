// src/utils/domainAnalyzer.js
import { TRUSTED_DOMAINS, COMMON_URL_SHORTENERS, TUNNEL_SERVICES } from './trustedDomains.js';

/**
 * Extracts URLs from a given text.
 */
export function extractUrls(text) {
  if (!text) return [];
  // Regex to match URLs. Basic implementation.
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

/**
 * Parses the actual registered/root domain from a hostname.
 * Accounts for complex TLDs like .co.in, .gov.in, etc.
 */
export function extractRegisteredDomain(hostname) {
  if (!hostname) return '';
  const parts = hostname.toLowerCase().split('.');
  
  // Handled two-level TLDs common in India and globally
  const complexTlds = [
    'co.in', 'gov.in', 'org.in', 'ac.in', 'nic.in', 'net.in', 'res.in', 'tn.gov.in', 'co.uk', 'com.au', 'co.nz'
  ];
  
  for (const tld of complexTlds) {
    if (hostname.endsWith('.' + tld)) {
      const tldPartsCount = tld.split('.').length;
      if (parts.length > tldPartsCount) {
        return parts.slice(- (tldPartsCount + 1)).join('.');
      }
      return hostname; // It's just "gov.in"
    }
  }
  
  // Standard single-level TLDs (.com, .in, .xyz)
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  
  return hostname;
}

/**
 * Checks for brand impersonation.
 * Example: if text/url contains 'sbi' but registered domain is NOT 'sbi.co.in'
 */
function detectBrandMismatch(registeredDomain, text, url) {
  const lowerText = text.toLowerCase();
  const lowerUrl = url.toLowerCase();
  
  const brandKeywords = [
    { name: 'sbi', officialDomains: ['sbi.co.in', 'sbi'] },
    { name: 'lic', officialDomains: ['licindia.in'] },
    { name: 'tneb', officialDomains: ['tangedco.gov.in'] },
    { name: 'tangedco', officialDomains: ['tangedco.gov.in'] },
    { name: 'amazon', officialDomains: ['amazon.in', 'amazon.com'] },
    { name: 'flipkart', officialDomains: ['flipkart.com'] },
    { name: 'india post', officialDomains: ['indiapost.gov.in'] },
    { name: 'echallan', officialDomains: ['parivahan.gov.in'] }
  ];

  for (const brand of brandKeywords) {
    // If the brand is mentioned in the text or url
    if (lowerText.includes(brand.name) || lowerUrl.includes(brand.name)) {
      // Is the registered domain one of their official ones?
      const isOfficial = brand.officialDomains.some(od => registeredDomain === od || registeredDomain.endsWith('.' + od));
      if (!isOfficial) {
        return true; 
      }
    }
  }
  return false;
}

/**
 * Builds intelligence for all URLs found in the text.
 * Returns an array of intelligence objects.
 */
export function buildDomainIntelligence(text) {
  const urls = extractUrls(text);
  const intelligenceList = [];

  for (const urlStr of urls) {
    try {
      const parsedUrl = new URL(urlStr);
      const hostname = parsedUrl.hostname.toLowerCase();
      const registeredDomain = extractRegisteredDomain(hostname);
      
      const isShortener = COMMON_URL_SHORTENERS.has(registeredDomain);
      
      let isTunnel = false;
      for (const tunnel of TUNNEL_SERVICES) {
        if (hostname.endsWith('.' + tunnel) || hostname === tunnel) {
          isTunnel = true;
          break;
        }
      }

      let trustedInfo = TRUSTED_DOMAINS[hostname];
      if (!trustedInfo) {
        trustedInfo = TRUSTED_DOMAINS[registeredDomain];
      }
      
      // Checking TLDs
      const suspiciousTlds = ['.xyz', '.top', '.online', '.site', '.click', '.link', '.vip', '.buzz'];
      const hasSuspiciousTld = suspiciousTlds.some(tld => registeredDomain.endsWith(tld));
      
      const brandMismatch = detectBrandMismatch(registeredDomain, text, urlStr);
      
      // Random path check (just an indicator, not definitive)
      const path = parsedUrl.pathname;
      const isRandomPath = path.length > 5 && /^[a-zA-Z0-9]+$/.test(path.substring(1)); // e.g. /7kmJRrg

      const intelligence = {
        url: urlStr,
        hostname: hostname,
        registeredDomain: registeredDomain,
        trusted: !!trustedInfo,
        organization: trustedInfo ? trustedInfo.organization : null,
        category: trustedInfo ? trustedInfo.category : null,
        trustLevel: trustedInfo ? trustedInfo.trustLevel : (isShortener ? "unknown (shortener)" : "unknown"),
        path: path,
        signals: {
          randomPath: isRandomPath,
          suspiciousTld: hasSuspiciousTld,
          shortener: isShortener,
          tunnelService: isTunnel,
          brandMismatch: brandMismatch,
          rawIp: /^[0-9.]+$/.test(hostname)
        }
      };
      
      intelligenceList.push(intelligence);
    } catch (e) {
      // Invalid URL, skip
    }
  }
  
  return intelligenceList;
}
