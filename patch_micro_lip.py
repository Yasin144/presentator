import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the giant jaw processing block
micro_lip_logic = r'''  // Draw base avatar
  ctx.drawImage(transparentAnjaliCanvas, finalX, finalY, finalWidth, finalHeight);
  
  // Micro Lip-Sync Movement
  if (isTalking) {
      const mouthYPercent = parseFloat(document.getElementById('avatarJawYRange')?.value || "18.5") / 100;
      const mouthWPercent = parseFloat(document.getElementById('avatarJawWidthRange')?.value || "4") / 100;
      const mouthXPercent = parseFloat(document.getElementById('avatarJawXRange')?.value || "50") / 100;
      
      const lipOpenPixels = effectiveMouthOpen * 2.5 * avatarConfig.scale; // VERY tiny subtle drop, max 2-3px
      
      const destMouthWidth = finalWidth * mouthWPercent;
      const destMouthHeight = finalHeight * 0.15; // From mouth down to chin
      const destMouthX = finalX + finalWidth * (mouthXPercent - mouthWPercent / 2);
      const destMouthY = finalY + finalHeight * mouthYPercent;
      
      const srcMouthX = transparentAnjaliCanvas.width * (mouthXPercent - mouthWPercent / 2);
      const srcMouthY = transparentAnjaliCanvas.height * mouthYPercent;
      const srcMouthW = transparentAnjaliCanvas.width * mouthWPercent;
      const srcMouthH = transparentAnjaliCanvas.height * 0.15;
      
      ctx.shadowColor = "transparent"; // No double shadow
      
      // Soften the hard edge by drawing the slice slightly shifted!
      ctx.drawImage(
         transparentAnjaliCanvas,
         srcMouthX, srcMouthY, srcMouthW, srcMouthH,
         destMouthX, destMouthY + lipOpenPixels, destMouthWidth, destMouthHeight
      );
      
      // Draw a highly transparent faint slit in the opening to simulate depth
      ctx.fillStyle = "rgba(60, 20, 20, 0.4)";
      ctx.fillRect(destMouthX, destMouthY, destMouthWidth, lipOpenPixels * 1.2);
  }
  
  ctx.restore();
}'''

pattern = re.compile(r'  // Draw base avatar\n  ctx\.drawImage\(transparentAnjaliCanvas, finalX, finalY, finalWidth, finalHeight\);\n.*?\}\n', re.DOTALL)
text = pattern.sub(micro_lip_logic + '\n', text)

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)

# Also update the index.html sliders to point to more subtle defaults
with open(r'd:\presentator\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change value="12" on mouth width to value="4"
html = re.sub(r'id=\"avatarJawWidthRange\" min=\"0\" max=\"50\" step=\"1\" value=\"12\"', r'id="avatarJawWidthRange" min="0" max="15" step="0.5" value="4.0"', html)

with open(r'd:\presentator\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Updated micro lip movement!')
