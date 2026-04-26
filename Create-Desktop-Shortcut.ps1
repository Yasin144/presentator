param(
  [string]$ShortcutName = "Yasin Presentator"
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcherPath = Join-Path $repoRoot "Yasin Presentator.cmd"
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
$shortcut.Description = "Launch $ShortcutName on 127.0.0.1 with local servers"
$shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
$shortcut.Save()

Write-Output "Created desktop shortcut: $shortcutPath"
