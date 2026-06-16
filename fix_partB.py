f = open(r'D:\voice\script.js', 'r', encoding='utf-8')
src = f.read()
f.close()

old_body = '''function drawTeachingStageBackdrop(mouthOpen = 0) {
  const _tpl = normalizePresentationTemplate(state.presentationTemplate);
  switch (_tpl) {
    case PRESENTATION_TEMPLATE_OUTCOMES: drawLearningOutcomesBackdrop(mouthOpen); return;
    case "sunrise-classroom":            if(window.drawSunriseClassroomBackdrop)window.drawSunriseClassroomBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "galaxy-night":                 if(window.drawGalaxyNightBackdrop)window.drawGalaxyNightBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "tropical-green":               if(window.drawTropicalGardenBackdrop)window.drawTropicalGardenBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "royal-purple":                 if(window.drawRoyalStageBackdrop)window.drawRoyalStageBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "candy-pink":                   if(window.drawCandyPopBackdrop)window.drawCandyPopBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "neon-cyber":                   if(window.drawNeonCityBackdrop)window.drawNeonCityBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "golden-hour":                  if(window.drawGoldenHourBackdrop)window.drawGoldenHourBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    default:                             drawClassicTeachingStageBackdrop();
  }
}'''

new_body = '''function drawTeachingStageBackdrop(mouthOpen = 0) {
  var _tpl = normalizePresentationTemplate(state.presentationTemplate);
  if (_tpl === PRESENTATION_TEMPLATE_OUTCOMES) { drawLearningOutcomesBackdrop(mouthOpen); return; }
  var _fn = _BACKDROP_REGISTRY && _BACKDROP_REGISTRY[_tpl];
  if (typeof _fn === 'function') { try { _fn(); } catch(e) { console.error('Backdrop error:', _tpl, e); drawClassicTeachingStageBackdrop(); } return; }
  drawClassicTeachingStageBackdrop();
}'''

if old_body in src:
    src = src.replace(old_body, new_body, 1)
    print('PART B: drawTeachingStageBackdrop updated successfully')
else:
    print('PART B: Still not found. Exact match failed.')
    # Check if already patched
    if 'var _fn = _BACKDROP_REGISTRY' in src:
        print('Already patched with registry dispatch')
    else:
        print('Neither old nor new found - manual inspection needed')

f = open(r'D:\voice\script.js', 'w', encoding='utf-8')
f.write(src)
f.close()
print('Done writing script.js')
