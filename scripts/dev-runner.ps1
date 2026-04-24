$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$services = @(
  @{
    Name = "shell"
    Color = "Cyan"
    Path = Join-Path $root "IT22114358\IOT_Dashboard"
  },
  @{
    Name = "temperature"
    Color = "Yellow"
    Path = Join-Path $root "temperature"
  },
  @{
    Name = "noise"
    Color = "Magenta"
    Path = Join-Path $root "IT22101310\noiseguard-dashboard-main"
  },
  @{
    Name = "lift"
    Color = "Green"
    Path = Join-Path $root "IT22587824\liftguard-dashboard"
  }
)

$jobs = @()

function Stop-AllJobs {
  param([array]$ActiveJobs)

  foreach ($job in $ActiveJobs) {
    if ($job.State -eq "Running") {
      Stop-Job -Job $job | Out-Null
    }
  }

  foreach ($job in $ActiveJobs) {
    Receive-Job -Job $job | Out-Null
    Remove-Job -Job $job | Out-Null
  }
}

try {
  Write-Host "Starting Repair Bay System..."
  Write-Host "Shell dashboard: http://localhost:3000"
  Write-Host "Temperature: http://localhost:8099"
  Write-Host "Noise: http://localhost:8080"
  Write-Host "Lift: http://localhost:8081"
  Write-Host "Press Ctrl+C to stop everything."
  Write-Host ""

  foreach ($service in $services) {
    $job = Start-Job -Name $service.Name -ArgumentList $service.Path -ScriptBlock {
      param($servicePath)

      Set-Location $servicePath
      npm run dev 2>&1
    }

    $jobs += [PSCustomObject]@{
      Name = $service.Name
      Color = $service.Color
      Job = $job
    }
  }

  while ($true) {
    foreach ($entry in $jobs) {
      $lines = Receive-Job -Job $entry.Job
      foreach ($line in $lines) {
        if ($null -ne $line -and "$line".Trim()) {
          Write-Host "[$($entry.Name)]" -ForegroundColor $entry.Color -NoNewline
          Write-Host " $line"
        }
      }
    }

    $failedJob = $jobs | Where-Object { $_.Job.State -in @("Failed", "Stopped", "Completed") } | Select-Object -First 1
    if ($failedJob) {
      Write-Host ""
      Write-Host "[$($failedJob.Name)] stopped. Shutting down the other dev servers..." -ForegroundColor Red
      break
    }

    Start-Sleep -Milliseconds 300
  }
}
finally {
  Write-Host ""
  Write-Host "Stopping all dev servers..."
  Stop-AllJobs -ActiveJobs ($jobs.Job)
}
