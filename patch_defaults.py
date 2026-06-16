import re

with open(r'd:\presentator\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Pattern must match the existing exactly
html = re.sub(r'id=\"avatarJawXRange\" min=\"0\" max=\"100\" step=\"[^\"]*\" value=\"[^\"]*\"', r'id="avatarJawXRange" min="0" max="100" step="0.5" value="31.5"', html)
html = re.sub(r'id=\"avatarJawYRange\" min=\"0\" max=\"100\" step=\"[^\"]*\" value=\"[^\"]*\"', r'id="avatarJawYRange" min="0" max="100" step="0.2" value="14.2"', html)
html = re.sub(r'id=\"avatarJawWidthRange\" min=\"0\" max=\"[^\"]*\" step=\"[^\"]*\" value=\"[^\"]*\"', r'id="avatarJawWidthRange" min="0" max="15" step="0.2" value="2.8"', html)

with open(r'd:\presentator\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
