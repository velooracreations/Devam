const sharp = require('sharp');
const path = require('path');

async function createStudioShot() {
  const width = 1000;
  const height = 1250;
  
  const bgSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunburst" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FFFDF8" />
          <stop offset="35%" stop-color="#FAF0DA" />
          <stop offset="70%" stop-color="#EED6AC" />
          <stop offset="100%" stop-color="#DEC293" />
        </radialGradient>
        <linearGradient id="counterTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#8A5229" />
          <stop offset="6%" stop-color="#6E3E1A" />
          <stop offset="25%" stop-color="#4E2B10" />
          <stop offset="100%" stop-color="#331A08" />
        </linearGradient>
        <linearGradient id="counterHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.05)" />
          <stop offset="50%" stop-color="rgba(255,230,180,0.4)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.05)" />
        </linearGradient>
        <radialGradient id="contactShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(20, 10, 5, 0.75)" />
          <stop offset="40%" stop-color="rgba(30, 15, 8, 0.45)" />
          <stop offset="75%" stop-color="rgba(40, 20, 10, 0.15)" />
          <stop offset="100%" stop-color="rgba(40, 20, 10, 0)" />
        </radialGradient>
        <radialGradient id="ambientHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(245, 190, 40, 0.3)" />
          <stop offset="50%" stop-color="rgba(230, 150, 20, 0.12)" />
          <stop offset="100%" stop-color="rgba(230, 150, 20, 0)" />
        </radialGradient>
      </defs>
      
      <!-- Studio Wall Background with warm golden gradient -->
      <rect width="${width}" height="${height}" fill="url(#sunburst)" />
      
      <!-- Ambient Golden Backlight Halo -->
      <ellipse cx="${width/2}" cy="500" rx="380" ry="380" fill="url(#ambientHalo)" />
      
      <!-- Warm Wooden Countertop Table Base -->
      <rect x="0" y="1000" width="${width}" height="250" fill="url(#counterTop)" />
      <rect x="0" y="1000" width="${width}" height="5" fill="url(#counterHighlight)" />
      
      <!-- Realistic Contact Floor Shadow -->
      <ellipse cx="${width/2}" cy="1005" rx="300" ry="36" fill="url(#contactShadow)" />
    </svg>
  `);
  
  // Resize transparent pouch
  const pouchHeight = 960;
  const pouch = await sharp('public/devam-atta-5kg-pouch.png')
    .resize({ height: pouchHeight, fit: 'contain' })
    .toBuffer();
    
  const pouchMeta = await sharp(pouch).metadata();
  const pouchLeft = Math.round((width - pouchMeta.width) / 2);
  const pouchTop = 60;
  
  const finalImage = await sharp(bgSvg)
    .composite([
      {
        input: pouch,
        top: pouchTop,
        left: pouchLeft
      }
    ])
    .jpeg({ quality: 94, mozjpeg: true })
    .toFile('public/devam-atta-5kg-studio.jpg');
    
  console.log('Successfully created public/devam-atta-5kg-studio.jpg', finalImage);
}

createStudioShot().catch(err => {
  console.error(err);
  process.exit(1);
});
