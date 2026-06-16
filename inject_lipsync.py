import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Update backdrops to accept mouthOpen
text = re.sub(r'function drawTeachingStageBackdrop\(\) \{', r'function drawTeachingStageBackdrop(mouthOpen = 0) {', text)
text = re.sub(r'function drawLearningOutcomesBackdrop\(\) \{', r'function drawLearningOutcomesBackdrop(mouthOpen = 0) {', text)

# Pass mouthOpen inside these backdrops
text = re.sub(r'drawPresenterFigure\(\);', r'drawPresenterFigure(mouthOpen);', text)

# Pass mouthOpen from drawScene
text = re.sub(r'drawTeachingStageBackdrop\(\);', r'drawTeachingStageBackdrop(mouthOpen);', text)

# Change drawPresenterFigure signature
text = re.sub(r'function drawPresenterFigure\(\) \{', r'function drawPresenterFigure(mouthOpen = 0) {', text)

# PNGTuber Lipsync replacement block
bouncy_logic = r'''  ctx.save();
  if (avatarConfig.hovered) {
      ctx.strokeStyle = "rgba(42, 133, 255, 0.8)";
      ctx.lineWidth = 4;
      ctx.strokeRect(avatarConfig.x, avatarConfig.y, avatarConfig.w, avatarConfig.h);
  }
  
  // PNGTuber Lipsync Bouncing & Stretching Logic
  let isTalking = mouthOpen > 0.05;
  let bounceY = isTalking ? - (mouthOpen * 25) : 0; // Bounce up when loud
  let stretchY = isTalking ? 1.0 + (mouthOpen * 0.02) : 1.0;
  let finalHeight = avatarConfig.h * stretchY;
  let finalY = avatarConfig.y + avatarConfig.h - finalHeight + bounceY;
  // Squeeze width slightly for cartoon squash effect
  let stretchX = isTalking ? 1.0 - (mouthOpen * 0.015) : 1.0;
  let finalWidth = avatarConfig.w * stretchX;
  let finalX = avatarConfig.x + (avatarConfig.w - finalWidth) / 2;

  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 14;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(transparentAnjaliCanvas, finalX, finalY, finalWidth, finalHeight);
  ctx.restore();
}'''

# Replace from `ctx.save();` down to `}` inside `drawPresenterFigure`
pattern = re.compile(r'  ctx\.save\(\);\s*if \(avatarConfig\.hovered\) \{\s*ctx\.strokeStyle = "rgba\(42, 133, 255, 0\.8\)";\s*ctx\.lineWidth = 4;\s*ctx\.strokeRect\(avatarConfig\.x, avatarConfig\.y, avatarConfig\.w, avatarConfig\.h\);\s*\}\s*ctx\.shadowColor = "rgba\(0, 0, 0, 0\.35\)";\s*ctx\.shadowBlur = 28;\s*ctx\.shadowOffsetX = 14;\s*ctx\.shadowOffsetY = 18;\s*ctx\.drawImage\(transparentAnjaliCanvas, avatarConfig\.x, avatarConfig\.y, avatarConfig\.w, avatarConfig\.h\);\s*ctx\.restore\(\);\s*\}', re.DOTALL)

if pattern.search(text):
    text = pattern.sub(bouncy_logic, text)
    print("PNGTuber lipsync logic injected!")
else:
    print("Could not find the target drawing block in drawPresenterFigure!")

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)
