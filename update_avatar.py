import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('function drawPresenterFigure() {')
if start_idx != -1:
    end_idx = text.find('}', start_idx) + 1
    
    original = text[start_idx:end_idx]

    new_func = """function drawPresenterFigure() {
  const enableCheck = document.getElementById("avatarEnableCheck");
  if (enableCheck && !enableCheck.checked) return;
  if (!transparentAnjaliCanvas) return;

  const scaleInput = document.getElementById("avatarScaleRange");
  const xInput = document.getElementById("avatarXRange");
  const yInput = document.getElementById("avatarYRange");
  
  const userScale = scaleInput ? parseFloat(scaleInput.value) : 1.0;
  const userX = xInput ? parseInt(xInput.value, 10) : 10;
  const userY = yInput ? parseInt(yInput.value, 10) : 655;

  const desiredHeight = 1250 * userScale; 
  const scale = desiredHeight / transparentAnjaliCanvas.height;
  const destWidth = transparentAnjaliCanvas.width * scale;
  const destHeight = desiredHeight;
  const destX = userX; 
  const destY = userY; 
  
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 14;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(transparentAnjaliCanvas, destX, destY, destWidth, destHeight);
  ctx.restore();
}"""

    new_text = text.replace(original, new_func)

    listeners = """
document.addEventListener("DOMContentLoaded", () => {
  const ids = ["avatarEnableCheck", "avatarScaleRange", "avatarXRange", "avatarYRange"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", (e) => {
        if (id === "avatarScaleRange") {
          const display = document.getElementById("avatarScaleDisplay");
          if (display) display.textContent = parseFloat(e.target.value).toFixed(2);
        }
        if (id === "avatarXRange") {
          const display = document.getElementById("avatarXDisplay");
          if (display) display.textContent = e.target.value;
        }
        if (id === "avatarYRange") {
          const display = document.getElementById("avatarYDisplay");
          if (display) display.textContent = e.target.value;
        }
        if (typeof drawScene === "function") drawScene(window.state?.mouthOpen || 0.12);
      });
      el.addEventListener("change", (e) => {
        if (typeof drawScene === "function") drawScene(window.state?.mouthOpen || 0.12);
      });
    }
  });
});
"""
    if "avatarEnableCheck" not in new_text:
        new_text += listeners

    with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
        f.write(new_text)

    print("Updated successfully")
else:
    print("Function not found")
