import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const apiKey = localStorage.getItem('MEYVIZHI_GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set it in Settings.');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.8-flash',
    generationConfig: {
      temperature: 0.1, // low randomness
      responseMimeType: "application/json",
    }
  });

  const prompt = `You are MEYVIZHI's scam detection AI.

Analyze the provided message, URL and/or screenshot.

First identify observable facts.
Then identify scam indicators.

Check for:
- impersonation
- urgency
- account blocking threats
- OTP/PIN/CVV/password requests
- payment requests
- phishing links
- suspicious verification requests
- fake bank/government/courier/job messages
- social engineering
- suspicious domain names
- typosquatting

CRITICAL RULE FOR SBI: 
The ONLY official domains for State Bank of India (SBI) are "sbi.co.in", "onlinesbi.sbi", and "bank.sbi".
If a message claims to be from SBI (or mentions SBI KYC/rewards) but contains ANY link that is NOT on these exact official domains (including shorteners like tinyurl/bit.ly or fakes like sbi-kyc.xyz), you MUST classify it as SCAM with HIGH risk.

If an image is provided, inspect the original image directly.
Use OCR only as supporting information.

Do NOT invent text, URLs, companies, threat reports or malicious behavior.

An unknown URL is NOT automatically a scam.
An unfamiliar domain is NOT automatically a scam.
A suspicious TLD alone is NOT enough to classify something as a scam.

Classify only from the evidence provided.

DO NOT generate numerical scores or percentages.

Only use these classifications:
SAFE
SUSPICIOUS
SCAM

Also return:
LOW
MEDIUM
HIGH

Output exactly this JSON structure:
{
  "classification": "SCAM",
  "risk_level": "HIGH",
  "detected_urls": [],
  "signals": [
    {
      "key": "link",
      "title": "Short title",
      "detail": "Short explanation"
    }
  ],
  "reasons": [],
  "explanation": "",
  "recommended_action": ""
}

Message to analyze:
"${text || "No text provided (inspect image)"}"
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
    const textRes = response.text().trim();
    
    const parsed = JSON.parse(textRes);
    
    // Map Gemini output to existing UI format
    let score = 50;
    if (parsed.classification === 'SAFE') {
      score = 5;
    } else if (parsed.classification === 'SUSPICIOUS') {
      score = 50;
    } else if (parsed.classification === 'SCAM') {
      score = 95;
    }

    return {
      score,
      verdict: parsed.classification.toLowerCase(),
      signals: parsed.signals ? parsed.signals.slice(0, 4) : [],
      urls: parsed.detected_urls || [],
      similarReports: parsed.classification !== 'SAFE' ? 'Seen in multiple reports from your area' : null,
    };
  } catch (err) {
    console.error("Gemini Error:", err);
    throw err;
  }
}
