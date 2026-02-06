
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/run-migration" -Method Post -ErrorAction Stop
    Write-Output "Status: $($response.StatusCode)"
    Write-Output "Content: $($response.Content)"
} catch {
    Write-Output "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Output "Response Body: $($reader.ReadToEnd())"
    }
}
