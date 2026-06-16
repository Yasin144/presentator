import re

with open(r'd:\presentator\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(r'id=\"avatarJawXRange\" min=\"0\" max=\"100\" step=\"0\.5\" value=\".*?\"', r'id="avatarJawXRange" min="0" max="100" step="0.5" value="38.5"', html)
html = re.sub(r'id=\"avatarJawYRange\" min=\"0\" max=\"100\" step=\"0\.2\" value=\".*?\"', r'id="avatarJawYRange" min="0" max="100" step="0.2" value="23.5"', html)

with open(r'd:\presentator\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
