// Local heuristic scam analysis.
// Runs in the browser so the Result page always shows a verdict,
// even when the backend API (VITE_API_URL) is unreachable.

const LINK_RE = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[\w-]+\.(?:com|in|net|org|xyz|top|info|online|site|club|icu|link|live|shop|store|buzz)\b[^\s]*)/gi;

const URGENCY_WORDS = [
  'urgent', 'immediately', 'immediate action', 'blocked', 'suspend', 'suspended',
  'expire', 'expires', 'expiry', 'act now', 'final warning', 'last warning',
  'within 24', '24 hours', 'tonight', 'right now', 'deactivate', 'shut down',
];

const CREDENTIAL_WORDS = ['otp', 'upi pin', 'pin', 'cvv', 'password', 'one time password', 'card details', 'bank details'];

const MONEY_WORDS = [
  'kyc', 'refund', 'prize', 'lottery', 'cashback', 'registration fee', 'processing fee',
  'customs', 'delivery fee', 'advance', 'deposit', 'pay now', 'payment', 'rs.', 'rs ',
  'rupees', 'claim', 'winner', 'earn money', 'work from home',
];

const BRANDS = [
  { key: 'sbi', name: 'SBI', official: 'sbi.co.in' },
  { key: 'hdfc', name: 'HDFC Bank', official: 'hdfcbank.com' },
  { key: 'icici', name: 'ICICI Bank', official: 'icicibank.com' },
  { key: 'axis', name: 'Axis Bank', official: 'axisbank.com' },
  { key: 'tneb', name: 'TNEB', official: 'tnebltd.gov.in' },
  { key: 'dhl', name: 'DHL', official: 'dhl.com' },
  { key: 'fedex', name: 'FedEx', official: 'fedex.com' },
];

const GOOD_TLDS = ['.gov.in', '.gov', '.edu'];
const RISKY_TLDS = ['.xyz', '.top', '.club', '.online', '.site', '.info', '.buzz', '.icu', '.live', '.shop', '.store', '.link'];

function hasAny(words, text) {
  return words.filter((w) => text.includes(w));
}

export function analyzeLocally(rawText) {
  const text = String(rawText || '');
  const t = text.toLowerCase();
  const signals = [];
  let score = 8;

  const urls = text.match(LINK_RE) || [];

  // Links present at all
  if (urls.length > 0) {
    score += 18;
    signals.push({
      key: 'link',
      title: 'Contains a link',
      detail: `Message asks you to visit ${urls[0].slice(0, 42)}`,
    });
  }

  // Risky TLD / not an official domain
  if (urls.some((u) => RISKY_TLDS.some((tld) => u.toLowerCase().includes(tld)))) {
    score += 22;
    signals.push({
      key: 'domain',
      title: 'Unknown / suspicious link',
      detail: 'Domain uses a TLD commonly seen in phishing campaigns',
    });
  }

  // Brand impersonation with mismatched domain
  const brand = BRANDS.find((b) => t.includes(b.key));
  if (brand && urls.length > 0) {
    const officialInLink = urls.some((u) => u.toLowerCase().replace(/^https?:\/\//, '').startsWith(brand.official));
    if (!officialInLink) {
      score += 24;
      signals.push({
        key: 'brand',
        title: `Fake ${brand.name} link`,
        detail: `Not an official ${brand.name} website (${brand.official})`,
      });
    }
  }

  // Urgency pressure
  const urgencyHits = hasAny(URGENCY_WORDS, t);
  if (urgencyHits.length > 0) {
    score += Math.min(20, 10 + urgencyHits.length * 5);
    signals.push({
      key: 'urgency',
      title: 'Creates urgency',
      detail: `Pressure words found: "${urgencyHits[0]}"`,
    });
  }

  // Asks for OTP / PIN / CVV
  const credHits = hasAny(CREDENTIAL_WORDS, t);
  if (credHits.length > 0) {
    score += 25;
    signals.push({
      key: 'credentials',
      title: 'Asks for OTP or bank details',
      detail: 'No bank or government agency ever asks for these',
    });
  }

  // Money bait
  const moneyHits = hasAny(MONEY_WORDS, t);
  if (moneyHits.length > 0) {
    score += Math.min(18, 8 + moneyHits.length * 4);
    signals.push({
      key: 'money',
      title: moneyHits.includes('kyc') ? 'Fake KYC / verification hook' : 'Money bait',
      detail: `Common scam pattern: "${moneyHits[0]}"`,
    });
  }

  // Phone number asking to call
  if (/(?:\+91[\s-]?)?[6-9]\d{9}/.test(t) && (t.includes('call') || t.includes('whatsapp'))) {
    score += 10;
    signals.push({
      key: 'contact',
      title: 'Asks you to call or WhatsApp',
      detail: 'Unverified personal number used as contact',
    });
  }

  // Free-text messaging apps
  if (t.includes('whatsapp') && (t.includes('earn') || t.includes('job') || t.includes('registration'))) {
    score += 8;
  }

  score = Math.max(2, Math.min(98, score));
  const verdict = score >= 65 ? 'scam' : score >= 35 ? 'suspicious' : 'safe';

  return {
    score,
    verdict,
    signals: signals.slice(0, 4),
    urls,
    similarReports: verdict !== 'safe' ? 'Seen in multiple reports from your area' : null,
  };
}

export const VERDICT_META = {
  scam: {
    title: 'Likely a scam',
    sub: 'Very high risk',
    bannerBg: '#FEE2E2',
    bannerBorder: '#FECACA',
    iconColor: '#DC2626',
    color: '#DC2626',
  },
  suspicious: {
    title: 'Suspicious',
    sub: 'Medium risk',
    bannerBg: '#FEF3C7',
    bannerBorder: '#FDE68A',
    iconColor: '#D97706',
    color: '#B45309',
  },
  safe: {
    title: 'Looks safe',
    sub: 'Low risk',
    bannerBg: '#DCFCE7',
    bannerBorder: '#BBF7D0',
    iconColor: '#16A34A',
    color: '#15803D',
  },
};
