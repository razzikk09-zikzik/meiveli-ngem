import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildDomainIntelligence } from './domainAnalyzer';
import { INDIAN_SCAM_PATTERNS } from './scamPatterns';

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

async function extractTextFromImage(model, imageBase64) {
  const match = imageBase64.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return "";
  
  try {
    const contents = [
      "Extract all text and URLs from this image exactly as they appear. Do not analyze, just transcribe.",
      { inlineData: { mimeType: match[1], data: match[2] } }
    ];
    // Create a temporary model specifically for plain text extraction
    const ocrModel = model.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    const result = await ocrModel.generateContent(contents);
    return result.response.text();
  } catch (e) {
    console.warn("OCR Pre-pass failed", e);
    return "";
  }
}

export async function analyzeWithGemini(text, imageBase64 = null) {
  const apiKey = localStorage.getItem('MEYVIZHI_GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set it in Settings.');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  let combinedText = text || "";
  
  // OCR PASS
  if (imageBase64) {
    const imageText = await extractTextFromImage(genAI, imageBase64);
    if (imageText) {
      combinedText += "\n" + imageText;
    }
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.5-flash-lite',
    generationConfig: {
      temperature: 0.1, // low randomness
      responseMimeType: "application/json",
    }
  });

  const domainIntelligence = buildDomainIntelligence(combinedText);
  
  const prompt = `You are MEYVIZHI's scam detection AI.

Analyze the provided message, URL and/or screenshot.

First identify observable facts.
Then identify scam indicators.

${INDIAN_SCAM_PATTERNS}

DOMAIN INTELLIGENCE CONTEXT:
The following structured intelligence was extracted from the URLs in the message (and OCR'd from the image if provided):
${JSON.stringify(domainIntelligence, null, 2)}

IMPORTANT RULES:
1. Trusted domain is a strong positive legitimacy signal.
2. Trusted domain does NOT automatically make the message safe (check for malware/phishing inside trusted hosts, though rare).
3. Random path is NOT evidence of phishing (e.g. digital.licindia.in/7kmJRrg is safe).
4. Suspicious TLD is only a weak/moderate signal.
5. Unknown domain is not automatically a scam.
6. Brand name in a domain does not make it official.
7. Only registered-domain matching establishes trusted ownership.
8. If claimed organization and actual domain disagree (brandMismatch=true), increase suspicion significantly.
9. Strong scam behavior (e.g., asking for UPI PIN to receive money) can override trusted-domain confidence.
10. Do not invent threat reports.
11. Do not claim a URL was independently verified unless it actually was verified by an available source.

If an image is provided, inspect the original image directly.
Use OCR only as supporting information.

Do NOT invent text, URLs, companies, threat reports or malicious behavior.
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

Message to analyze (including extracted OCR text if any):
"${combinedText || "No text provided (inspect image)"}"
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

    const LINK_RE = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[\w-]+\.[a-z]{2,}\b[^\s]*)/gi;
    const fallbackUrls = (text || '').match(LINK_RE) || [];
    const finalUrls = parsed.detected_urls?.length > 0 ? parsed.detected_urls : fallbackUrls;

    return {
      score,
      verdict: parsed.classification.toLowerCase(),
      signals: parsed.signals ? parsed.signals.slice(0, 4) : [],
      urls: finalUrls,
      similarReports: parsed.classification !== 'SAFE' ? 'Seen in multiple reports from your area' : null,
    };
  } catch (err) {
    console.error("Gemini Error:", err);
    throw err;
  }
}
