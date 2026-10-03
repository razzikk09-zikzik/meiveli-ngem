import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const logoPath = path.resolve('./public/assets/logo.png');
const out192 = path.resolve('./public/assets/icon-192.png');
const out512 = path.resolve('./public/assets/icon-512.png');

async function resize() {
  await sharp(logoPath).resize(192, 192).toFile(out192);
  await sharp(logoPath).resize(512, 512).toFile(out512);
  console.log('Icons generated');
}
resize();
