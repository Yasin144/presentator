import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

robust_flood_fill = r'''anjaliTeacherImg.onload = () => {
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
      if (stackPtr < stack.length - 2) {
          stack[stackPtr++] = x;
          stack[stackPtr++] = y;
      }
  }
  
  push(0, 0); visited[0] = 1;
  push(w-1, 0); visited[w-1] = 1;
  push(0, h-1); visited[(h-1)*w] = 1;
  push(w-1, h-1); visited[(h-1)*w + w-1] = 1;
  
  function isBg(x, y) {
      if (x < 0 || x >= w || y < 0 || y >= h) return false;
      const idx = (y * w + x) * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2];
      return ((r + g + b) / 3) > 238; 
  }
  
  while(stackPtr > 0) {
      const y = stack[--stackPtr];
      const x = stack[--stackPtr];
      
      if (isBg(x, y)) {
          const vIdx = y * w + x;
          const idx = vIdx * 4;
          d[idx + 3] = 0; // Transparent
          
          if (x+1 < w && !visited[y*w + x+1]) { visited[y*w + x+1] = 1; push(x+1, y); }
          if (x-1 >= 0 && !visited[y*w + x-1]) { visited[y*w + x-1] = 1; push(x-1, y); }
          if (y+1 < h && !visited[(y+1)*w + x]) { visited[(y+1)*w + x] = 1; push(x, y+1); }
          if (y-1 >= 0 && !visited[(y-1)*w + x]) { visited[(y-1)*w + x] = 1; push(x, y-1); }
      }
  }
  octx.putImageData(idata, 0, 0);
  transparentAnjaliCanvas = oc;
};'''

text = re.sub(r'anjaliTeacherImg\.onload = \(\) => \{.*?transparentAnjaliCanvas = oc;\n\};', robust_flood_fill, text, flags=re.DOTALL)

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)
    
print("Robust flood fill injected!")
