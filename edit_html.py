with open(r'd:\presentator\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Remove the old avatar settings block (from '<div class="field-group" style="padding-top: 24px;' to its matching '</div>\n            </div>')
pattern_remove = re.compile(r'<div class="field-group" style="padding-top: 24px; margin-top: 16px; border-top: 1px solid #e1e4e8;">\s*<span class="section-title">2D Avatar Settings \(Anjali\).*?</div>\s*</div>\s*</div>', re.DOTALL)
text = pattern_remove.sub('', text)

# Define the new Visuals toolbar group
new_visuals_group = '''
        <details class="stage-toolbar-group stage-toolbar-card">
          <summary class="stage-toolbar-head stage-toolbar-summary">
            <div>
              <p class="stage-toolbar-label">Visuals</p>
              <p class="stage-toolbar-meta">Toggle Anjali avatar and InfoKids logo</p>
            </div>
            <span class="stage-toolbar-badge">VIS</span>
          </summary>
          <div class="stage-toolbar-body">
            <div style="display: flex; flex-direction: column; gap: 8px; padding: 4px 8px;">
              <label style="display:flex; align-items:center; gap:8px; cursor: pointer;">
                <input type="checkbox" id="avatarEnableCheck" checked style="width: 16px; height: 16px;">
                <span class="stage-toolbar-meta" style="font-weight:600;">Show Anjali Avatar</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor: pointer;">
                <input type="checkbox" id="logoEnableCheck" checked style="width: 16px; height: 16px;">
                <span class="stage-toolbar-meta" style="font-weight:600;">Show InfoKids Logo</span>
              </label>
            </div>
          </div>
        </details>
'''

# Insert the new Visuals group right before the "Media" group
target = r'<details class="stage-toolbar-group stage-toolbar-card">\s*<summary class="stage-toolbar-head stage-toolbar-summary">\s*<div>\s*<p class="stage-toolbar-label">Media</p>'
text = re.sub(target, new_visuals_group + r'\g<0>', text)

with open(r'd:\presentator\index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated index.html successfully.")
