$f = 'D:\voice\script.js'
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# Step 1: inject getLinearSyncFrame before getSpeechSyncFrame
$anchor = 'function getSpeechSyncFrame(text = "", elapsedMs = 0, targetDurationMs = 0, options = {}) {'

$newFn = "// Linear sync for Chatterbox: reveal text proportional to audio clock`r`nfunction getLinearSyncFrame(text, elapsedMs, durationMs) {`r`n  var safeText = String(text || '');`r`n  if (!safeText || !durationMs) {`r`n    return { displayedText: '', exactCharCountFloat: 0, mouthActive: false, speechElapsedMs: 0 };`r`n  }`r`n  var progress = elapsedMs >= durationMs ? 1 : (elapsedMs <= 0 ? 0 : elapsedMs / durationMs);`r`n  var charFloat = progress * safeText.length;`r`n  var displayedText = progress >= 1 ? safeText : safeText.slice(0, Math.ceil(charFloat));`r`n  return {`r`n    displayedText: displayedText,`r`n    exactCharCountFloat: charFloat,`r`n    mouthActive: progress > 0 && progress < 1,`r`n    speechElapsedMs: elapsedMs`r`n  };`r`n}`r`n`r`n"

if ($c.Contains($anchor)) {
    $c = $c.Replace($anchor, $newFn + $anchor)
    Write-Host "Step 1 OK: getLinearSyncFrame injected"
} else {
    Write-Host "Step 1 FAIL"
}

# Step 2: replace getSpeechSyncFrame call in startNarrationLoop with getLinearSyncFrame
# Use regex to match across the multiline call
$pattern = 'const syncFrame = getSpeechSyncFrame\(state\.text, syncElapsedMs, durationMs, \{[\s\S]*?\}\);'
$replacement = "const syncFrame = getLinearSyncFrame(state.text, elapsedMs, durationMs); // linear audio-clock sync"

if ($c -match $pattern) {
    $c = [regex]::Replace($c, $pattern, $replacement, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    Write-Host "Step 2 OK: sync call replaced"
} else {
    Write-Host "Step 2 FAIL: pattern not matched"
}

[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "Saved."
