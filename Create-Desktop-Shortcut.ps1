param(
  [string]$ShortcutName = "Female Presentator - All Servers"
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcherPath = Join-Path $repoRoot "Voice-Presentator.cmd"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath ($ShortcutName + ".lnk")

if (-not (Test-Path $launcherPath)) {
  throw "Launcher not found: $launcherPath"
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$env:SystemRoot\System32\cmd.exe"
$shortcut.Arguments = "/c `"$launcherPath`""
$shortcut.WorkingDirectory = $repoRoot
$shortcut.Description = "Launch $ShortcutName with Chatterbox, voice, caption, export, and Electron services"
$iconPath = Join-Path $repoRoot "pattan-presentator.ico"
$shortcut.IconLocation = if (Test-Path $iconPath) { $iconPath } else { "$env:SystemRoot\System32\shell32.dll,220" }
$shortcut.Save()

Write-Output "Created desktop shortcut: $shortcutPath"
