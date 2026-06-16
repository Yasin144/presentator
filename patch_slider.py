import re

with open(r'd:\presentator\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(r'id=\"avatarJawYRange\" min=\"0\" max=\"100\" step=\"0\.2\" value=\".*?\"', r'id="avatarJawYRange" min="0" max="100" step="0.2" value="17.8"', html)

with open(r'd:\presentator\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
