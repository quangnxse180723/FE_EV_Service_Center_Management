$ErrorActionPreference='Stop'
function show($label, $url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
  Write-Output ("${label}:$($r.StatusCode)")
  } catch {
  Write-Output ("${label}:ERROR:$($_.Exception.Message)")
  }
}
show "BE_STAFFS" "http://localhost:8080/api/admin/staffs"
show "BE_TECHS" "http://localhost:8080/api/admin/technicians"
show "DEVPROXY_STAFFS" "http://localhost:5173/api/admin/staffs"
show "DEVPROXY_TECHS" "http://localhost:5173/api/admin/technicians"
