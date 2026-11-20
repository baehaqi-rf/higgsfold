# HiggsFold — Commit & Push to GitHub (Windows PowerShell)
param(
  [string]$Message = "feat: HiggsFold v3.0 (113 Soul presets, 35 camera moves, 20 palettes, Lipsync, Motion Control, Short Drama, Color Transfer & Editing Room)"
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
