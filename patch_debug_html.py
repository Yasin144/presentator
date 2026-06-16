import re

with open(r'd:\presentator\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

new_html = r'''<p class="stage-toolbar-meta" style="margin-bottom: 8px;">Lip-Sync Calibration</p>
                <label style="display:flex; align-items:center; gap:8px; cursor: pointer; margin-bottom: 6px;">
                  <input type="checkbox" id="showJawDebugCheck">
                  <span class="stage-toolbar-meta" style="font-weight:600; color:#5cb85c;">Show Target Guide</span>
                </label>'''

text = re.sub(r'<p class=\"stage-toolbar-meta\" style=\"margin-bottom: 8px;\">Lip-Sync Calibration</p>', new_html, text)

with open(r'd:\presentator\index.html', 'w', encoding='utf-8') as f:
    f.write(text)
