import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

natural_body_logic = r'''  // Determine if she should actually speak!
  let effectiveMouthOpen = mouthOpen;
  if (state.speaking && state.displayedText !== state.text && (!mouthOpen || mouthOpen < 0.05)) {
      effectiveMouthOpen = (Math.sin(performance.now() / 45) + 1) * 0.5;
  }
  
  // 1. Natural slow breathing (no rapid shaking)
  let breatheOffset = Math.sin(performance.now() / 1200) * 3 * avatarConfig.scale;
  
  let finalHeight = avatarConfig.h;
  let finalWidth = avatarConfig.w;
  let finalX = avatarConfig.x;
  let finalY = avatarConfig.y + breatheOffset; // Anchor to dragged position, gently breathe
  
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 14;
  ctx.shadowOffsetY = 18;
  
  // Draw base avatar (solid, no jitter/shake)
  ctx.drawImage(transparentAnjaliCanvas, finalX, finalY, finalWidth, finalHeight);
  
  // 2. Micro Lip-Sync Movement precisely reacting to syllables
  let isTalking = effectiveMouthOpen > 0.05;
  if (isTalking) {
      const mouthYPercent = parseFloat(document.getElementById('avatarJawYRange')?.value || "18.5") / 100;
      const mouthWPercent = parseFloat(document.getElementById('avatarJawWidthRange')?.value || "4") / 100;
      const mouthXPercent = parseFloat(document.getElementById('avatarJawXRange')?.value || "50") / 100;
      
      const lipOpenPixels = effectiveMouthOpen * 2.5 * avatarConfig.scale; // VERY tiny subtle drop
      
      const destMouthWidth = finalWidth * mouthWPercent;
      const destMouthHeight = finalHeight * 0.15; 
      const destMouthX = finalX + finalWidth * (mouthXPercent - mouthWPercent / 2);
      const destMouthY = finalY + finalHeight * mouthYPercent;
      
      const srcMouthX = transparentAnjaliCanvas.width * (mouthXPercent - mouthWPercent / 2);
      const srcMouthY = transparentAnjaliCanvas.height * mouthYPercent;
      const srcMouthW = transparentAnjaliCanvas.width * mouthWPercent;
      const srcMouthH = transparentAnjaliCanvas.height * 0.15;
      
      ctx.shadowColor = "transparent"; 
      
      ctx.drawImage(
         transparentAnjaliCanvas,
         srcMouthX, srcMouthY, srcMouthW, srcMouthH,
         destMouthX, destMouthY + lipOpenPixels, destMouthWidth, destMouthHeight
      );
      
      ctx.fillStyle = "rgba(40, 10, 10, 0.35)";
      ctx.fillRect(destMouthX, destMouthY, destMouthWidth, lipOpenPixels * 1.0);
  }
  
  ctx.restore();
}'''

# Replace from `// Determine if she should actually speak!` to the end of the function
pattern = re.compile(r'  // Determine if she should actually speak!.*?ctx\.restore\(\);\n\}', re.DOTALL)
if pattern.search(text):
    text = pattern.sub(natural_body_logic, text)
    with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Fixed shaking by applying natural breathing!")
else:
    print("Failed to find pattern for natural body!")
