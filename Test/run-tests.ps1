param(
    [ValidateSet("all", "api", "ui")]
    [string]$Suite = "all",

    [switch]$Headed,

    [int]$SlowMoMs = 500
)

$ErrorActionPreference = "Stop"

$testRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $testRoot
try {
    if ($Headed) {
        $env:UI_HEADLESS = "false"
        $env:UI_SLOW_MO_MS = [string]$SlowMoMs
    }

    switch ($Suite) {
        "api" { node automated/api-tests.mjs }
        "ui" { node automated/ui-smoke-tests.mjs }
        default { node automated/run-all.mjs }
    }
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        exit $exitCode
    }
}
finally {
    Pop-Location
}
