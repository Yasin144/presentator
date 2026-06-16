$html = Get-Content D:\presentator\index.html -Raw
$lines = $html -split "`r`n"
$lines = $html -split "`n"
$startIndex = -1
$endIndex = -1

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'id="aiCaptionSection"') { $startIndex = $i }
    # Track the closing element of the aiCaptionDetails block precisely.
    if ($startIndex -ne -1 -and $lines[$i] -match '</details>') { $endIndex = $i; break; }
}

if ($startIndex -eq -1 -or $endIndex -eq -1) { Write-Host "Failed to find boundaries" ; exit }
$captionBlock = $lines[$startIndex..$endIndex]

$header = @(
"<!DOCTYPE html>",
"<html lang='en'>",
"<head>",
"<meta charset='UTF-8'>",
"<meta name='viewport' content='width=device-width, initial-scale=1.0'>",
"<title>Standalone AI Video Caption Studio</title>",
"<link rel='stylesheet' href='styles.css'>",
"<link href='https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap' rel='stylesheet'>",
"</head>",
"<body style='background-color:#1e1e1e; color:white;'><div class='container' style='padding:20px; max-width:800px; margin:auto;'>"
)

$footer = @(
"</div>",
"<script src='caption-script.js' type='module'></script>",
"</body>",
"</html>"
)

$full = $header + $captionBlock + $footer

New-Item -ItemType Directory -Force -Path D:\presentator\Standalone-Caption-Studio | Out-Null
$full | Set-Content D:\presentator\Standalone-Caption-Studio\index.html
Copy-Item D:\presentator\styles.css D:\presentator\Standalone-Caption-Studio\ -Force
Copy-Item D:\presentator\caption-script.js D:\presentator\Standalone-Caption-Studio\ -Force
Copy-Item D:\presentator\caption-worker.js D:\presentator\Standalone-Caption-Studio\ -Force
Write-Host "Standalone export completed!"
