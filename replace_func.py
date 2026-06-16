import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_func = """let transparentAnjaliCanvas = null;

const anjaliTeacherImg = new Image();
anjaliTeacherImg.src = "anjali-teacher.png";
anjaliTeacherImg.onload = () => {
  const oc = document.createElement("canvas");
  oc.width = anjaliTeacherImg.width;
  oc.height = anjaliTeacherImg.height;
  const octx = oc.getContext("2d");
  octx.drawImage(anjaliTeacherImg, 0, 0);
  const idata = octx.getImageData(0, 0, oc.width, oc.height);
  const d = idata.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const lum = (r + g + b) / 3;
    if (lum > 240) {
      d[i + 3] = 0;
    } else if (lum > 210) {
      d[i + 3] = Math.floor(((240 - lum) / 30) * 255);
    }
  }
  octx.putImageData(idata, 0, 0);
  transparentAnjaliCanvas = oc;
};

function drawPresenterFigure() {
  if (!transparentAnjaliCanvas) {
    return;
  }
  const desiredHeight = 1250; 
  const scale = desiredHeight / transparentAnjaliCanvas.height;
  const destWidth = transparentAnjaliCanvas.width * scale;
  const destHeight = desiredHeight;
  const destX = 10; 
  const destY = canvas.height - destHeight - 15; 
  
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 14;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(transparentAnjaliCanvas, destX, destY, destWidth, destHeight);
  ctx.restore();
}"""

# The original drawPresenterFigure has many lines. We will match from "function drawPresenterFigure() {"
# down to the next "}" that follows a double blank line, or simply replace everything between "function drawPresenterFigure() {" and "function drawInfoKidsLogo()"

start_idx = content.find("function drawPresenterFigure() {")
if start_idx != -1:
    # find the end of the function. since it's the last function in that block before we saw another 
    # it ends when we find another "function "
    next_func_idx = content.find("function ", start_idx + 10)
    if next_func_idx != -1:
        end_idx = content.rfind("}", start_idx, next_func_idx) + 1
        new_content = content[:start_idx] + new_func + content[end_idx:]
        with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Replaced successfully.")
    else:
        # no more functions, just find last }
        end_idx = content.rfind("}") + 1
        new_content = content[:start_idx] + new_func + content[end_idx:]
        with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Replaced successfully (end of file).")
else:
    print("Function not found!")
