# creditadmin.ps1 - FounderPilot Admin + Fraud Detection
$ErrorActionPreference = "Stop"
$lines = Get-Content (Join-Path $PSScriptRoot ".env.local")
function EnvVal($n){ ($lines | Select-String "^$n=") -replace "^$n=","" | ForEach-Object { $_.Trim().Trim('"') } }
$url = EnvVal "NEXT_PUBLIC_SUPABASE_URL"
$svc = EnvVal "SUPABASE_SERVICE_KEY"; if(-not $svc){$svc = EnvVal "SUPABASE_SERVICE_ROLE_KEY"}; if(-not $svc){$svc = EnvVal "NEXT_PUBLIC_SUPABASE_ANON_KEY"}
$H = @{ apikey=$svc; Authorization="Bearer $svc"; Prefer="return=representation" }
function ET { try { $tz=[System.TimeZoneInfo]::FindSystemTimeZoneById("Eastern Standard Time"); return [System.TimeZoneInfo]::ConvertTime((Get-Date),$tz).ToString("yyyy-MM-dd HH:mm:ss ET") } catch { return (Get-Date).ToString("yyyy-MM-dd HH:mm:ss ET") } }
function Enc($e){ [uri]::EscapeDataString($e) }
function Get-Rows($t,$q){ Invoke-RestMethod -Uri "$url/rest/v1/$t$q" -Headers $H }
function Patch($t,$q,$b){ Invoke-RestMethod -Uri "$url/rest/v1/$t$q" -Method PATCH -Body ($b|ConvertTo-Json) -ContentType "application/json" -Headers $H }
function Post($t,$b){ Invoke-RestMethod -Uri "$url/rest/v1/$t" -Method POST -Body ($b|ConvertTo-Json) -ContentType "application/json" -Headers $H }

function Ensure-Row($email){
  $rows = Get-Rows "credits" "?select=id&email=eq.$(Enc $email)"
  if (-not ($rows -and @($rows).Count -gt 0)) { Post "credits" @{ email=$email; pack_balance=0; balance=0; plan="manual"; status="active" } | Out-Null }
}

function Add-Credits($email,$amt){
  Ensure-Row $email
  $rows = Get-Rows "credits" "?select=pack_balance&email=eq.$(Enc $email)"
  $cur = @($rows)[0].pack_balance
  Patch "credits" "?email=eq.$(Enc $email)" @{ pack_balance = ($cur + $amt) } | Out-Null
  Post "credit_usage" @{ email=$email; action="admin_adjust"; credits=$amt; timestamp_et=(ET); suite="admin"; ip="powershell"; user_agent="creditadmin.ps1" } | Out-Null
  Write-Host "  $email : $cur -> $($cur+$amt) pack credits. (Client will see it on refresh)." -ForegroundColor Green
}

function Show-SuspiciousAccounts {
  Write-Host "`n===== Users with Credits but NO Purchase =====" -ForegroundColor Yellow
  $credUsers = Get-Rows "credits" "?select=email,pack_balance&pack_balance=gt.0&status=eq.active"
  
  # Try to get purchase history
  $paidEmails = @()
  try {
    $purchasers = Get-Rows "purchases" "?select=email"
    if ($purchasers) { $paidEmails += @($purchasers | ForEach-Object { $_.email }) }
  } catch {}
  try {
    $stripeUsers = Get-Rows "stripe_events" "?select=email&type=eq.checkout.session.completed"
    if ($stripeUsers) { $paidEmails += @($stripeUsers | ForEach-Object { $_.email }) }
  } catch {}
  $paidEmails = $paidEmails | Select-Object -Unique
  
  $suspicious = @()
  foreach ($u in @($credUsers)) {
    # Skip your test emails
    if ($u.email -notin $paidEmails -and $u.email -notlike "*+webhook*" -and $u.email -notlike "*+live*" -and $u.email -notlike "*+owner*" -and $u.email -notlike "*+member*") {
      $suspicious += $u
    }
  }
  
  if ($suspicious.Count -eq 0) {
    Write-Host "  No suspicious accounts found." -ForegroundColor Green
  } else {
    Write-Host "  Found $($suspicious.Count) suspicious accounts:" -ForegroundColor Red
    $suspicious | ForEach-Object { Write-Host "    - $($_.email): $($_.pack_balance) credits" -ForegroundColor Yellow }
    Write-Host "`n  If they have issues, they should email: greatmind20+webhook@gmail.com" -ForegroundColor Cyan
  }
  return $suspicious
}

function Remove-FraudCredits($email) {
  Ensure-Row $email
  $rows = Get-Rows "credits" "?select=pack_balance&email=eq.$(Enc $email)"
  $cur = @($rows)[0].pack_balance
  Patch "credits" "?email=eq.$(Enc $email)" @{ pack_balance=0; status="fraud_suspected" } | Out-Null
  Post "credit_usage" @{ 
    email=$email; 
    action="fraud_removal"; 
    credits=-$cur; 
    timestamp_et=(ET); 
    suite="admin"; 
    ip="powershell"; 
    user_agent="creditadmin.ps1 fraud removal" 
  } | Out-Null
  Write-Host "  Removed $cur credits from $email (status: fraud_suspected)" -ForegroundColor Red
  Write-Host "  If they complain, they should email: greatmind20+webhook@gmail.com" -ForegroundColor Cyan
}

while ($true) {
  Write-Host "`n===== FounderPilot Admin + Fraud Detection =====" -ForegroundColor Cyan
  Write-Host "1. Add credits to an email"
  Write-Host "2. View balance for an email"
  Write-Host "3. List ALL balances"
  Write-Host "4. View recent usage log (Eastern Time)"
  Write-Host "5. Register affiliate + grant free credits"
  Write-Host "6. List all affiliates"
  Write-Host "7. FREEZE or UNFREEZE an account's credits"
  Write-Host "8. Show suspicious accounts (credits but no purchase)"
  Write-Host "9. Remove credits from suspicious account"
  Write-Host "0. Exit"
  $c = Read-Host "Choose"
  switch ($c) {
    "1" { $e=Read-Host "Email"; $a=[int](Read-Host "Amount"); Add-Credits $e $a }
    "2" { $e=Read-Host "Email"; Get-Rows "credits" "?select=email,balance,pack_balance,status&email=eq.$(Enc $e)" | Format-List }
    "3" { Get-Rows "credits" "?select=email,balance,pack_balance,status&order=pack_balance.desc" | Format-Table }
    "4" { Get-Rows "credit_usage" "?select=timestamp_et,email,action,credits,suite&order=created_at.desc&limit=30" | Format-Table }
    "5" { $e=Read-Host "Affiliate email"; $code=Read-Host "Affiliate code"; $a=[int](Read-Host "Free credits to grant");
          Ensure-Row $e
          Post "affiliates" @{ email=$e; affiliate_code=$code; commission_rate=20; created_at_et=(ET) } | Out-Null
          Add-Credits $e $a
          Post "referrals" @{ affiliate_code=$code; referred_email=$e; status="affiliate_grant"; timestamp_et=(ET) } | Out-Null }
    "6" { Get-Rows "affiliates" "?select=email,affiliate_code,commission_rate,total_earned,created_at_et" | Format-Table }
    "7" { $e=Read-Host "Email"; $s=Read-Host "New status (active / frozen / fraud_suspected)"; Ensure-Row $e; Patch "credits" "?email=eq.$(Enc $e)" @{ status=$s } | Out-Null; Write-Host "  $e credits set to: $s" -ForegroundColor Yellow }
    "8" { Show-SuspiciousAccounts | Out-Null }
    "9" { $e=Read-Host "Email to remove credits from"; Remove-FraudCredits $e }
    "0" { exit }
  }
}