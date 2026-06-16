import re

with open(r'd:\presentator\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

new_slider = r'''<label style="display:flex; flex-direction:column; gap:4px; margin-bottom: 6px;">
                  <span class="stage-toolbar-meta">Mouth Width (%)</span>
                  <input type="range" id="avatarJawWidthRange" min="0" max="15" step="0.2" value="2.8">
                </label>
                <label style="display:flex; flex-direction:column; gap:4px;">
                  <span class="stage-toolbar-meta">Mouth Height (%)</span>
                  <input type="range" id="avatarJawHeightRange" min="0" max="30" step="0.2" value="4.0">
                </label>'''

pattern = re.compile(r'<label style=\"display:flex; flex-direction:column; gap:4px;\">\s*<span class=\"stage-toolbar-meta\">Mouth Width.*?<\/label>', re.DOTALL)

if pattern.search(text):
    text = pattern.sub(new_slider, text)
    with open(r'd:\presentator\index.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Added Mouth Height slider to index.html!')
else:
    print('Pattern not found!')
