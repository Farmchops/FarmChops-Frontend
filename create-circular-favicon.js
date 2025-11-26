const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function createCircularFavicon() {
  try {
    // Load the image
    const img = await loadImage('C:\\Users\\Hp\\Downloads\\Gemini_Generated_Image_254g5f254g5f254g.png');

    // Create a square canvas (use the smaller dimension)
    const size = Math.min(img.width, img.height);
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Calculate crop position to center the image
    const cropX = (img.width - size) / 2;
    const cropY = (img.height - size) / 2;

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw the image centered and cropped
    ctx.drawImage(img, cropX, cropY, size, size, 0, 0, size, size);

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/favicon.png', buffer);

    console.log('✓ Circular favicon created successfully!');
  } catch (error) {
    console.error('Error creating favicon:', error.message);
    process.exit(1);
  }
}

createCircularFavicon();
