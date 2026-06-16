// Drop this into the Electron DevTools console (F12) to diagnose logo state
(function() {
  var img = window.infoKidsLogoImg;
  if (!img) { console.error('[LOGO] infoKidsLogoImg is NOT defined - script.js may not be loaded'); return; }
  
  console.log('[LOGO] === Diagnostic ===');
  console.log('[LOGO] _logoReady:', img._logoReady);
  console.log('[LOGO] complete:', img.complete);
  console.log('[LOGO] naturalWidth:', img.naturalWidth, 'naturalHeight:', img.naturalHeight);
  console.log('[LOGO] width:', img.width, 'height:', img.height);
  console.log('[LOGO] src starts with data:image:', img.src && img.src.startsWith('data:image'));
  console.log('[LOGO] logoConfig:', JSON.stringify(window.logoConfig));
  
  var check = document.getElementById('logoEnableCheck');
  console.log('[LOGO] logoEnableCheck exists:', !!check);
  console.log('[LOGO] logoEnableCheck.checked:', check ? check.checked : 'N/A');
  
  // Try to force draw
  if (typeof drawScene === 'function') {
    console.log('[LOGO] Calling drawScene()...');
    drawScene(0.12);
    console.log('[LOGO] drawScene() called OK');
  } else {
    console.error('[LOGO] drawScene is NOT defined');
  }
  
  // Check cache-buster version loaded
  var scripts = Array.from(document.querySelectorAll('script[src]'));
  var scriptJs = scripts.find(s => s.src.includes('script.js'));
  console.log('[LOGO] script.js loaded with src:', scriptJs ? scriptJs.src : 'NOT FOUND');
})();
