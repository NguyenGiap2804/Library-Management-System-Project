$ErrorActionPreference = "Stop"

$localMvn = "mvn.cmd"
$intellijMvn = "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd"

if (Get-Command $localMvn -ErrorAction SilentlyContinue) {
    & $localMvn spring-boot:run
    exit $LASTEXITCODE
}

if (Test-Path $intellijMvn) {
    & $intellijMvn spring-boot:run
    exit $LASTEXITCODE
}

Write-Error "Maven was not found. Install Maven, add it to PATH, or run LibraryApplication.java directly from IntelliJ."
