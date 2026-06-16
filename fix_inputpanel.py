# -*- coding: utf-8 -*-
f=open(r'D:\voice\src\components\InputPanel.jsx','r',encoding='utf-8')
src=f.read()
f.close()

# Check if new cards already added
if 'templateCard_ocean-waves' in src:
    print('Cards already added')
else:
    # The gallery ends with the golden-hour card's closing </div> then blank line then </div> for the scroll container
    # Line 222: '              </div>'  (closes golden-hour card)
    # Line 223: ''
    # Line 224: '            </div>'   (closes template-gallery-scroll)
    old_gallery_end = '              </div>\n\n            </div>\n            <div className="outcomes-title-row">'
    
    new_cards = '''              </div>

              <div className="tpl3d-card" id="templateCard_ocean-waves" data-template="ocean-waves">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-ocean">
                    <span className="tpl-wave"></span>
                    <span className="tpl-wave2"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f30a Ocean</span>
                    <button className="tpl3d-select-btn" data-tpl="ocean-waves" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_winter-snow" data-template="winter-snow">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-winter">
                    <span className="tpl-snowflake">\u2744</span>
                    <span className="tpl-snowfall"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\u2744 Winter</span>
                    <button className="tpl3d-select-btn" data-tpl="winter-snow" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_cherry-blossom" data-template="cherry-blossom">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-cherry">
                    <span className="tpl-petal">\U0001f338</span>
                    <span className="tpl-branch"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f338 Cherry</span>
                    <button className="tpl3d-select-btn" data-tpl="cherry-blossom" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_desert-dunes" data-template="desert-dunes">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-desert">
                    <span className="tpl-desert-sun"></span>
                    <span className="tpl-dune"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f3dc Desert</span>
                    <button className="tpl3d-select-btn" data-tpl="desert-dunes" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_aurora-borealis" data-template="aurora-borealis">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-aurora">
                    <span className="tpl-aurora-band"></span>
                    <span className="tpl-aurora-band2"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f300 Aurora</span>
                    <button className="tpl3d-select-btn" data-tpl="aurora-borealis" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_lightning-storm" data-template="lightning-storm">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-lightning">
                    <span className="tpl-lightning">\u26a1</span>
                    <span className="tpl-stormcloud"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\u26a1 Storm</span>
                    <button className="tpl3d-select-btn" data-tpl="lightning-storm" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_mountain-mist" data-template="mountain-mist">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-mountain">
                    <span className="tpl-peak"></span>
                    <span className="tpl-mist"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f3d4 Mountain</span>
                    <button className="tpl3d-select-btn" data-tpl="mountain-mist" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_rainbow-garden" data-template="rainbow-garden">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-rainbow">
                    <span className="tpl-rainbow2"></span>
                    <span className="tpl-flower">\U0001f33b</span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f308 Rainbow</span>
                    <button className="tpl3d-select-btn" data-tpl="rainbow-garden" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

            </div>
            <div className="outcomes-title-row">'''
    
    if old_gallery_end in src:
        src = src.replace(old_gallery_end, new_cards, 1)
        print('Cards inserted OK')
    else:
        print('Anchor not found, trying rfind method...')
        # Use rfind on simpler anchor
        marker = '              </div>\n\n            </div>'
        last_pos = src.rfind(marker)
        if last_pos >= 0:
            # verify it's before outcomes-title-row
            outcomes_pos = src.find('<div className="outcomes-title-row">')
            if last_pos < outcomes_pos:
                replacement = '''              </div>

              <div className="tpl3d-card" id="templateCard_ocean-waves" data-template="ocean-waves">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-ocean">
                    <span className="tpl-wave"></span>
                    <span className="tpl-wave2"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f30a Ocean</span>
                    <button className="tpl3d-select-btn" data-tpl="ocean-waves" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_winter-snow" data-template="winter-snow">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-winter">
                    <span className="tpl-snowflake">\u2744</span>
                    <span className="tpl-snowfall"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\u2744 Winter</span>
                    <button className="tpl3d-select-btn" data-tpl="winter-snow" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_cherry-blossom" data-template="cherry-blossom">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-cherry">
                    <span className="tpl-petal">\U0001f338</span>
                    <span className="tpl-branch"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f338 Cherry</span>
                    <button className="tpl3d-select-btn" data-tpl="cherry-blossom" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_desert-dunes" data-template="desert-dunes">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-desert">
                    <span className="tpl-desert-sun"></span>
                    <span className="tpl-dune"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f3dc Desert</span>
                    <button className="tpl3d-select-btn" data-tpl="desert-dunes" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_aurora-borealis" data-template="aurora-borealis">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-aurora">
                    <span className="tpl-aurora-band"></span>
                    <span className="tpl-aurora-band2"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f300 Aurora</span>
                    <button className="tpl3d-select-btn" data-tpl="aurora-borealis" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_lightning-storm" data-template="lightning-storm">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-lightning">
                    <span className="tpl-lightning">\u26a1</span>
                    <span className="tpl-stormcloud"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\u26a1 Storm</span>
                    <button className="tpl3d-select-btn" data-tpl="lightning-storm" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_mountain-mist" data-template="mountain-mist">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-mountain">
                    <span className="tpl-peak"></span>
                    <span className="tpl-mist"></span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f3d4 Mountain</span>
                    <button className="tpl3d-select-btn" data-tpl="mountain-mist" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

              <div className="tpl3d-card" id="templateCard_rainbow-garden" data-template="rainbow-garden">
                <div className="tpl3d-inner">
                  <div className="tpl3d-preview tpl3d-preview-rainbow">
                    <span className="tpl-rainbow2"></span>
                    <span className="tpl-flower">\U0001f33b</span>
                  </div>
                  <div className="tpl3d-body">
                    <span className="tpl3d-name">\U0001f308 Rainbow</span>
                    <button className="tpl3d-select-btn" data-tpl="rainbow-garden" type="button">\u2713 Select</button>
                  </div>
                </div>
              </div>

            </div>'''
                src = src[:last_pos] + replacement + src[last_pos + len(marker):]
                print('Cards inserted via rfind OK')
            else:
                print('rfind found wrong position, outcomes at', outcomes_pos, 'marker at', last_pos)
        else:
            print('rfind also failed')

f=open(r'D:\voice\src\components\InputPanel.jsx','w',encoding='utf-8')
f.write(src)
f.close()
print('InputPanel.jsx updated')
