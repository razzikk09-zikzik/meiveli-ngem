# Meiveli-NGEM: Threat Detection & Classification System

This document outlines the core threat detection architecture of the Meiveli system, explaining how user-submitted reports are analyzed, classified, and filtered before appearing on the active threat map.

## Core Flow Overview
1. **Citizen Reports:** A citizen submits a report (text or URL) via `ReportPage.jsx`.
2. **Analysis:** `domainAnalyzer.js` parses the content, extracts URLs, and evaluates them against `trustedDomains.js`.
3. **Classification:** The report is tagged as `Safe`, `Suspicious`, or `Scam`.
4. **Analyst Review:** Analysts review pending reports in `AnalystDashboard.jsx` and can manually override the AI classification.
5. **Public Map:** `useHotspots.js` strictly filters the database to ensure only risky, non-rejected reports appear on the public mobile view.

---

## How the Intelligence Engine Works (`src/utils/domainAnalyzer.js`)

When a user submits text, the `buildDomainIntelligence` function runs the following checks:

### 1. URL Extraction & Parsing
The system uses regex to extract any link starting with `http://` or `https://`. 
*(Note: If a user submits `digital.licindia.in` without the `https://`, the system currently fails to recognize it as a URL and falls back to classifying the report as `Suspicious` to be safe).*

Once extracted, it parses the **Registered Domain**. It is smart enough to handle complex Indian TLDs (like `.gov.in`, `.co.in`). 
- `https://digital.licindia.in/login` → Registered domain: `licindia.in`
- `https://onlinesbi.sbi/` → Registered domain: `onlinesbi.sbi`

### 2. The Trusted Domain Vault (`src/utils/trustedDomains.js`)
The parsed domain is checked against `TRUSTED_DOMAINS`, a strictly maintained whitelist of official Government, Banking, Insurance, and Tech portals.
- If the domain matches a trusted root, it gets `trusted: true`.

**Crucial Security Concept: Subdomains and Paths**
If an attacker submits `https://sbi.co.in/scam-page`, the system extracts `sbi.co.in` as the root. Because `sbi.co.in` is trusted, the link is flagged as `Safe`. This is correct behavior: scammers cannot host pages on official banking domains without breaching the bank's own servers. 
Conversely, if an attacker creates `https://sbi.co.in.xyz/`, the system correctly extracts `in.xyz` as the root domain, realizes it is not in the trusted list, and flags it as `Suspicious`.

### 3. Brand Impersonation Detection
The analyzer checks if the user's text mentions a major brand (e.g., "SBI") but the URL doesn't match the official domain (e.g., `https://sbi-kyc-update.xyz`). If a mismatch is detected, `brandMismatch: true` is flagged, instantly ruining the URL's trust score.

### 4. URL Shorteners & Tunnels
Links using `tinyurl.com`, `bit.ly`, or tunnel services like `ngrok` are checked against hardcoded blacklists in `trustedDomains.js`. Because shorteners mask the true destination, the system defaults them to `trusted: false` and flags them as `Suspicious`.

---

## Classification Logic (`src/pages/ReportPage.jsx`)

Based on the intelligence gathered, the app automatically classifies the report:

* **Safe (`classification: 'Safe', status: 'auto_rejected'`)**
  Triggered when the report contains a verified official domain AND there is no brand mismatch. Safe reports are inherently hidden from the public map to prevent false alarms against legitimate entities.

* **Suspicious / Scam (`classification: 'Suspicious', status: 'Pending'`)**
  Triggered for unknown domains, URL shorteners, brand mismatches, suspicious TLDs (`.xyz`, `.top`), or text-only reports. 

---

## Analyst Override (`src/pages/AnalystDashboard.jsx`)

AI is not perfect. Users may submit valid URLs without `https://` (causing a false `Suspicious` flag) or URL shorteners that are actually safe.
To solve this, Analysts have an **override dropdown** in the dashboard. 
- Changing a `Suspicious` report to `Safe` instantly updates the database.

---

## Public Display Filtering (`src/hooks/useHotspots.js`)

The `ThreatsPage.jsx` and `ThreatMap.jsx` rely entirely on `useHotspots.js` to feed them data. This hook acts as a strict firewall:
1. It **excludes** any report where `status === 'Rejected'`.
2. It **excludes** any report where `classification === 'Safe'`.
3. It only processes and maps reports that are `Scam` or `Suspicious`.

Because of this, the moment an Analyst changes a false-positive domain to `Safe`, the realtime Supabase subscription fires, the hook recalculates, and the item vanishes from the mobile active threats list instantly.


---

## Project Structure & File Directory

### 📂 `src/pages/` (Views & Routes)
- **`AnalystDashboard.jsx`**: The desktop command center. Allows analysts to monitor real-time threat maps, view incoming reports, and manually override `status` (Approve/Reject) or `classification` (Safe/Suspicious).
- **`DesktopGateway.jsx`**: A routing interceptor. If a user opens the app on a large screen, this prompts them to enter the Analyst Dashboard or view the mobile layout.
- **`ReportPage.jsx`**: The 3-step citizen reporting flow. This captures text/links and runs it through `domainAnalyzer.js` for instant AI classification before saving to Supabase.
- **`ThreatsPage.jsx`**: The mobile "Active Threats" view. Displays the map and the top 5 most reported threats to citizens.
- **`HomePage.jsx`**: The mobile citizen homepage featuring a feed of recently verified scams and educational articles.
- **`GuidePage.jsx`**: Educational module for citizens on how to identify various local scams (e.g., Electricity bill scams, KYC scams).

### 📂 `src/hooks/` (Data & State Management)
- **`useHotspots.js`**: The central data engine of the app. It connects to Supabase, fetches reports, sets up Realtime subscriptions, and aggregates raw reports into grouped `hotspots` for the map. Crucially, it acts as the security filter—ensuring `Safe` and `Rejected` reports never reach the citizen views.

### 📂 `src/components/` (Reusable UI)
- **`ThreatMap.jsx`**: A flexible Leaflet map component used by both citizens and analysts. It renders pulsating heatmap halos based on report density.

### 📂 `src/utils/` (Core Intelligence & Utilities)
- **`domainAnalyzer.js`**: The local threat intelligence engine. Parses URLs, handles complex Indian TLDs, and checks for brand impersonation against trusted lists.
- **`trustedDomains.js`**: A strictly maintained whitelist database of official government portals, banks, and tech giants. Also contains lists of known URL shorteners.
- **`indicatorUtils.js`**: Helper functions to normalize threats. For example, ensuring `https://sbi-update.xyz/login` and `sbi-update.xyz` are grouped as the exact same threat.
- **`scamPatterns.js`**: Contains known local text-based scam footprints (e.g., "TNEB bill suspended").
- **`supabase.js`**: Initializes the connection to the Supabase PostgreSQL database.
- **`translations.js`**: Contains the localization dictionary for switching the app between English and Tamil.

### 📂 `src/context/`
- **`LanguageContext.jsx`**: React Context Provider that manages the active language state globally across all components.

### 📂 `src/data/`
- **`mock.js`**: Contains placeholder UI configuration elements (like tile definitions for the reporting page).

### 📂 `Root Files`
- **`App.jsx`**: The main entry point and React Router configuration. It handles the responsive split between the mobile PWA shell and the desktop dashboard.
- **`index.css`**: Global CSS variables, fonts, and foundational styling.

---

## 30 Tough Questions (Judge/Panel Defense)

Below is a curated list of practical, highly technical, and operational questions a judging panel might ask about this architecture, along with robust answers defending the implementation.

### Domain Parsing & Validation
**1. How do you extract the "root" domain from a URL like `https://sbi.co.in.xyz/` to prevent spoofing?**
*Answer:* We split the hostname by dots and check against an array of complex TLDs (like `.co.in`, `.gov.in`). If it ends in `.xyz`, the system recognizes `in.xyz` as the registered domain, which will fail our `TRUSTED_DOMAINS` whitelist, successfully flagging the `.xyz` domain as Suspicious.

**2. What happens if an attacker hosts a phishing page on a legitimate site, like `https://sbi.co.in/phishing`?**
*Answer:* Our system extracts `sbi.co.in` as the root domain. Because it is in the whitelist, it flags it as `Safe`. This is the *correct* behavior for this system; an attacker cannot host a page on `sbi.co.in` unless they have actively breached the bank's servers, which is beyond the scope of a crowdsourced phishing filter. 

**3. Why use a hardcoded whitelist (`trustedDomains.js`) instead of an API?**
*Answer:* Speed, offline resilience, and zero API costs. A hardcoded, curated list of the top 200 Indian banking, government, and payment domains resolves instantly on the client side without network latency.

**4. What if a legitimate user submits a valid URL without `http://` or `https://`?**
*Answer:* Our regex currently requires the protocol to prevent aggressively parsing normal sentences with dots as URLs. If omitted, the engine fails to match it as a URL and falls back to flagging the entire report as `Suspicious`. An analyst can easily override this via the dashboard.

**5. How does the system handle Internationalized Domain Names (IDNs) or Punycode (e.g., `xn--sbi-8x3a.com`)?**
*Answer:* Currently, Punycode domains will not match the English strings in `TRUSTED_DOMAINS` and will naturally fall back to being flagged as `Suspicious`.

### Brand Impersonation & Shorteners
**6. How do you determine if a domain is impersonating a brand?**
*Answer:* `domainAnalyzer.js` cross-references the raw text with the URL. If the user's text mentions "SBI" or "LIC", but the root domain extracted is NOT `sbi.co.in` or `licindia.in`, `brandMismatch` is flagged to true.

**7. Why do you flag URL shorteners like `tinyurl.com` or `bit.ly` as Suspicious by default?**
*Answer:* Shorteners obfuscate the final destination. In cybersecurity context, an unexpanded shortener in a user-reported scam is highly likely to be malicious. 

**8. Is there a scenario where a URL shortener is flagged as Safe?**
*Answer:* No, not automatically. The AI defaults them to Suspicious. However, if an analyst verifies the shortener leads to a benign page, they can manually override the classification to `Safe` in the dashboard.

**9. How do you handle tunnel services like `ngrok` or `vercel.app`?**
*Answer:* They are treated exactly like shorteners. We maintain a `TUNNEL_SERVICES` blacklist. Because these services allow anonymous, ephemeral hosting, any link ending in `.ngrok.io` or `.vercel.app` is automatically flagged as Suspicious.

**10. Can scammers bypass your system using multiple redirects?**
*Answer:* Our local client-side engine only analyzes the *provided* URL. We do not automatically follow HTTP redirects to prevent Client-Side Request Forgery (CSRF) or IP tracking. If the initial link is a shortener, it is flagged as Suspicious immediately.

### AI vs Local Heuristics
**11. How much of this system is running on a massive LLM (like Gemini) vs local heuristics?**
*Answer:* The core domain threat detection (`domainAnalyzer.js`) relies 100% on local JavaScript heuristics (Regex, TLD parsing, Brand Mismatch). We prioritize local heuristics because they are deterministic, instant, free, and privacy-preserving.

**12. When would you actually use an LLM in this flow?**
*Answer:* We would use an LLM for OCR (extracting text from screenshots of SMS/WhatsApp messages) or for parsing highly convoluted, unstructured text reports where regex fails to extract context.

**13. What is the latency of the threat detection engine?**
*Answer:* Near zero. Because it runs locally on the user's device via `domainAnalyzer.js` before the Supabase network request is even made, classification happens in less than a millisecond.

**14. Don't local heuristics lead to a high false-positive rate?**
*Answer:* Yes, but we intentionally bias the system toward false positives (flagging safe items as Suspicious) rather than false negatives. It is better for a safe link to wait in the Analyst's "Pending" queue than for a phishing link to slip through as Safe.

**15. How do you prevent users from reverse-engineering your `trustedDomains.js` list?**
*Answer:* Since it's bundled in the client JS, they can see it. However, knowing the whitelist doesn't help them bypass the system, because to get flagged as `Safe`, they *must* host their scam on a domain in that whitelist (which they don't own).

### Analyst Dashboard & Overrides
**16. What happens when an Analyst changes a report from `Suspicious` to `Safe`?**
*Answer:* A Supabase update query modifies the row. Supabase Realtime broadcasts this to all connected citizen apps. The `useHotspots` hook immediately recalculates, dropping the `Safe` report, and it vanishes from the public map instantly.

**17. Why are `Safe` reports excluded from the Citizen active threats map?**
*Answer:* To prevent "boy who cried wolf" syndrome. If we populate the map with safe domains (like legitimate SBI links that confused users), citizens will start ignoring the map. The map must only display verified, active risks.

**18. Do Analysts see `Safe` reports?**
*Answer:* Yes. Analysts see all reports, including `Safe` ones (which are marked `auto_rejected`), so they can audit the AI's performance and ensure legitimate scams weren't falsely cleared.

**19. How do you group identical threats together on the map and lists?**
*Answer:* We use `indicatorUtils.js` to normalize the content. For example, `https://scam.com/123` and `http://scam.com` are both normalized to `scam.com`. The UI then groups these and increments a `reports` counter.

**20. Why does the mobile map strictly show only the top 5 threats?**
*Answer:* Mobile screens are small, and users have limited attention spans. Showing a massive list of 1-off random test URLs dilutes the impact. Sorting by report count and slicing the top 5 ensures maximum public awareness for the most aggressive ongoing campaigns.

**21. What happens if two analysts try to approve the same report simultaneously?**
*Answer:* Supabase handles the concurrency at the database level. Both will send an `UPDATE` query. The state will be overwritten by the last one to arrive, but since both are setting it to `Approved`, the end state is identical.

**22. How do you ensure Citizens cannot access the Analyst Dashboard?**
*Answer:* While currently mock-routed via `DesktopGateway`, a production environment would secure the `/analyst` route using Supabase Auth (JWTs) and Row Level Security (RLS) policies that verify an `is_analyst` role claim.

**23. Are the pulsing map dots purely visual, or do they represent data?**
*Answer:* They represent data. The radius of the halo scales dynamically based on the number of reports in that area (up to a maximum size), and the color shifts (Blue -> Orange -> Red) based on threat density.

### Architecture, Database, & Future Scale
**24. Why use Supabase over Firebase for this?**
*Answer:* Supabase provides full PostgreSQL capabilities, allowing us to write complex spatial queries (PostGIS) in the future for the map, while still providing the exact same WebSockets realtime sync that Firebase offers.

**25. Does `useHotspots.js` fetch the entire database on load? Isn't that unscalable?**
*Answer:* Currently, it fetches a `.limit(200)` ordered by `created_at` descending. While sufficient for a prototype, at scale, we would implement a Postgres materialized view or edge function to aggregate the hotspots server-side.

**26. How do you handle geographic mapping when users only provide a neighborhood name?**
*Answer:* We use a hardcoded coordinate mapping for specific areas (like "Velachery" -> `[12.97, 80.22]`). In a production scale-up, this would be replaced with a Mapbox or Google Maps Geocoding API call.

**27. What is the impact of removing `overflow: hidden` from `index.css`?**
*Answer:* We removed it because it locked the height of the document to `100dvh`, which broke scrolling on the complex Analyst Dashboard. Removing it allowed standard document flow while we handled internal scrolling on specific map elements.

**28. How is multi-language (Tamil/English) supported without relying on Google Translate?**
*Answer:* We use a lightweight React Context (`LanguageContext.jsx`) tied to a static dictionary (`translations.js`). This guarantees high-performance, layout-stable translations that don't rely on unpredictable third-party DOM mutation.

**29. If the database goes offline, does the app crash?**
*Answer:* No. The Citizen reporting flow (`ReportPage.jsx`) handles `try/catch` errors and will show a clean error state (`Failed to submit`). The map will simply render the default layout with no hotspots. 

**30. What is the single weakest point of this architecture right now?**
*Answer:* The reliance on the user to accurately select their "Area" from a dropdown. Scams are often digital and borderless. A geographic map is visually engaging, but tying web phishing links to physical neighborhoods (unless it's a physical ATM skimmer) is structurally flawed. Future iterations should map threats by "Vector" (SMS, Web, WhatsApp) rather than physical geography.
