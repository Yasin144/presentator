import re

with open(r'd:\presentator\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(r'id=\"avatarJawXRange\" min=\"0\" max=\"100\" step=\"0\.5\" value=\".*?\"', r'id="avatarJawXRange" min="0" max="100" step="0.5" value="28.5"', html)
html = re.sub(r'id=\"avatarJawYRange\" min=\"0\" max=\"100\" step=\"0\.2\" value=\".*?\"', r'id="avatarJawYRange" min="0" max="100" step="0.2" value="16.5"', html)
html = re.sub(r'id=\"avatarJawWidthRange\" min=\"0\" max=\"15\" step=\"[^\"]*\" value=\".*?\"', r'id="avatarJawWidthRange" min="0" max="15" step="0.2" value="4.5"', html)
html = re.sub(r'id=\"avatarJawHeightRange\" min=\"0\" max=\"30\" step=\"[^\"]*\" value=\".*?\"', r'id="avatarJawHeightRange" min="0" max="30" step="0.2" value="3.0"', html)


with open(r'd:\presentator\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
