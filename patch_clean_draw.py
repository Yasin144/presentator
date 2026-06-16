import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

clean_presenter = r'''function drawPresenterFigure(mouthOpen = 0) {
  const enableCheck = document.getElementById("avatarEnableCheck");
  if (enableCheck && !enableCheck.checked) return;
  if (!transparentAnjaliCanvas) return;

  const baseHeight = 1110; 
  avatarConfig.h = baseHeight * avatarConfig.scale;
  const aspect_scale = avatarConfig.h / transparentAnjaliCanvas.height;
  avatarConfig.w = transparentAnjaliCanvas.width * aspect_scale;
  
  if (!avatarConfig.initialized) {
      avatarConfig.x = 0;
      avatarConfig.y = canvas.height - avatarConfig.h;
      avatarConfig.initialized = true;
  }
  
  ctx.save();
  if (avatarConfig.hovered) {
      ctx.strokeStyle = "rgba(42, 133, 255, 0.8)";
      ctx.lineWidth = 4;
      ctx.strokeRect(avatarConfig.x, avatarConfig.y, avatarConfig.w, avatarConfig.h);
  }
  
  // Natural breathing (independent of fast speaking)
  let breatheOffset = Math.sin(performance.now() / 1200) * 3 * avatarConfig.scale;
  
  let finalHeight = avatarConfig.h;
  let finalWidth = avatarConfig.w;
  let finalX = avatarConfig.x;
  let finalY = avatarConfig.y + breatheOffset;
  
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 14;
  ctx.shadowOffsetY = 18;
  
  ctx.drawImage(transparentAnjaliCanvas, finalX, finalY, finalWidth, finalHeight);
  ctx.restore();
}'''

text = re.sub(r'function drawPresenterFigure.*?\n\}\n\nfunction drawWhiteboardStrokes\(\) \{', clean_presenter + '\n\nfunction drawWhiteboardStrokes() {', text, flags=re.DOTALL)

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Restored clean drawPresenterFigure without fakes!')
