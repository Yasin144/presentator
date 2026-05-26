$f = 'D:\voice\script.js'
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# Strategy: replace just the key lines using simple string patterns

# Step 1: Replace "Avatar permanently off" comment block and direct source->gain connection
# with analyser insertion
$c2 = $c -replace '// Avatar permanently off.*?no lip-sync analyser needed\..*?\r\n    // Audio routes directly.*?no FFT tap\)\.\r\n    const gainNode', '// Real-time lip-sync: analyser samples audio amplitude each rAF tick.
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;

    const gainNode'

# Step 2: Replace direct sourceNode->gainNode connection with analyser in between
$c2 = $c2 -replace 'sourceNode\.connect\(gainNode\);\r\n    gainNode\.connect\(audioContext\.destination\);', 'sourceNode.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);'

# Step 3: Replace "analyser: null" with live analyser
$c2 = $c2 -replace "analyser: null,  // No analyser.*?lip-sync skipped", 'analyser,   // live amplitude-driven lip sync'

if ($c2 -ne $c) {
    [System.IO.File]::WriteAllText($f, $c2, [System.Text.Encoding]::UTF8)
    Write-Host "SUCCESS: audio graph patched with real analyser"
} else {
    Write-Host "FAIL: no changes made"
}
