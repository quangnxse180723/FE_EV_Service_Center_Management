$ErrorActionPreference='Stop'
function showPage($label,$url){
  try{
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
    $len = $r.Content.Length
    $snippet = if($len -gt 1000) { $r.Content.Substring(0,1000) + "\n...[truncated]" } else { $r.Content }
    Write-Output "${label}:STATUS:$($r.StatusCode) LENGTH:$len"
    Write-Output "--- ${label} HEAD ---"
    Write-Output $snippet
    Write-Output "--- end ${label} ---"
  } catch {
    Write-Output "${label}:ERROR:$($_.Exception.Message)"
  }
}
showPage "ROOT" "http://localhost:5173/"
showPage "DASH" "http://localhost:5173/admin/dashboard"
