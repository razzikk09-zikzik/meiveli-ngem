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
