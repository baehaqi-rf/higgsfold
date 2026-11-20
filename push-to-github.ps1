# HiggsFold — Commit & Push to GitHub (Windows PowerShell)
param(
  [string]$Message = "feat: HiggsFold v2.0 (REA Flow/Gemini bridge, Cinema Studio 4.0 optics & multi-move compiler)"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
}

$remotes = git remote
if ($remotes -contains "origin") {
  git remote set-url origin https://github.com/baehaqi-rf/higgsfold.git
} else {
  git remote add origin https://github.com/baehaqi-rf/higgsfold.git
}

git add .
git commit -m $Message
git push -u origin main
