import re

with open(r'd:\presentator\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'(<p class="stage-toolbar-meta">Toggle Anjali avatar and InfoKids logo</p>.*?<label style="display:flex; align-items:center; gap:8px; cursor: pointer;">.*?<span class="stage-toolbar-meta" style="font-weight:600;">Show InfoKids Logo</span>\s*</label>\s*</div>)', re.DOTALL)

new_sliders = r'''
              <div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                <p class="stage-toolbar-meta" style="margin-bottom: 8px;">Lip-Sync Calibration</p>
                <label style="display:flex; flex-direction:column; gap:4px; margin-bottom: 6px;">
                  <span class="stage-toolbar-meta">Mouth X (%)</span>
                  <input type="range" id="avatarJawXRange" min="0" max="100" step="1" value="50">
                </label>
                <label style="display:flex; flex-direction:column; gap:4px; margin-bottom: 6px;">
                  <span class="stage-toolbar-meta">Mouth Y (%)</span>
                  <input type="range" id="avatarJawYRange" min="0" max="100" step="0.5" value="18.5">
                </label>
                <label style="display:flex; flex-direction:column; gap:4px;">
                  <span class="stage-toolbar-meta">Mouth Width (%)</span>
                  <input type="range" id="avatarJawWidthRange" min="0" max="50" step="1" value="12">
                </label>
              </div>'''

def repl(match):
    return match.group(1) + new_sliders

if pattern.search(text):
    text = pattern.sub(repl, text)
    with open(r'd:\presentator\index.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Successfully added sliders to index.html!')
else:
    print('Failed to find Visuals card block matching pattern in index.html.')
