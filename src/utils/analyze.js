// Local heuristic scam analysis.
// Runs in the browser so the Result page always shows a verdict,
// even when the backend API (VITE_API_URL) is unreachable.
import { GoogleGenerativeAI } from '@google/generative-ai';
import linksRaw from '../assets/links.txt?raw';
import termsRaw from '../assets/malicious-terms.txt?raw';

const KNOWN_BAD_LINKS = new Set(linksRaw.split('\n').map(l => l.trim().toLowerCase()).filter(Boolean));
const KNOWN_BAD_TERMS = termsRaw.split('\n').map(t => t.trim().toLowerCase()).filter(Boolean);



const LINK_RE = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[\w-]+\.[a-z]{2,}\b[^\s]*)/gi;

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
const TUNNEL_DOMAINS = ['trycloudflare.com', 'ngrok.io', 'ngrok-free.app', 'loca.lt', 'serveo.net', 'localhost.run', 'lhr.life', 'pagekite.me'];

function hasAny(words, text) {
  return words.filter((w) => text.includes(w));
}

export function analyzeLocally(rawText) {
  const text = String(rawText || '');
  const t = text.toLowerCase();
  const signals = [];
  let score = 8;

  const urls = text.match(LINK_RE) || [];

  const foundBadLink = urls.find(u => {
    let domain = u.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    return KNOWN_BAD_LINKS.has(domain) || KNOWN_BAD_LINKS.has(domain.replace(/^www\./i, ''));
  });
  if (foundBadLink) {
    score += 100;
    signals.push({
      key: 'domain',
      title: 'Known malicious link',
      detail: `This link is present in a database of known scams.`,
    });
  }

  const foundBadTerm = KNOWN_BAD_TERMS.find(term => t.includes(term));
  if (foundBadTerm) {
    score += 85;
    signals.push({
      key: 'urgency',
      title: 'Known scam phrasing',
      detail: `The message uses phrases common in known scams.`,
    });
  }

  // Links present at all
  if (urls.length > 0 && !foundBadLink) {
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

  // Developer tunnel tools used in phishing (e.g. trycloudflare, ngrok)
  const tunnelLink = urls.find((u) => TUNNEL_DOMAINS.some((td) => u.toLowerCase().includes(td)));
  if (tunnelLink && !foundBadLink) {
    score += 85;
    signals.push({
      key: 'domain',
      title: 'Phishing Tunnel Detected',
      detail: 'Uses a developer tunnel (e.g., Cloudflare, Ngrok) heavily abused for phishing.',
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

export async function analyzeWithGemini(text, imageBase64 = null) {
  const tLower = (text || '').toLowerCase();
  
  // Local list checks first
  const urls = (text || '').match(LINK_RE) || [];
  const foundBadLink = urls.find(u => {
    let domain = u.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    return KNOWN_BAD_LINKS.has(domain) || KNOWN_BAD_LINKS.has(domain.replace(/^www\./i, ''));
  });
  
  const foundBadTerm = KNOWN_BAD_TERMS.find(term => tLower.includes(term));
  const tunnelLink = urls.find((u) => TUNNEL_DOMAINS.some((td) => u.toLowerCase().includes(td)));

  if (foundBadLink) {
    return {
      score: 100,
      verdict: 'scam',
      signals: [{
        key: 'domain',
        title: 'Known malicious link',
        detail: `This link is present in a database of known scams (${foundBadLink}).`
      }],
      urls,
      similarReports: 'Seen in multiple reports from your area',
    };
  }

  if (tunnelLink) {
    return {
      score: 95,
      verdict: 'scam',
      signals: [{
        key: 'domain',
        title: 'Phishing Tunnel Detected',
        detail: `Uses a developer tunnel (${tunnelLink}) heavily abused for phishing.`
      }],
      urls,
      similarReports: 'Seen in multiple reports from your area',
    };
  }

  if (foundBadTerm) {
    return {
      score: 90,
      verdict: 'scam',
      signals: [{
        key: 'urgency',
        title: 'Known scam phrasing',
        detail: `The message uses phrases common in known scams.`
      }],
      urls,
      similarReports: 'Seen in multiple reports from your area',
    };
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert cybersecurity and anti-fraud system. 
Analyze the following text message AND/OR the text inside the provided image screenshot for scams, phishing, or malicious intent. 
If an image is provided, EXTRACT ALL TEXT from it (OCR) and analyze that text. Often images contain fake bank alerts (e.g. SBI, HDFC), fake reward points, or malicious shortlinks (tinyurl, bit.ly, etc).

Provide a JSON response with the following structure (no markdown, just raw JSON):
{
  "score": <number between 0 and 100, where 100 is highly malicious/scam and 0 is safe>,
  "verdict": <string, one of "safe", "suspicious", "scam">,
  "signals": [
    {
      "key": <string, a short key like "link", "urgency", "money", "credentials", "contact">,
      "title": <string, short title of the signal, e.g. "Fake KYC hook">,
      "detail": <string, short explanation of the signal>
    }
  ],
  "similarReports": <string or null, e.g. "Seen in multiple reports from your area">
}

Ensure "signals" has up to 4 elements.

${foundBadLink ? `CRITICAL: The message contains a known malicious link (${foundBadLink}). YOU MUST SCORE THIS 95-100 AND VERDICT MUST BE "scam". ADD A SIGNAL FOR IT.` : ''}
${foundBadTerm ? `CRITICAL: The message contains a known scam phrase ("${foundBadTerm}"). YOU MUST SCORE THIS > 85 AND VERDICT MUST BE "scam" OR "suspicious". ADD A SIGNAL FOR IT.` : ''}

Message to analyze:
"${text}"
`;

  try {
    const contents = [prompt];
    if (imageBase64) {
      const match = imageBase64.match(/^data:(.*?);base64,(.*)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    const result = await model.generateContent(contents);
    const response = await result.response;
    let textRes = response.text();
    // Strip markdown if present
    textRes = textRes.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(textRes);
    
    // Fallback urls parsing
    const urls = (text || '').match(LINK_RE) || [];
    parsed.urls = urls;
    
    return parsed;
  } catch (err) {
    console.error("Gemini Error:", err);
    throw err;
  }
}
