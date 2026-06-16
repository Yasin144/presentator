import base64
with open(r'd:\presentator\info-kids-logo.png', 'rb') as f:
    logo_b64 = base64.b64encode(f.read()).decode('utf-8')

new_drawInfo = f'''
let infoKidsLogoImg = new Image();
infoKidsLogoImg.src = "data:image/png;base64,{logo_b64}";

function drawInfoKidsLogo() {{
  if (normalizePresentationTemplate(state.presentationTemplate) !== PRESENTATION_TEMPLATE_OUTCOMES) {{
    return;
  }}

  const enableCheck = document.getElementById("logoEnableCheck");
  if (enableCheck && !enableCheck.checked) {{
     // logo disabled
  }} else {{
     if(infoKidsLogoImg.complete) {{
       const scale = 0.54; 
       const lw = infoKidsLogoImg.width * scale;
       const lh = infoKidsLogoImg.height * scale;
       const lx = canvas.width - lw - 50; 
       const ly = canvas.height - lh - 30; 
       ctx.drawImage(infoKidsLogoImg, lx, ly, lw, lh);
     }}
  }}

  const titleLines = wrapCanvasText(
    getPresentationHeaderTitle(),
    canvas.width - 140,
    '900 66px "League Spartan", sans-serif'
  ).slice(0, 2);
  const titleFontSize = titleLines.length > 1 ? 54 : 66;
  const titleLineHeight = titleLines.length > 1 ? 48 : 56;
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const titleY = 36 + Math.max(0, (80 - titleBlockHeight) / 2);

  ctx.save();
  ctx.fillStyle = "#050709";
  ctx.font = `900 ${{titleFontSize}}px "League Spartan", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  titleLines.forEach((line, index) => {{
    ctx.fillText(line, canvas.width / 2, titleY + (index * titleLineHeight));
  }});
  ctx.restore();
}}
'''

new_presenter = '''
function drawPresenterFigure() {
  const enableCheck = document.getElementById("avatarEnableCheck");
  if (enableCheck && !enableCheck.checked) return;
  if (!transparentAnjaliCanvas) return;

  const scaleInput = document.getElementById("avatarScaleRange");
  const xInput = document.getElementById("avatarXRange");
  const yInput = document.getElementById("avatarYRange");
  
  const userScale = scaleInput ? parseFloat(scaleInput.value) : 1.0;
  const userX = xInput ? parseInt(xInput.value, 10) : 30;
  const userY = yInput ? parseInt(yInput.value, 10) : 605;

  const desiredHeight = 1110 * userScale; 
  const scale = desiredHeight / transparentAnjaliCanvas.height;
  const destWidth = transparentAnjaliCanvas.width * scale;
  const destHeight = desiredHeight;
  const destX = userX; 
  const destY = userY - destHeight; 
  
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 14;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(transparentAnjaliCanvas, destX, destY, destWidth, destHeight);
  ctx.restore();
}
'''

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Replace drawInfoKidsLogo
pattern_info = re.compile(r'function drawInfoKidsLogo\(\) \{.*?\n\}\n', re.DOTALL)
text = pattern_info.sub(new_drawInfo, text, count=1)

# Replace drawPresenterFigure
pattern_presenter = re.compile(r'function drawPresenterFigure\(\) \{.*?\n\}\n', re.DOTALL)
text = pattern_presenter.sub(new_presenter, text, count=1)

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated successfully.")
