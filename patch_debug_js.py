import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

debug_jaw_logic = r'''      ctx.restore();
  }
  
  // Render visual targeting guide!
  const showDebug = document.getElementById("showJawDebugCheck");
  if (showDebug && showDebug.checked) {
      const mouthYPercent = parseFloat(document.getElementById('avatarJawYRange')?.value || "14.2") / 100;
      const mouthWPercent = parseFloat(document.getElementById('avatarJawWidthRange')?.value || "2.8") / 100;
      const mouthXPercent = parseFloat(document.getElementById('avatarJawXRange')?.value || "31.5") / 100;
      
      const destMouthWidth = finalWidth * mouthWPercent;
      const destMouthHeight = finalHeight * 0.15; 
      const destMouthX = finalX + finalWidth * (mouthXPercent - mouthWPercent / 2);
      const destMouthY = finalY + finalHeight * mouthYPercent;
      
      ctx.save();
      ctx.strokeStyle = "rgba(40, 255, 40, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      
      // Draw outer mouth box container
      ctx.strokeRect(destMouthX, destMouthY, destMouthWidth, destMouthHeight);
      
      // Draw the exact drop-jaw mesh curve in Red
      ctx.strokeStyle = "rgba(255, 40, 40, 0.9)";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(destMouthX, destMouthY);
      ctx.bezierCurveTo(
          destMouthX, destMouthY + destMouthHeight, 
          destMouthX + destMouthWidth, destMouthY + destMouthHeight, 
          destMouthX + destMouthWidth, destMouthY
      );
      ctx.stroke();
      
      // Draw the faked internal mouth in Dark Red
      ctx.fillStyle = "rgba(255, 20, 20, 0.4)";
      ctx.beginPath();
      ctx.ellipse(destMouthX + destMouthWidth/2, destMouthY, destMouthWidth/2.5, destMouthWidth/4, 0, 0, Math.PI*2);
      ctx.fill();
      
      ctx.restore();
  }
  
  ctx.restore();
}'''

pattern = re.compile(r'      ctx\.restore\(\);\n  \}\n  \n  ctx\.restore\(\);\n\}', re.DOTALL)
if pattern.search(text):
    text = pattern.sub(debug_jaw_logic, text)
    with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Injected UI Target Guide!")
else:
    print("Could not find the end block of drawPresenterFigure!")
