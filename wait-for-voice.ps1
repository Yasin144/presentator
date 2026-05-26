$startTime = Get-Date
Write-Host "Waiting for voice server (sc3.mp4 clone) to be ready..." -ForegroundColor Cyan

while ($true) {
    try {
        $r = Invoke-RestMethod "http://127.0.0.1:8426/health" -TimeoutSec 3 -ErrorAction Stop
        if ($r.chatterboxReady -eq $true) {
            $secs = [int]((Get-Date) - $startTime).TotalSeconds
            Write-Host ("READY after " + $secs + " seconds!") -ForegroundColor Green
            Add-Type -AssemblyName System.Speech
            $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
            $synth.Rate   = 0
            $synth.Volume = 100
            $synth.Speak("Ready! The sc3 dot mp4 voice clone is loaded. You can now narrate.")
            break
        } else {
            Write-Host "Server up but still loading..." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "." -NoNewline
    }
    Start-Sleep -Seconds 5
}
