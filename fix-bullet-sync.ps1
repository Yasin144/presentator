$f = 'D:\voice\script.js'
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

$newFn = "// Per-bullet typing sync: each bullet/line starts typing when voice reaches it.`r`n// Completed bullets stay visible. Current bullet types char-by-char. Future hidden.`r`n// Locked 1:1 to audioElement.currentTime (no estimation).\r`nfunction getLinearSyncFrame(text, elapsedMs, durationMs) {`r`n  var safeText = String(text || '');`r`n  if (!safeText || !durationMs) {`r`n    return { displayedText: '', exactCharCountFloat: 0, mouthActive: false, speechElapsedMs: 0 };`r`n  }`r`n  var progress = elapsedMs >= durationMs ? 1 : (elapsedMs <= 0 ? 0 : elapsedMs / durationMs);`r`n  if (progress >= 1) {`r`n    return { displayedText: safeText, exactCharCountFloat: safeText.length, mouthActive: false, speechElapsedMs: elapsedMs };`r`n  }`r`n`r`n  // Linear character target based on audio clock`r`n  var charTarget = progress * safeText.length;`r`n`r`n  // Split text into segments at newline boundaries (each bullet is a segment)`r`n  var segments = [];`r`n  var segStart = 0;`r`n  for (var i = 0; i < safeText.length; i++) {`r`n    if (safeText[i] === '\n') {`r`n      segments.push({ start: segStart, end: i + 1 });`r`n      segStart = i + 1;`r`n    }`r`n  }`r`n  if (segStart < safeText.length) {`r`n    segments.push({ start: segStart, end: safeText.length });`r`n  }`r`n  if (segments.length === 0) {`r`n    segments.push({ start: 0, end: safeText.length });`r`n  }`r`n`r`n  // Build displayed text:`r`n  //   past segments  -> show fully`r`n  //   current segment -> type proportionally (char-by-char)`r`n  //   future segments -> hidden`r`n  var displayedParts = [];`r`n  var charFloat = 0;`r`n  for (var j = 0; j < segments.length; j++) {`r`n    var seg = segments[j];`r`n    if (seg.end <= charTarget) {`r`n      // Fully spoken segment - show completely`r`n      displayedParts.push(safeText.slice(seg.start, seg.end));`r`n      charFloat = seg.end;`r`n    } else if (seg.start <= charTarget) {`r`n      // Currently speaking segment - type it proportionally`r`n      var segLen = seg.end - seg.start;`r`n      var segCharFloat = charTarget - seg.start;`r`n      var segCharIdx = Math.ceil(segCharFloat);`r`n      displayedParts.push(safeText.slice(seg.start, seg.start + Math.min(segCharIdx, segLen)));`r`n      charFloat = seg.start + segCharFloat;`r`n      break;`r`n    } else {`r`n      break;`r`n    }`r`n  }`r`n`r`n  return {`r`n    displayedText: displayedParts.join(''),`r`n    exactCharCountFloat: charFloat,`r`n    mouthActive: progress > 0 && progress < 1,`r`n    speechElapsedMs: elapsedMs`r`n  };`r`n}"

# Use regex to replace the entire getLinearSyncFrame function
$pattern = '(?s)// (?:Typing-style sync|Sentence-sync|Linear sync)[^\r\n]*\r?\n(?:[^\r\n]*\r?\n)*?function getLinearSyncFrame\(text, elapsedMs, durationMs\) \{.*?\r?\n\}'

if ($c -match $pattern) {
    $c = [regex]::Replace($c, $pattern, $newFn, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    Write-Host "OK: per-bullet typing sync applied"
} else {
    Write-Host "FAIL: regex did not match, trying direct search"
    if ($c.Contains('function getLinearSyncFrame')) {
        Write-Host "  -> function exists in file"
    }
}

[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "Saved."
