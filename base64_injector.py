import base64

with open(r'd:\presentator\anjali-teacher.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

new_src = "data:image/png;base64," + b64
new_text = text.replace('anjaliTeacherImg.src = "anjali-teacher.png";', f'anjaliTeacherImg.src = "{new_src}";')

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Base64 injected")
