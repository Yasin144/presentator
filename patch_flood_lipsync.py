import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Replace the inner logic of anjaliTeacherImg.onload
new_onload = r'''anjaliTeacherImg.onload = () => {
  const oc = document.createElement("canvas");
  oc.width = anjaliTeacherImg.width;
  oc.height = anjaliTeacherImg.height;
  const octx = oc.getContext("2d");
  octx.drawImage(anjaliTeacherImg, 0, 0);
  const idata = octx.getImageData(0, 0, oc.width, oc.height);
  const d = idata.data;
  const w = oc.width;
  const h = oc.height;
  
  const stack = new Int32Array(w * h * 2);
  let stackPtr = 0;
  const visited = new Uint8Array(w * h);
  
  function push(x, y) {
      stack[stackPtr++] = x;
      stack[stackPtr++] = y;
  }
  push(0, 0);
  push(w-1, 0);
  push(0, h-1);
  push(w-1, h-1);
  
  function isBg(x, y) {
      if (x < 0 || x >= w || y < 0 || y >= h) return false;
      const idx = (y * w + x) * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2];
      const lum = (r + g + b) / 3;
      return lum > 230; 
  }
  
  while(stackPtr > 0) {
      const y = stack[--stackPtr];
      const x = stack[--stackPtr];
      
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      
      const vIdx = y * w + x;
      if (visited[vIdx]) continue;
      visited[vIdx] = 1;
      
      if (isBg(x, y)) {
          const idx = vIdx * 4;
          d[idx + 3] = 0; 
          
          push(x+1, y);
          push(x-1, y);
          push(x, y+1);
          push(x, y-1);
      }
  }
  octx.putImageData(idata, 0, 0);
  transparentAnjaliCanvas = oc;
};'''

text = re.sub(r'anjaliTeacherImg\.onload = \(\) => \{.*?transparentAnjaliCanvas = oc;\n\};', new_onload, text, flags=re.DOTALL)

# 2. Update drawPresenterFigure to use effectiveMouthOpen
new_talking_logic = r'''  // Determine if she should actually speak!
  let effectiveMouthOpen = mouthOpen;
  if (state.speaking && state.displayedText !== state.text && (!mouthOpen || mouthOpen < 0.05)) {
      // Procedural fake lip movement! She moves her lips continuously while "reading" text to the screen
      effectiveMouthOpen = (Math.sin(performance.now() / 45) + 1) * 0.5; // rapid lip oscillation
  }
  
  let isTalking = effectiveMouthOpen > 0.05;
  let bounceY = isTalking ? - (effectiveMouthOpen * 6) : 0; // Gentle bounce
  let stretchY = isTalking ? 1.0 + (effectiveMouthOpen * 0.005) : 1.0; 
  let finalHeight = avatarConfig.h * stretchY;
  let finalY = avatarConfig.y + avatarConfig.h - finalHeight + bounceY;
  let stretchX = isTalking ? 1.0 - (effectiveMouthOpen * 0.005) : 1.0;
  let finalWidth = avatarConfig.w * stretchX;
  let finalX = avatarConfig.x + (avatarConfig.w - finalWidth) / 2;'''

text = re.sub(r'  let isTalking = mouthOpen > 0\.05;.*?let finalX = avatarConfig\.x \+ \(avatarConfig\.w - finalWidth\) / 2;', new_talking_logic, text, flags=re.DOTALL)

# Also make sure the jaw rendering uses effectiveMouthOpen
text = re.sub(r'const jawOpenPixels = mouthOpen \* 14 \* avatarConfig\.scale;', r'const jawOpenPixels = effectiveMouthOpen * 14 * avatarConfig.scale;', text)

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated script.js with flood fill and procedural fake lip sync!")
