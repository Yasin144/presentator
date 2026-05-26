taskkill /F /IM electron.exe /T 2>$null
Start-Sleep -Seconds 2
Start-Process "D:\voice\Pattan-Presentator.cmd" -WindowStyle Normal
Write-Host "App restarted."
