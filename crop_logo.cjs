// Crops the eye mark (left part of the brand banner) into public/assets/eye-mark.png
// and makes near-black pixels transparent if the source has no alpha.
const sharp = require('sharp');

const SRC = 'public/assets/logo.png';
const OUT = 'public/assets/eye-mark.png';

(async () => {
  const img = sharp(SRC);
  const meta = await img.metadata();
  console.log('source:', meta.width, 'x', meta.height, 'channels:', meta.channels);

  // Eye occupies roughly the left 30% of the banner, vertically centered
  const left = Math.round(meta.width * 0.035);
  const top = Math.round(meta.height * 0.09);
  const width = Math.round(meta.width * 0.27);
  const height = Math.round(meta.height * 0.82);

  let pipeline = sharp(SRC).extract({ left, top, width, height });

  if (meta.channels === 3) {
    // No alpha channel: map near-black background to transparency
    const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += info.channels) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 26) data[i + 3] = 0;
      else if (lum < 60) data[i + 3] = Math.round(((lum - 26) / 34) * 255);
      else data[i + 3] = 255;
    }
    pipeline = sharp(data, { raw: info });
  }

  await pipeline.ensureAlpha().png().toFile(OUT);
  const outMeta = await sharp(OUT).metadata();
  console.log('written:', OUT, outMeta.width, 'x', outMeta.height, 'channels:', outMeta.channels);
})().catch((e) => { console.error(e); process.exit(1); });
