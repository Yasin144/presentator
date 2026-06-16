import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

bouncy_logic = r'''  ctx.save();
  if (avatarConfig.hovered) {
      ctx.strokeStyle = "rgba(42, 133, 255, 0.8)";
      ctx.lineWidth = 4;
      ctx.strokeRect(avatarConfig.x, avatarConfig.y, avatarConfig.w, avatarConfig.h);
  }
  
  let isTalking = mouthOpen > 0.05;
  let bounceY = isTalking ? - (mouthOpen * 6) : 0; // Gentle bounce
  let stretchY = isTalking ? 1.0 + (mouthOpen * 0.005) : 1.0; 
  let finalHeight = avatarConfig.h * stretchY;
  let finalY = avatarConfig.y + avatarConfig.h - finalHeight + bounceY;
  let stretchX = isTalking ? 1.0 - (mouthOpen * 0.005) : 1.0;
  let finalWidth = avatarConfig.w * stretchX;
  let finalX = avatarConfig.x + (avatarConfig.w - finalWidth) / 2;

  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 14;
  ctx.shadowOffsetY = 18;
  
  // Draw base avatar
  ctx.drawImage(transparentAnjaliCanvas, finalX, finalY, finalWidth, finalHeight);
  
  // Custom 2D Jaw/Lip slice processing!
  if (isTalking) {
      const jawYPercent = parseFloat(document.getElementById('avatarJawYRange')?.value || "18.5") / 100;
      const jawWPercent = parseFloat(document.getElementById('avatarJawWidthRange')?.value || "12") / 100;
      const jawXPercent = parseFloat(document.getElementById('avatarJawXRange')?.value || "50") / 100;
      
      const jawOpenPixels = mouthOpen * 14 * avatarConfig.scale; // Scale jaw drop with avatar size
      
      const destJawWidth = finalWidth * jawWPercent;
      const destJawHeight = finalHeight * 0.12; 
      const destJawX = finalX + finalWidth * (jawXPercent - jawWPercent / 2);
      const destJawY = finalY + finalHeight * jawYPercent;
      
      const srcJawX = transparentAnjaliCanvas.width * (jawXPercent - jawWPercent / 2);
      const srcJawY = transparentAnjaliCanvas.height * jawYPercent;
      const srcJawW = transparentAnjaliCanvas.width * jawWPercent;
      const srcJawH = transparentAnjaliCanvas.height * 0.12;
      
      // Draw inner mouth black/dark-red hole over the static mouth line to hide it
      ctx.fillStyle = "#301311";
      ctx.beginPath();
      // An ellipse opening down from the jaw split line
      ctx.ellipse(destJawX + destJawWidth/2, destJawY + jawOpenPixels * 0.4, destJawWidth * 0.45, jawOpenPixels * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Clear the shadow for the jaw slice to avoid double shadows
      ctx.shadowColor = "transparent";
      
      // Draw the jaw/chin block shifted down!
      ctx.drawImage(
         transparentAnjaliCanvas,
         srcJawX, srcJawY, srcJawW, srcJawH,
         destJawX, destJawY + jawOpenPixels, destJawWidth, destJawHeight
      );
  }
  
  ctx.restore();
}'''

pattern = re.compile(r'  ctx\.save\(\);\n  if \(avatarConfig\.hovered\) \{.*?ctx\.restore\(\);\n\}', re.DOTALL)
if pattern.search(text):
    text = pattern.sub(bouncy_logic, text)
    with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Jaw drop logic successfully injected!")
else:
    print("Failed to match the old block in drawPresenterFigure!")
