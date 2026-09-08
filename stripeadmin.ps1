$env:PSReadLineEditMode = "Windows"
$Host.UI.RawUI.WindowTitle = "Stripe Payment Admin"

$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\.env.local"
$envFile = [System.IO.File]::ReadAllText($f, $utf8)
$supaUrl = ($envFile -split "`n" | Where-Object { $_ -match "NEXT_PUBLIC_SUPABASE_URL=" }) -replace "NEXT_PUBLIC_SUPABASE_URL=", ""
$supaKey = ($envFile -split "`n" | Where-Object { $_ -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=" }) -replace "NEXT_PUBLIC_SUPABASE_ANON_KEY=", ""

function Get-Rows($table, $query) {
  $url = "$supaUrl/rest/v1/$table$query"
  $headers = @{ "apikey" = $supaKey; "Authorization" = "Bearer $supaKey" }
  try {
    $r = Invoke-RestMethod -Uri $url -Headers $headers
    return $r
  } catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    return @()
  }
}

Write-Host "===== Stripe Payment Admin =====" -ForegroundColor Cyan
Write-Host "1. List recent payments (last 50)" -ForegroundColor White
Write-Host "2. List FAILED payments (recovery list)" -ForegroundColor Yellow
Write-Host "3. Revenue stats (today / week / month)" -ForegroundColor Green
Write-Host "4. Check webhook health (failed credits)" -ForegroundColor Magenta
Write-Host "5. Manually credit a purchase (fix webhook)" -ForegroundColor Red
Write-Host "6. List refunds & clawbacks" -ForegroundColor Blue
Write-Host "0. Exit" -ForegroundColor White

$choice = Read-Host "`nChoose"

switch ($choice) {
    "1" {
      $purchases = Get-Rows "purchases" "?select=id,email,pack,credits,status,created_at_et&order=id.desc&limit=50"
      if ($purchases.Count -gt 0) {
        $purchases | Format-Table id, email, pack, credits, status, created_at_et -AutoSize
      } else {
        Write-Host "No purchases found." -ForegroundColor Yellow
      }
    }
    "2" {
      $failed = Get-Rows "purchases" "?select=id,email,pack,credits,status,created_at_et&status=neq.paid&order=id.desc&limit=50"
      if ($failed.Count -gt 0) {
        Write-Host "FAILED PAYMENTS - Contact these users!" -ForegroundColor Yellow
        $failed | Format-Table id, email, pack, credits, status, created_at_et -AutoSize
      } else {
        Write-Host "No failed payments found. All clear!" -ForegroundColor Green
      }
    }
    "3" {
      $all = Get-Rows "purchases" "?select=credits,created_at_et,status"
      $now = Get-Date
      $today = $all | Where-Object { $_.status -eq "paid" -and (Get-Date $_.created_at_et) -gt $now.AddDays(-1) }
      $week = $all | Where-Object { $_.status -eq "paid" -and (Get-Date $_.created_at_et) -gt $now.AddDays(-7) }
      $month = $all | Where-Object { $_.status -eq "paid" -and (Get-Date $_.created_at_et) -gt $now.AddDays(-30) }
      
      $todayRevenue = ($today | Measure-Object -Property credits -Sum).Sum * 0.09
      $weekRevenue = ($week | Measure-Object -Property credits -Sum).Sum * 0.09
      $monthRevenue = ($month | Measure-Object -Property credits -Sum).Sum * 0.09
      
      Write-Host "`nRevenue (at $0.09/credit):" -ForegroundColor Green
      Write-Host "  Today: $($today.Count) purchases = $$$([math]::Round($todayRevenue, 2))"
      Write-Host "  Week:  $($week.Count) purchases = $$$([math]::Round($weekRevenue, 2))"
      Write-Host "  Month: $($month.Count) purchases = $$$([math]::Round($monthRevenue, 2))"
    }
    "4" {
      $pending = Get-Rows "purchases" "?select=id,email,pack,credits,status&status=eq.pending&order=id.desc&limit=20"
      if ($pending.Count -gt 0) {
        Write-Host "PENDING PURCHASES (webhook may have failed):" -ForegroundColor Red
        $pending | Format-Table id, email, pack, credits, status -AutoSize
        Write-Host "`nUse option 5 to manually credit these." -ForegroundColor Yellow
      } else {
        Write-Host "No pending purchases. Webhooks healthy!" -ForegroundColor Green
      }
    }
    "5" {
      $id = Read-Host "Enter purchase ID to mark as paid"
      $headers = @{ "apikey" = $supaKey; "Authorization" = "Bearer $supaKey"; "Content-Type" = "application/json"; "Prefer" = "return=minimal" }
      $body = @{ status = "paid" } | ConvertTo-Json
      try {
        Invoke-RestMethod -Uri "$supaUrl/rest/v1/purchases?id=eq.$id" -Method PATCH -Headers $headers -Body $body
        Write-Host "Purchase $id marked as PAID!" -ForegroundColor Green
        
        $purchase = Get-Rows "purchases" "?select=email,credits&id=eq.$id"
        if ($purchase.Count -gt 0) {
          $email = $purchase[0].email
          $credits = $purchase[0].credits
          
          $body2 = @{ email = $email; amount = $credits } | ConvertTo-Json
          Invoke-RestMethod -Uri "$supaUrl/rest/v1/rpc/add_credits" -Method POST -Headers $headers -Body $body2
          Write-Host "Credited $credits to $email" -ForegroundColor Green
        }
      } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
      }
    }
    "6" {
      $refunds = Get-Rows "purchases" "?select=id,email,pack,credits,status,created_at_et&status=eq.refunded&order=id.desc&limit=50"
      if ($refunds.Count -gt 0) {
        Write-Host "REFUNDED PURCHASES (commissions clawed back):" -ForegroundColor Blue
        $refunds | Format-Table id, email, pack, credits, status, created_at_et -AutoSize
      } else {
        Write-Host "No refunds found." -ForegroundColor Yellow
      }
    }
    "0" { exit }
    default { Write-Host "Invalid choice" -ForegroundColor Red }
}

Read-Host "`nPress Enter to exit"