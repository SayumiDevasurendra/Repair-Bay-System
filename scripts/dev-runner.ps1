$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$services = @(
  @{
    Name = "shell"
    Color = "Cyan"
    Path = Join-Path $root "IT22114358\IOT_Dashboard"
    Type = "npm"
  },
  @{
    Name = "temperature"
    Color = "Yellow"
    Path = Join-Path $root "temperature"
    Type = "npm"
  },
  @{
    Name = "noise"
    Color = "Magenta"
    Path = Join-Path $root "IT22101310\noiseguard-dashboard-main"
    Type = "npm"
  },
  @{
    Name = "lift"
    Color = "Green"
    Path = Join-Path $root "IT22587824\liftguard-dashboard"
    Type = "npm"
  },
  @{
    Name = "chatbot"
    Color = "Blue"
    Path = Join-Path $root "chatbot"
    Type = "fastapi"
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
  Write-Host "Shell dashboard: http://localhost:4358"
  Write-Host "Temperature: http://localhost:4359"
  Write-Host "Noise: http://localhost:4360"
  Write-Host "Lift: http://localhost:4361"
  Write-Host "Chatbot API: http://127.0.0.1:4362"
  Write-Host "Press Ctrl+C to stop everything."
  Write-Host ""

  foreach ($service in $services) {
    $job = Start-Job -Name $service.Name -ArgumentList $service.Path, $service.Type, $root -ScriptBlock {
      param($servicePath, $serviceType, $repoRoot)

      Set-Location $servicePath
      if ($serviceType -eq "fastapi") {
        $pythonExe = Join-Path $repoRoot "venv\Scripts\python.exe"
        if (Test-Path $pythonExe) {
          & $pythonExe -m uvicorn main:app --host 127.0.0.1 --port 4362 --reload 2>&1
        }
        else {
          python -m uvicorn main:app --host 127.0.0.1 --port 4362 --reload 2>&1
        }
      }
      else {
        npm run dev 2>&1
      }
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
