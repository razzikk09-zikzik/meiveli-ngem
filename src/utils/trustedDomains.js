// src/utils/trustedDomains.js

export const TRUSTED_DOMAINS = {
  // ==========================================
  // CENTRAL GOVERNMENT
  // ==========================================
  "india.gov.in": { organization: "National Portal of India", category: "government", trustLevel: "official", region: "india" },
  "gov.in": { organization: "Government of India", category: "government", trustLevel: "official", region: "india" },
  "nic.in": { organization: "National Informatics Centre", category: "government", trustLevel: "official", region: "india" },
  "mygov.in": { organization: "MyGov", category: "government", trustLevel: "official", region: "india" },
  "digilocker.gov.in": { organization: "DigiLocker", category: "government", trustLevel: "official", region: "india" },
  "cybercrime.gov.in": { organization: "National Cyber Crime Reporting Portal", category: "government", trustLevel: "official", region: "india" },
  "incometax.gov.in": { organization: "Income Tax Department", category: "government", trustLevel: "official", region: "india" },
  "gst.gov.in": { organization: "GST Portal", category: "government", trustLevel: "official", region: "india" },
  "uidai.gov.in": { organization: "UIDAI (Aadhaar)", category: "government", trustLevel: "official", region: "india" },
  "morth.nic.in": { organization: "Ministry of Road Transport and Highways", category: "government", trustLevel: "official", region: "india" },
  "digitalindia.gov.in": { organization: "Digital India", category: "government", trustLevel: "official", region: "india" },
  "passportindia.gov.in": { organization: "Passport Seva", category: "government", trustLevel: "official", region: "india" },

  // ==========================================
  // TAMIL NADU OFFICIAL
  // ==========================================
  "tn.gov.in": { organization: "Government of Tamil Nadu", category: "government", trustLevel: "official", region: "tamil_nadu" },
  "tnesevai.tn.gov.in": { organization: "e-Sevai Tamil Nadu", category: "government", trustLevel: "official", region: "tamil_nadu" },
  "tnega.tn.gov.in": { organization: "TNeGA", category: "government", trustLevel: "official", region: "tamil_nadu" },
  "tangedco.gov.in": { organization: "TANGEDCO (Electricity)", category: "utility", trustLevel: "official", region: "tamil_nadu", aliases: ["TNEB", "EB"] },
  "tnurbanepay.tn.gov.in": { organization: "TN Urban e-Pay", category: "government", trustLevel: "official", region: "tamil_nadu" },
  "tnrd.gov.in": { organization: "TN Rural Development", category: "government", trustLevel: "official", region: "tamil_nadu" },
  "twadboard.tn.gov.in": { organization: "TWAD Board (Water)", category: "utility", trustLevel: "official", region: "tamil_nadu" },
  "chennaimetrowater.tn.gov.in": { organization: "Chennai Metro Water", category: "utility", trustLevel: "official", region: "tamil_nadu" },
  "tnfrs.tn.nic.in": { organization: "TN Fire & Rescue", category: "government", trustLevel: "official", region: "tamil_nadu" },
  "tnpolice.gov.in": { organization: "Tamil Nadu Police", category: "law_enforcement", trustLevel: "official", region: "tamil_nadu" },

  // ==========================================
  // BANKING
  // ==========================================
  "sbi.co.in": { organization: "State Bank of India", category: "banking", trustLevel: "official", aliases: ["SBI", "State Bank", "YONO"] },
  "onlinesbi.sbi": { organization: "State Bank of India", category: "banking", trustLevel: "official" },
  "bank.sbi": { organization: "State Bank of India", category: "banking", trustLevel: "official" },
  "hdfcbank.com": { organization: "HDFC Bank", category: "banking", trustLevel: "official", aliases: ["HDFC"] },
  "icicibank.com": { organization: "ICICI Bank", category: "banking", trustLevel: "official", aliases: ["ICICI"] },
  "axisbank.com": { organization: "Axis Bank", category: "banking", trustLevel: "official", aliases: ["Axis"] },
  "canarabank.com": { organization: "Canara Bank", category: "banking", trustLevel: "official" },
  "indianbank.in": { organization: "Indian Bank", category: "banking", trustLevel: "official" },
  "iob.in": { organization: "Indian Overseas Bank", category: "banking", trustLevel: "official", aliases: ["IOB"] },
  "pnbindia.in": { organization: "Punjab National Bank", category: "banking", trustLevel: "official", aliases: ["PNB"] },
  "bankofbaroda.in": { organization: "Bank of Baroda", category: "banking", trustLevel: "official", aliases: ["BOB"] },
  "unionbankofindia.co.in": { organization: "Union Bank of India", category: "banking", trustLevel: "official", aliases: ["UBI"] },
  "bankofindia.co.in": { organization: "Bank of India", category: "banking", trustLevel: "official", aliases: ["BOI"] },
  "centralbankofindia.co.in": { organization: "Central Bank of India", category: "banking", trustLevel: "official", aliases: ["CBI"] },
  "idbibank.in": { organization: "IDBI Bank", category: "banking", trustLevel: "official", aliases: ["IDBI"] },
  "kotak.com": { organization: "Kotak Mahindra Bank", category: "banking", trustLevel: "official", aliases: ["Kotak"] },
  "indusind.com": { organization: "IndusInd Bank", category: "banking", trustLevel: "official" },
  "yesbank.in": { organization: "Yes Bank", category: "banking", trustLevel: "official" },
  "federalbank.co.in": { organization: "Federal Bank", category: "banking", trustLevel: "official" },
  "southindianbank.com": { organization: "South Indian Bank", category: "banking", trustLevel: "official", aliases: ["SIB"] },
  "kvb.co.in": { organization: "Karur Vysya Bank", category: "banking", trustLevel: "official", aliases: ["KVB"] },
  "cityunionbank.com": { organization: "City Union Bank", category: "banking", trustLevel: "official", aliases: ["CUB"] },
  "tmb.in": { organization: "Tamilnad Mercantile Bank", category: "banking", trustLevel: "official", aliases: ["TMB"] },

  // ==========================================
  // REGULATORY
  // ==========================================
  "rbi.org.in": { organization: "Reserve Bank of India", category: "government", trustLevel: "official", aliases: ["RBI"] },
  "npci.org.in": { organization: "National Payments Corporation of India", category: "government", trustLevel: "official", aliases: ["NPCI"] },

  // ==========================================
  // INSURANCE
  // ==========================================
  "licindia.in": { organization: "Life Insurance Corporation of India", category: "insurance", trustLevel: "official", aliases: ["LIC"] },
  "irdai.gov.in": { organization: "IRDAI", category: "insurance_regulatory", trustLevel: "official" },
  "sbilife.co.in": { organization: "SBI Life Insurance", category: "insurance", trustLevel: "official" },
  "hdfclife.com": { organization: "HDFC Life", category: "insurance", trustLevel: "official" },
  "iciciprulife.com": { organization: "ICICI Prudential", category: "insurance", trustLevel: "official" },
  "maxlifeinsurance.com": { organization: "Max Life Insurance", category: "insurance", trustLevel: "official" },
  "tataaia.com": { organization: "Tata AIA Life", category: "insurance", trustLevel: "official" },
  "bajajallianz.com": { organization: "Bajaj Allianz", category: "insurance", trustLevel: "official" },
  "starhealth.in": { organization: "Star Health", category: "insurance", trustLevel: "official" },
  "newindia.co.in": { organization: "New India Assurance", category: "insurance", trustLevel: "official" },
  "uiic.co.in": { organization: "United India Insurance", category: "insurance", trustLevel: "official" },
  "orientalinsurance.org.in": { organization: "Oriental Insurance", category: "insurance", trustLevel: "official" },
  "nationalinsurance.nic.co.in": { organization: "National Insurance", category: "insurance", trustLevel: "official" },

  // ==========================================
  // PAYMENTS / UPI
  // ==========================================
  "upi.org.in": { organization: "UPI", category: "payment", trustLevel: "official" },
  "paytm.com": { organization: "Paytm", category: "payment", trustLevel: "official" },
  "paytm.me": { organization: "Paytm", category: "payment", trustLevel: "official" },
  "phonepe.com": { organization: "PhonePe", category: "payment", trustLevel: "official" },
  "gpay.app": { organization: "Google Pay", category: "payment", trustLevel: "official" },
  "amazonpay.in": { organization: "Amazon Pay", category: "payment", trustLevel: "official" },
  "bhimupi.org.in": { organization: "BHIM", category: "payment", trustLevel: "official" },
  "cred.club": { organization: "CRED", category: "payment", trustLevel: "official" },

  // ==========================================
  // E-COMMERCE / DELIVERY / FOOD
  // ==========================================
  "amazon.in": { organization: "Amazon India", category: "ecommerce", trustLevel: "official", aliases: ["Amazon"] },
  "amazon.com": { organization: "Amazon", category: "ecommerce", trustLevel: "official" },
  "flipkart.com": { organization: "Flipkart", category: "ecommerce", trustLevel: "official" },
  "myntra.com": { organization: "Myntra", category: "ecommerce", trustLevel: "official" },
  "meesho.com": { organization: "Meesho", category: "ecommerce", trustLevel: "official" },
  "ajio.com": { organization: "AJIO", category: "ecommerce", trustLevel: "official" },
  "nykaa.com": { organization: "Nykaa", category: "ecommerce", trustLevel: "official" },
  "swiggy.com": { organization: "Swiggy", category: "ecommerce", trustLevel: "official" },
  "zomato.com": { organization: "Zomato", category: "ecommerce", trustLevel: "official" },
  "blinkit.com": { organization: "Blinkit", category: "ecommerce", trustLevel: "official" },
  "zeptonow.com": { organization: "Zepto", category: "ecommerce", trustLevel: "official" },
  "bigbasket.com": { organization: "BigBasket", category: "ecommerce", trustLevel: "official" },
  "jiomart.com": { organization: "JioMart", category: "ecommerce", trustLevel: "official" },
  "tatacliq.com": { organization: "Tata CLiQ", category: "ecommerce", trustLevel: "official" },

  // ==========================================
  // COURIER / LOGISTICS
  // ==========================================
  "indiapost.gov.in": { organization: "India Post", category: "courier", trustLevel: "official" },
  "bluedart.com": { organization: "Blue Dart", category: "courier", trustLevel: "official" },
  "dhl.com": { organization: "DHL", category: "courier", trustLevel: "official" },
  "fedex.com": { organization: "FedEx", category: "courier", trustLevel: "official" },
  "dtdc.in": { organization: "DTDC", category: "courier", trustLevel: "official" },
  "delhivery.com": { organization: "Delhivery", category: "courier", trustLevel: "official" },
  "ecomexpress.in": { organization: "Ecom Express", category: "courier", trustLevel: "official" },
  "ekartlogistics.com": { organization: "Ekart", category: "courier", trustLevel: "official" },

  // ==========================================
  // TRANSPORT / TRAVEL
  // ==========================================
  "parivahan.gov.in": { organization: "Parivahan (Transport)", category: "transport", trustLevel: "official", aliases: ["VAHAN", "SARATHI"] },
  "echallan.parivahan.gov.in": { organization: "eChallan", category: "transport", trustLevel: "official" },
  "irctc.co.in": { organization: "IRCTC", category: "travel", trustLevel: "official", aliases: ["Indian Railways"] },
  "indianrailways.gov.in": { organization: "Indian Railways", category: "travel", trustLevel: "official" },
  "aai.aero": { organization: "Airports Authority of India", category: "travel", trustLevel: "official" },
  "airindia.in": { organization: "Air India", category: "travel", trustLevel: "official" },
  "goindigo.in": { organization: "IndiGo", category: "travel", trustLevel: "official" },
  "akasaair.com": { organization: "Akasa Air", category: "travel", trustLevel: "official" },
  "makemytrip.com": { organization: "MakeMyTrip", category: "travel", trustLevel: "official" },
  "cleartrip.com": { organization: "Cleartrip", category: "travel", trustLevel: "official" },
  "yatra.com": { organization: "Yatra", category: "travel", trustLevel: "official" },
  "redbus.in": { organization: "redBus", category: "travel", trustLevel: "official" },
  "goibibo.com": { organization: "Goibibo", category: "travel", trustLevel: "official" },

  // ==========================================
  // TELECOM
  // ==========================================
  "jio.com": { organization: "Jio", category: "telecom", trustLevel: "official" },
  "airtel.in": { organization: "Airtel", category: "telecom", trustLevel: "official" },
  "myvi.in": { organization: "Vi (Vodafone Idea)", category: "telecom", trustLevel: "official" },
  "bsnl.co.in": { organization: "BSNL", category: "telecom", trustLevel: "official" },
  "trai.gov.in": { organization: "TRAI", category: "government", trustLevel: "official" },

  // ==========================================
  // EDUCATION / EXAMS
  // ==========================================
  "cbse.gov.in": { organization: "CBSE", category: "education", trustLevel: "official" },
  "nta.ac.in": { organization: "NTA", category: "education", trustLevel: "official" },
  "ugc.ac.in": { organization: "UGC", category: "education", trustLevel: "official" },
  "aicte-india.org": { organization: "AICTE", category: "education", trustLevel: "official" },
  "annauniv.edu": { organization: "Anna University", category: "education", trustLevel: "official", region: "tamil_nadu" },
  "tneaonline.org": { organization: "TNEA", category: "education", trustLevel: "official", region: "tamil_nadu" },
  "tnpsc.gov.in": { organization: "TNPSC", category: "education", trustLevel: "official", region: "tamil_nadu" },
  "upsc.gov.in": { organization: "UPSC", category: "education", trustLevel: "official" },
  "ssc.nic.in": { organization: "SSC", category: "education", trustLevel: "official" },

  // ==========================================
  // JOB / RECRUITMENT
  // ==========================================
  "ncs.gov.in": { organization: "National Career Service", category: "jobs", trustLevel: "official" },
  "linkedin.com": { organization: "LinkedIn", category: "jobs", trustLevel: "official" },
  "naukri.com": { organization: "Naukri", category: "jobs", trustLevel: "official" },
  "indeed.com": { organization: "Indeed", category: "jobs", trustLevel: "official" },
  "internshala.com": { organization: "Internshala", category: "jobs", trustLevel: "official" },
  "foundit.in": { organization: "Foundit", category: "jobs", trustLevel: "official" },
  
  // ==========================================
  // SOCIAL MEDIA & BIG TECH
  // ==========================================
  "google.com": { organization: "Google", category: "tech", trustLevel: "official" },
  "youtube.com": { organization: "YouTube", category: "tech", trustLevel: "official" },
  "facebook.com": { organization: "Meta (Facebook)", category: "social", trustLevel: "official" },
  "instagram.com": { organization: "Instagram", category: "social", trustLevel: "official" },
  "whatsapp.com": { organization: "WhatsApp", category: "social", trustLevel: "official" },
  "twitter.com": { organization: "X (Twitter)", category: "social", trustLevel: "official" },
  "x.com": { organization: "X (Twitter)", category: "social", trustLevel: "official" },
  "apple.com": { organization: "Apple", category: "tech", trustLevel: "official" },
  "microsoft.com": { organization: "Microsoft", category: "tech", trustLevel: "official" },
  "netflix.com": { organization: "Netflix", category: "streaming", trustLevel: "official" },
  "hotstar.com": { organization: "Disney+ Hotstar", category: "streaming", trustLevel: "official" },
  "primevideo.com": { organization: "Amazon Prime Video", category: "streaming", trustLevel: "official" },
};

export const COMMON_URL_SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "rb.gy", "ow.ly", "is.gd", "v.gd", "shorturl.at", "rebrand.ly", "goo.gl", "lnkd.in"
]);

export const TUNNEL_SERVICES = new Set([
  "ngrok.io", "ngrok-free.app", "loca.lt", "duckdns.org", "no-ip.org", "no-ip.com", 
  "vercel.app", "netlify.app", "firebaseapp.com", "pages.dev", "github.io"
]);
