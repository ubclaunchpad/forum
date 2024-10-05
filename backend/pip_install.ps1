# Usage: .\pip_install.ps1 <package>
# e.g. .\pip_install.ps1 fastapi

if ($args.Count -eq 0) {
    Write-Host "Please provide a package name"
    exit 1
}

pip install $args

if ($LASTEXITCODE -eq 0) {
    $package = $args[0]
    pip freeze | Select-String "^$package==" | Out-File -Append -FilePath requirements.in
    Write-Host "Package added to requirements.in"
    
    if (Get-Command pip-compile -ErrorAction SilentlyContinue) {
        pip-compile requirements.in
        Write-Host "requirements.in compiled to requirements.txt"
    } else {
        Write-Host "pip-compile not found. Please install pip-tools to compile requirements.txt"
    }
} else {
    Write-Host "Failed to install package"
}
