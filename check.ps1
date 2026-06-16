$procs = Get-Process | Where-Object { $_.Name -match 'electron|python|node' }
if ($procs) {
    $procs | Select-Object Name, Id | Format-Table -AutoSize
} else {
    Write-Host "No electron/python/node running"
}
