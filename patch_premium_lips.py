import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

premium_lip_logic = r'''  // 2. High-Fidelity Lip-Sync Mesh Rig
  let isTalking = effectiveMouthOpen > 0.05;
  if (isTalking) {
      const mouthYPercent = parseFloat(document.getElementById('avatarJawYRange')?.value || "18.5") / 100;
      const mouthWPercent = parseFloat(document.getElementById('avatarJawWidthRange')?.value || "4") / 100;
      const mouthXPercent = parseFloat(document.getElementById('avatarJawXRange')?.value || "50") / 100;
      
      const lipOpenPixels = effectiveMouthOpen * 6 * avatarConfig.scale; // Move jaw down 0 to 6 pixels
      
      const destMouthWidth = finalWidth * mouthWPercent;
      const destMouthHeight = finalHeight * 0.15; 
      const destMouthX = finalX + finalWidth * (mouthXPercent - mouthWPercent / 2);
      const destMouthY = finalY + finalHeight * mouthYPercent;
      
      // Paint an inner dark mouth hole right over the closed lips seam
      ctx.fillStyle = "#2a0a0a"; 
      ctx.beginPath();
      ctx.ellipse(destMouthX + destMouthWidth/2, destMouthY + lipOpenPixels/2, destMouthWidth/2.5, lipOpenPixels/1.5, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Draw the faked jaw drop by shifting the entire avatar down, 
      // but clipping it gracefully to a smooth chin mask curve!
      ctx.save();
      ctx.beginPath();
      // Drop line starts exactly at the split, and Bezier curves deeply down the chin
      ctx.moveTo(destMouthX, destMouthY + lipOpenPixels); 
      ctx.bezierCurveTo(
          destMouthX, destMouthY + destMouthHeight + lipOpenPixels, 
          destMouthX + destMouthWidth, destMouthY + destMouthHeight + lipOpenPixels, 
          destMouthX + destMouthWidth, destMouthY + lipOpenPixels
      );
      ctx.closePath();
      ctx.clip();
      
      ctx.shadowColor = "transparent"; // Prevent double shadow
      ctx.drawImage(transparentAnjaliCanvas, finalX, finalY + lipOpenPixels, finalWidth, finalHeight);
      ctx.restore();
  }
  
  ctx.restore();
}'''

pattern = re.compile(r'  // 2\. Micro Lip-Sync Movement.*?ctx\.restore\(\);\n\}', re.DOTALL)
if pattern.search(text):
    text = pattern.sub(premium_lip_logic, text)
    with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Premium lipsync injected!")
else:
    print("Pattern not found.")
