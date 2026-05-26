$checks = @(
  @{ file='D:\voice\script.js'; pattern='getLinearSyncFrame'; label='[script.js] Sentence sync fix' },
  @{ file='D:\voice\script.js'; pattern='Sentence-sync for Chatterbox'; label='[script.js] Sentence sync comment' },
  @{ file='D:\voice\script.js'; pattern='live amplitude-driven lip sync'; label='[script.js] Audio analyser re-enabled' },
  @{ file='D:\voice\script.js'; pattern='linear audio-clock sync'; label='[script.js] Linear sync call active' },
  @{ file='D:\voice\script.js'; pattern='cb-voice-banner'; label='[script.js] Voice loading banner' },
  @{ file='D:\voice\anjali-chatterbox-server.py'; pattern='max_new_tokens'; label='[server.py] Token cap patch' },
  @{ file='D:\voice\anjali-chatterbox-server.py'; pattern='_add_pad'; label='[server.py] Silence padding' },
  @{ file='D:\voice\main.cjs'; pattern='8426'; label='[main.cjs] Port 8426 excluded from kill list' },
  @{ file='D:\voice\Pattan-Presentator.cmd'; pattern='anjali-chatterbox-server'; label='[CMD] Server launcher' }
)

foreach ($c in $checks) {
    $content = [System.IO.File]::ReadAllText($c.file)
    $hit = $content.Contains($c.pattern)
    $status = if ($hit) { 'OK' } else { 'MISSING' }
    Write-Host "$status  $($c.label)"
}
