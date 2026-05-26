$f = 'D:\voice\script.js'
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

$oldFn = "// Linear sync for Chatterbox: reveal text proportional to audio clock`r`nfunction getLinearSyncFrame(text, elapsedMs, durationMs) {`r`n  var safeText = String(text || '');`r`n  if (!safeText || !durationMs) {`r`n    return { displayedText: '', exactCharCountFloat: 0, mouthActive: false, speechElapsedMs: 0 };`r`n  }`r`n  var progress = elapsedMs >= durationMs ? 1 : (elapsedMs <= 0 ? 0 : elapsedMs / durationMs);`r`n  var charFloat = progress * safeText.length;`r`n  var displayedText = progress >= 1 ? safeText : safeText.slice(0, Math.ceil(charFloat));`r`n  return {`r`n    displayedText: displayedText,`r`n    exactCharCountFloat: charFloat,`r`n    mouthActive: progress > 0 && progress < 1,`r`n    speechElapsedMs: elapsedMs`r`n  };`r`n}"

$newFn = "// Sentence-sync for Chatterbox: reveal one complete sentence at a time,`r`n// locked to the audio clock. Each sentence appears the moment the voice reaches it.`r`nfunction getLinearSyncFrame(text, elapsedMs, durationMs) {`r`n  var safeText = String(text || '');`r`n  if (!safeText || !durationMs) {`r`n    return { displayedText: '', exactCharCountFloat: 0, mouthActive: false, speechElapsedMs: 0 };`r`n  }`r`n  var progress = elapsedMs >= durationMs ? 1 : (elapsedMs <= 0 ? 0 : elapsedMs / durationMs);`r`n  if (progress >= 1) {`r`n    return { displayedText: safeText, exactCharCountFloat: safeText.length, mouthActive: false, speechElapsedMs: elapsedMs };`r`n  }`r`n`r`n  // Character position the audio clock has reached`r`n  var charTarget = Math.floor(progress * safeText.length);`r`n`r`n  // Walk backwards from charTarget to find the last complete sentence boundary`r`n  // Boundaries: newline, bullet point start, or end of sentence (. ! ?)`r`n  var boundary = 0;`r`n  for (var i = 0; i <= charTarget && i < safeText.length; i++) {`r`n    var ch = safeText[i];`r`n    if (ch === '\n') {`r`n      // Newline boundary - include the newline`r`n      boundary = i + 1;`r`n    } else if (ch === '\u2022' && i > 0) {`r`n      // Bullet point - snap to just before it (previous boundary)`r`n      // Will be captured on next iteration when we see newline before it`r`n    } else if ((ch === '.' || ch === '!' || ch === '?') && i + 1 < safeText.length) {`r`n      var next = safeText[i + 1];`r`n      if (next === ' ' || next === '\n' || next === '\u2022') {`r`n        boundary = i + 2;`r`n      }`r`n    }`r`n  }`r`n`r`n  // Also check if charTarget itself lands after a sentence-ending punctuation`r`n  // to avoid holding back a finished sentence`r`n  var displayedText = boundary > 0 ? safeText.slice(0, boundary).trimEnd() : '';`r`n  var charFloat = boundary > 0 ? boundary : 0;`r`n`r`n  return {`r`n    displayedText: displayedText,`r`n    exactCharCountFloat: charFloat,`r`n    mouthActive: progress > 0 && progress < 1,`r`n    speechElapsedMs: elapsedMs`r`n  };`r`n}"

if ($c.Contains($oldFn)) {
    $c = $c.Replace($oldFn, $newFn)
    Write-Host "OK: sentence-sync version applied"
} else {
    Write-Host "FAIL: old function block not found exactly"
    # Check partial
    if ($c.Contains('Linear sync for Chatterbox')) {
        Write-Host "  -> found marker, trying regex"
        $pattern = '// Linear sync for Chatterbox[\s\S]*?^}'
        if ($c -match '(?m)^function getLinearSyncFrame') {
            Write-Host "  -> function exists"
        }
    }
}

[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "Saved."
