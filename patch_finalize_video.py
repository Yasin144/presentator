import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'avatarVideoElement\.src = .*?;', r'avatarVideoElement.src = "teacher_video_transparent_1080p.webm";', text)

simple_draw = r'''  // Draw the live video frame directly!
  ctx.drawImage(transparentAnjaliCanvas, finalX, finalY, finalWidth, finalHeight);
  ctx.restore();
}'''

pattern = re.compile(r'  ctx\.shadowOffsetY = 18;\n.*?\}\n', re.DOTALL)
if pattern.search(text):
    text = pattern.sub(r'  ctx.shadowOffsetY = 18;\n' + simple_draw + '\n', text)
    print("Cleaned up drawing logic!")
else:
    print("Could not find draw bounds!")

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)
