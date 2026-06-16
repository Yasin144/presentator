import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

new_drawInfo = '''
function drawInfoKidsLogo() {
  if (normalizePresentationTemplate(state.presentationTemplate) !== PRESENTATION_TEMPLATE_OUTCOMES) {
    return;
  }

  const enableCheck = document.getElementById("logoEnableCheck");
  if (enableCheck && !enableCheck.checked) {
     // logo disabled
  } else {
     if(infoKidsLogoImg.complete) {
       logoConfig.w = infoKidsLogoImg.width * logoConfig.scale;
       logoConfig.h = infoKidsLogoImg.height * logoConfig.scale;
       
       if (!logoConfig.initialized) {
           logoConfig.x = canvas.width - logoConfig.w - 50; 
           logoConfig.y = canvas.height - logoConfig.h - 30;
           logoConfig.initialized = true;
       }
       ctx.save();
       if (logoConfig.hovered) {
          ctx.strokeStyle = "rgba(42, 133, 255, 0.8)";
          ctx.lineWidth = 4;
          ctx.strokeRect(logoConfig.x, logoConfig.y, logoConfig.w, logoConfig.h);
       }
       ctx.drawImage(infoKidsLogoImg, logoConfig.x, logoConfig.y, logoConfig.w, logoConfig.h);
       ctx.restore();
     }
  }

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
  ctx.font = `900 ${titleFontSize}px "League Spartan", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  titleLines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, titleY + (index * titleLineHeight));
  });
  ctx.restore();
}
'''

new_presenter = '''
function drawPresenterFigure() {
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
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 14;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(transparentAnjaliCanvas, avatarConfig.x, avatarConfig.y, avatarConfig.w, avatarConfig.h);
  ctx.restore();
}
'''

new_listeners = '''
let avatarConfig = {x: 0, y: 0, w: 0, h: 0, scale: 1.0, initialized: false, hovered: false, dragging: false, dragOffX: 0, dragOffY: 0};
let logoConfig = {x: 0, y: 0, w: 0, h: 0, scale: 0.54, initialized: false, hovered: false, dragging: false, dragOffX: 0, dragOffY: 0};

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

previewCanvas.addEventListener('pointerdown', (e) => {
    const pos = getMousePos(previewCanvas, e);
    
    if (document.getElementById("avatarEnableCheck")?.checked && !!transparentAnjaliCanvas) {
        if (pos.x >= avatarConfig.x && pos.x <= avatarConfig.x + avatarConfig.w &&
            pos.y >= avatarConfig.y && pos.y <= avatarConfig.y + avatarConfig.h) {
            avatarConfig.dragging = true;
            avatarConfig.dragOffX = pos.x - avatarConfig.x;
            avatarConfig.dragOffY = pos.y - avatarConfig.y;
            previewCanvas.setPointerCapture(e.pointerId);
            return;
        }
    }
    
    if (document.getElementById("logoEnableCheck")?.checked && infoKidsLogoImg.complete) {
        if (normalizePresentationTemplate(state.presentationTemplate) === 'learning-outcomes') {
            if (pos.x >= logoConfig.x && pos.x <= logoConfig.x + logoConfig.w &&
                pos.y >= logoConfig.y && pos.y <= logoConfig.y + logoConfig.h) {
                logoConfig.dragging = true;
                logoConfig.dragOffX = pos.x - logoConfig.x;
                logoConfig.dragOffY = pos.y - logoConfig.y;
                previewCanvas.setPointerCapture(e.pointerId);
                return;
            }
        }
    }
});

previewCanvas.addEventListener('pointermove', (e) => {
    const pos = getMousePos(previewCanvas, e);
    let dirty = false;
    
    if (avatarConfig.dragging) {
        avatarConfig.x = pos.x - avatarConfig.dragOffX;
        avatarConfig.y = pos.y - avatarConfig.dragOffY;
        dirty = true;
    } else if (logoConfig.dragging) {
        logoConfig.x = pos.x - logoConfig.dragOffX;
        logoConfig.y = pos.y - logoConfig.dragOffY;
        dirty = true;
    } else {
        let hoverAvatar = false;
        if (document.getElementById("avatarEnableCheck")?.checked && !!transparentAnjaliCanvas) {
            if (pos.x >= avatarConfig.x && pos.x <= avatarConfig.x + avatarConfig.w &&
                pos.y >= avatarConfig.y && pos.y <= avatarConfig.y + avatarConfig.h) {
                hoverAvatar = true;
            }
        }
        if (hoverAvatar !== avatarConfig.hovered) {
             avatarConfig.hovered = hoverAvatar;
             dirty = true;
        }
        
        let hoverLogo = false;
        if (document.getElementById("logoEnableCheck")?.checked && infoKidsLogoImg.complete) {
            if (normalizePresentationTemplate(state.presentationTemplate) === 'learning-outcomes') {
                if (pos.x >= logoConfig.x && pos.x <= logoConfig.x + logoConfig.w &&
                    pos.y >= logoConfig.y && pos.y <= logoConfig.y + logoConfig.h) {
                    hoverLogo = true;
                }
            }
        }
        if (hoverLogo !== logoConfig.hovered) {
             logoConfig.hovered = hoverLogo;
             dirty = true;
        }
        
        if (hoverAvatar) {
            previewCanvas.style.cursor = 'grab';
        } else if (hoverLogo) {
            previewCanvas.style.cursor = 'grab';
        } else {
            previewCanvas.style.cursor = 'default';
        }
    }
    
    if (dirty) {
        if (typeof drawScene === 'function') drawScene();
    }
});

previewCanvas.addEventListener('pointerup', (e) => {
    if (avatarConfig.dragging || logoConfig.dragging) {
        previewCanvas.releasePointerCapture(e.pointerId);
        avatarConfig.dragging = false;
        logoConfig.dragging = false;
        if (typeof drawScene === 'function') drawScene();
    }
});

previewCanvas.addEventListener('wheel', (e) => {
    if (avatarConfig.hovered) {
        e.preventDefault();
        avatarConfig.scale -= e.deltaY * 0.001;
        if (avatarConfig.scale < 0.1) avatarConfig.scale = 0.1;
        if (typeof drawScene === 'function') drawScene();
    } else if (logoConfig.hovered) {
        e.preventDefault();
        logoConfig.scale -= e.deltaY * 0.001;
        if (logoConfig.scale < 0.1) logoConfig.scale = 0.1;
        if (typeof drawScene === 'function') drawScene();
    }
}, {passive: false});

document.getElementById("avatarEnableCheck")?.addEventListener('change', () => { if (typeof drawScene === 'function') drawScene(); });
document.getElementById("logoEnableCheck")?.addEventListener('change', () => { if (typeof drawScene === 'function') drawScene(); });
'''

# Replace current functions
pattern_info = re.compile(r'function drawInfoKidsLogo\(\) \{.*?\n\}\n', re.DOTALL)
if pattern_info.search(text):
    text = pattern_info.sub(new_drawInfo, text, count=1)
else:
    print("Warning: function drawInfoKidsLogo not found")

pattern_presenter = re.compile(r'function drawPresenterFigure\(\) \{.*?\n\}\n', re.DOTALL)
if pattern_presenter.search(text):
    text = pattern_presenter.sub(new_presenter, text, count=1)
else:
    print("Warning: function drawPresenterFigure not found")

# Insert listeners at the very end
text += '\n' + new_listeners

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Drag and drop logic successfully integrated in script.js")
