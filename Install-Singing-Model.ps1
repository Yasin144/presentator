param(
  [string]$Python = "py -3.12",
  [string]$Device = "cpu"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Venv = Join-Path $Root ".singing-venv"
$PythonExe = Join-Path $Venv "Scripts\python.exe"
$ModelDir = Join-Path $Root "AI_Models\sc3-singing"
$ConfigPath = Join-Path $ModelDir "singing-model.json"

if (!(Test-Path -LiteralPath $PythonExe)) {
  Push-Location $Root
  try {
    Invoke-Expression "$Python -m venv .singing-venv"
  } finally {
    Pop-Location
  }
}

& $PythonExe -m pip install --upgrade pip wheel
& $PythonExe -m pip install -r (Join-Path $Root "requirements-singing.txt")

New-Item -ItemType Directory -Force -Path $ModelDir | Out-Null
$config = [ordered]@{
  command = @(
    $PythonExe,
    (Join-Path $Root "sc3_singing_pipeline.py"),
    "--input", "{song}",
    "--lyrics", "{lyrics}",
    "--model-dir", "{modelDir}",
    "--output", "{output}",
    "--device", $Device
  )
  cwd = $Root
  timeoutSeconds = 3600
  env = @{
    HF_HUB_DISABLE_SYMLINKS_WARNING = "1"
  }
}

$config | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $ConfigPath -Encoding UTF8
Write-Host "sc3 singing model installed."
Write-Host "Config: $ConfigPath"
