<#
.SYNOPSIS
    Installs and copies AI Agent skills to any destination project or global configuration.

.DESCRIPTION
    This script copies AI Agent skills from this repository into:
    1. A target project's `.agents/skills/` directory (for project-scoped usage in Antigravity / Gemini CLI).
    2. The global `~/.gemini/config/skills/` directory (for system-wide availability).
    3. Any custom target directory (e.g., Cursor, Claude Code, or other AI workspaces).

.PARAMETER Destination
    The root path of the target project or destination directory.

.PARAMETER Global
    If specified, installs all skills globally to $HOME/.gemini/config/skills/.

.PARAMETER SkillName
    Optional. Name of a specific skill folder to copy (e.g. '01-requirements-spec').
    If omitted, all 22 skills are copied.

.EXAMPLE
    .\install-skills.ps1 -Destination "C:\Projects\my-new-microservice"
    .\install-skills.ps1 -Global
    .\install-skills.ps1 -Destination "C:\Projects\my-app" -SkillName "01-requirements-spec"
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Destination,

    [switch]$Global,

    [string]$SkillName
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceSkillsDir = Join-Path $ScriptDir "skills"

if (-not (Test-Path $SourceSkillsDir)) {
    Write-Error "Source skills directory not found at: $SourceSkillsDir"
}

# Determine target directory
if ($Global) {
    $TargetDir = Join-Path $HOME ".gemini\config\skills"
    Write-Host "Mode: Global Installation" -ForegroundColor Cyan
} elseif ($Destination) {
    # If the user passed a project root, put it in .agents\skills
    if ($Destination -match "skills$") {
        $TargetDir = $Destination
    } else {
        $TargetDir = Join-Path $Destination ".agents\skills"
    }
    Write-Host "Mode: Project Installation -> $TargetDir" -ForegroundColor Cyan
} else {
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "      AI Agent Skills Installer (Windows / PowerShell)    " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "1. Install globally to ~/.gemini/config/skills/ (All projects)"
    Write-Host "2. Install to a specific project (.agents/skills/)"
    Write-Host "Q. Quit"
    $choice = Read-Host "`nChoose an option [1/2/Q]"

    if ($choice -eq "1") {
        $TargetDir = Join-Path $HOME ".gemini\config\skills"
    } elseif ($choice -eq "2") {
        $destInput = Read-Host "Enter the absolute path of the target project root"
        if ([string]::IsNullOrWhiteSpace($destInput)) {
            Write-Warning "No destination provided. Exiting."
            exit 0
        }
        $TargetDir = Join-Path $destInput ".agents\skills"
    } else {
        Write-Host "Exiting."
        exit 0
    }
}

# Ensure destination exists
if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

# Copy skills
if ($SkillName) {
    $sourcePath = Join-Path $SourceSkillsDir $SkillName
    if (-not (Test-Path $sourcePath)) {
        Write-Error "Skill folder '$SkillName' does not exist in $SourceSkillsDir."
    }
    $targetPath = Join-Path $TargetDir $SkillName
    Copy-Item -Path $sourcePath -Destination $TargetDir -Recurse -Force
    Write-Host "✓ Successfully copied '$SkillName' to: $targetPath" -ForegroundColor Green
} else {
    $skills = Get-ChildItem -Directory $SourceSkillsDir
    Write-Host "`nCopying $($skills.Count) skills to: $TargetDir..." -ForegroundColor Yellow

    foreach ($skill in $skills) {
        $targetSkillPath = Join-Path $TargetDir $skill.Name
        Copy-Item -Path $skill.FullName -Destination $TargetDir -Recurse -Force
        Write-Host "  [+] Copied $($skill.Name)" -ForegroundColor Gray
    }
    Write-Host "`n✓ All $($skills.Count) skills successfully installed to: $TargetDir" -ForegroundColor Green
}

Write-Host "`nUsage Tip:" -ForegroundColor Cyan
Write-Host "In your AI assistant prompt or task, activate any skill by mentioning its name or workflow, e.g.:"
Write-Host "  'Use the requirements-spec skill to draft a PRD for this feature.'"
Write-Host "  'Use the system-architecture-design skill to create a C4 diagram.'"
