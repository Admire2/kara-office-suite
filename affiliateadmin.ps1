$Host.UI.RawUI.WindowTitle = "Affiliate + Layers Command Center"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$envFile = [System.IO.File]::ReadAllText("$PWD\.env.local", $utf8)
$supaUrl = ($envFile -split "`n" | Where-Object { $_ -match "NEXT_PUBLIC_SUPABASE_URL=" }) -replace "NEXT_PUBLIC_SUPABASE_URL=", ""
$supaKey = ($envFile -split "`n" | Where-Object { $_ -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=" }) -replace "NEXT_PUBLIC_SUPABASE_ANON_KEY=", ""
function Get-Data($table, $query) {
  $headers = @{ "apikey" = $supaKey; "Authorization" = "Bearer $supaKey" }
  try { return Invoke-RestMethod -Uri "$supaUrl/rest/v1/$table$query" -Headers $headers } catch { return @() }
}
function ET-Now { return [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId((Get-Date), "Eastern Standard Time").ToString("yyyy-MM-dd HH:mm:ss") }

while ($true) {
  Clear-Host
  Write-Host "===== AFFILIATE + 5-LAYER COMMAND CENTER =====" -ForegroundColor Magenta
  Write-Host "1. Partners directory (Layer 2)"
  Write-Host "2. Affiliate clicks (Layer 2 telemetry)"
  Write-Host "3. Value chain analysis (Layer 5 input)"
  Write-Host "4. ORDER PIPELINE + advance status (Layer 4)"
  Write-Host "5. DEMAND AGGREGATION + bulk signals (Layer 5)"
  Write-Host "6. FIVE-LAYER DASHBOARD"
  Write-Host "0. Exit"
  $c = Read-Host "`nChoose"
  if ($c -eq "0") { break }
  switch ($c) {
    "1" { Get-Data "affiliate_partners" "?select=partner_name,category,country,city,status&order=country" | Format-Table partner_name, category, country, city, status -AutoSize }
    "2" { Get-Data "affiliate_clicks" "?select=timestamp_et,user_email,partner_name,project_context&order=id.desc&limit=25" | Format-Table timestamp_et, user_email, partner_name, project_context -AutoSize }
    "3" {
      $clicks = Get-Data "affiliate_clicks" "?select=partner_name"
      $partners = Get-Data "affiliate_partners" "?select=partner_name,category"
      $map = @{}; foreach ($p in $partners) { $map[$p.partner_name] = $p.category }
      $clicks | Group-Object { $map[$_.partner_name] } | Sort-Object Count -Descending | Format-Table Name, Count -AutoSize
    }
    "4" {
      $orders = Get-Data "orders" "?select=id,user_email,partner_name,item_key,qty,status&order=id.desc&limit=30"
      $orders | Format-Table id, user_email, partner_name, item_key, qty, status -AutoSize
      $adv = Read-Host "Advance an order? Enter id (or blank to skip)"
      if ($adv) {
        $st = Read-Host "New status (quoted / ordered / fulfilled / cancelled)"
        $headers = @{ "apikey" = $supaKey; "Authorization" = "Bearer $supaKey"; "Content-Type" = "application/json"; "Prefer" = "return=minimal" }
        $body = @{ status = $st; updated_at_et = (ET-Now) } | ConvertTo-Json
        Invoke-RestMethod -Uri "$supaUrl/rest/v1/orders?id=eq.$adv" -Method PATCH -Headers $headers -Body $body | Out-Null
        Write-Host "Order $adv -> $st" -ForegroundColor Green
      }
    }
    "5" {
      $orders = Get-Data "orders" "?select=item_key,qty,status"
      Write-Host "`nBulk demand signals (total qty per item):" -ForegroundColor Cyan
      $orders | Group-Object item_key | ForEach-Object { [pscustomobject]@{ Item = $_.Name; TotalQty = ($_.Group | Measure-Object qty -Sum).Sum; Orders = $_.Count } } | Sort-Object TotalQty -Descending | Format-Table -AutoSize
      Write-Host "RULE: TotalQty > 50 in a month -> negotiate bulk pricing or launch in-house production (Layer 5 trigger)." -ForegroundColor Yellow
    }
    "6" {
      $pn = (Get-Data "affiliate_partners" "?select=id").Count
      $ln = (Get-Data "partner_listings" "?select=id").Count
      $cn = (Get-Data "affiliate_clicks" "?select=id").Count
      $on = (Get-Data "orders" "?select=id").Count
      $pr = (Get-Data "user_prompts" "?select=id").Count
      Write-Host "`nLAYER 1 DESIGN      : prompts captured = $pr (Rivet/Maxi/Volt/Terra live)" -ForegroundColor Cyan
      Write-Host "LAYER 2 ROUTING     : partners = $pn | affiliate clicks = $cn" -ForegroundColor Green
      Write-Host "LAYER 3 MARKETPLACE : priced listings = $ln (compare cards live)" -ForegroundColor Yellow
      Write-Host "LAYER 4 FULFILLMENT : tracked orders = $on" -ForegroundColor Magenta
      Write-Host "LAYER 5 INTELLIGENCE: run option 5 for bulk signals" -ForegroundColor Red
    }
  }
  Read-Host "`nPress Enter to continue"
}
