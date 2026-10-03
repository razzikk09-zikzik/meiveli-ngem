import { analyzeWithGemini } from './src/utils/analyze.js';

async function run() {
  const text = "Sir ungal SBI account block aagidum. Inga click pannunga: https://sbi-kyc-update.xyz/verify";
  console.log("Testing text only...");
  try {
    const res = await analyzeWithGemini(text);
    console.log("Text Result:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}

run();
