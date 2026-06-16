import base64
import re

img_path = r'C:\Users\patan\.gemini\antigravity\brain\53da3188-4a03-4e5c-a0ac-285fb18eb6b3\media__1776455605906.jpg'

with open(img_path, 'rb') as f:
    img_b64 = base64.b64encode(f.read()).decode('utf-8')

new_src = f'anjaliTeacherImg.src = "data:image/jpeg;base64,{img_b64}";'

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'anjaliTeacherImg\.src = \"data:image\/.*?;base64,.*?\";')

if pattern.search(text):
    text = pattern.sub(new_src, text)
    with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Successfully replaced Anjali avatar image!')
else:
    print('Could not find existing anjaliTeacherImg.src pattern.')
