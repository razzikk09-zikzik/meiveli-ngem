const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const sizes = [
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1906, height: 1075 },
    { width: 1920, height: 1080 }
  ];

  for (const size of sizes) {
    await page.setViewport(size);
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000)); // wait for animations and map
    
    // Save to artifacts
    const outPath = `C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\42f1e531-6357-4781-a16a-8945a4321eb1\\test_${size.width}x${size.height}.png`;
    await page.screenshot({ path: outPath });
    console.log(`Saved ${outPath}`);
  }
  
  await browser.close();
}

run().catch(console.error);
