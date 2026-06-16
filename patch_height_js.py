import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the hardcoded 0.15 height with the slider value!
new_logic = r'''const mouthYPercent = parseFloat(document.getElementById('avatarJawYRange')?.value || "14.2") / 100;
      const mouthWPercent = parseFloat(document.getElementById('avatarJawWidthRange')?.value || "2.8") / 100;
      const mouthHPercent = parseFloat(document.getElementById('avatarJawHeightRange')?.value || "4.0") / 100;
      const mouthXPercent = parseFloat(document.getElementById('avatarJawXRange')?.value || "31.5") / 100;
      
      const lipOpenPixels = effectiveMouthOpen * 6 * avatarConfig.scale; // Move jaw down up to 6 pixels
      
      const destMouthWidth = finalWidth * mouthWPercent;
      const destMouthHeight = finalHeight * mouthHPercent; 
      const destMouthX = finalX + finalWidth * (mouthXPercent - mouthWPercent / 2);
      const destMouthY = finalY + finalHeight * mouthYPercent;
      
      // Paint an inner dark mouth hole right over the closed lips seam
      ctx.fillStyle = "#2a0a0a"; 
      ctx.beginPath();
      ctx.ellipse(destMouthX + destMouthWidth/2, destMouthY + lipOpenPixels/2, destMouthWidth/2.5, lipOpenPixels/1.5, 0, 0, Math.PI*2);
      ctx.fill();'''

# Make sure we replace the same logic block in both the main draw function and the debug bounds drawer!
pattern = re.compile(r'const mouthYPercent[^;]*;.*?ctx\.fill\(\);', re.DOTALL)
if pattern.search(text):
    text = pattern.sub(new_logic, text, count=1)  # Only the first (actual draw block)
else:
    print('Pattern not found for main logic')
    
# Now replace the debug guide block with the dynamic height too!
debug_logic = r'''const mouthYPercent = parseFloat(document.getElementById('avatarJawYRange')?.value || "14.2") / 100;
      const mouthWPercent = parseFloat(document.getElementById('avatarJawWidthRange')?.value || "2.8") / 100;
      const mouthHPercent = parseFloat(document.getElementById('avatarJawHeightRange')?.value || "4.0") / 100;
      const mouthXPercent = parseFloat(document.getElementById('avatarJawXRange')?.value || "31.5") / 100;
      
      const destMouthWidth = finalWidth * mouthWPercent;
      const destMouthHeight = finalHeight * mouthHPercent; 
      const destMouthX = finalX + finalWidth * (mouthXPercent - mouthWPercent / 2);
      const destMouthY = finalY + finalHeight * mouthYPercent;'''

pattern_debug = re.compile(r'const mouthYPercent[^;]*;.*?const destMouthY = finalY \+ finalHeight \* mouthYPercent;', re.DOTALL)
matches = pattern_debug.findall(text)
if len(matches) > 1:
    text = text.replace(matches[1], debug_logic)
else:
    print('Pattern not found for debug guide block')

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)
print('Updated script.js with Mouth Height parameter!')
