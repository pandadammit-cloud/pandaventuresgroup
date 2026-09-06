# Copies latest HTML spec docs from sibling repos into public/docs/
# Run automatically via `npm run sync-docs` before firebase deploy

$srcDockBound    = "C:\Users\Amy\DocBound2\docs"
$srcForumJourney = "C:\Users\Amy\EventBound\docs"
$destDockBound    = "$PSScriptRoot\..\public\docs\dockbound"
$destForumJourney = "$PSScriptRoot\..\public\docs\forumjourney"

$files = @(
  "product-spec.html",
  "admin-spec.html",
  "architecture.html",
  "pm-report.html",
  "roadmap.html"
)

New-Item -ItemType Directory -Force -Path $destDockBound    | Out-Null
New-Item -ItemType Directory -Force -Path $destForumJourney | Out-Null

foreach ($file in $files) {
  $src = Join-Path $srcDockBound $file
  $dst = Join-Path $destDockBound $file
  if (Test-Path $src) { Copy-Item $src $dst -Force; Write-Host "  DockBound:    $file" }
  else                 { Write-Host "  MISSING:      DockBound/$file" }
}

foreach ($file in $files) {
  $src = Join-Path $srcForumJourney $file
  $dst = Join-Path $destForumJourney $file
  if (Test-Path $src) { Copy-Item $src $dst -Force; Write-Host "  ForumJourney: $file" }
  else                 { Write-Host "  MISSING:      ForumJourney/$file" }
}

Write-Host "Doc sync complete."
