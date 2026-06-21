# Crop Android status bar (top) and gesture nav bar (bottom) from a screenshot.
# Usage:
#   .\crop-android.ps1 .\screen.png
#   .\crop-android.ps1 .\screen.png -Top 96 -Bottom 66
#   .\crop-android.ps1 .\screen.png -Out cropped.png

[CmdletBinding()]
param(
  [Parameter(Mandatory)] [string] $Path,
  [int]    $Top    = 96,
  [int]    $Bottom = 66,
  [string] $Out
)

if (-not (Test-Path $Path)) { Write-Error "Not found: $Path"; exit 1 }
if (-not $Out) { $Out = $Path }

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile((Resolve-Path $Path))
$w = $src.Width
$h = $src.Height
if ($Top + $Bottom -ge $h) { Write-Error "Crop too large for image height $h"; $src.Dispose(); exit 2 }

$newH = $h - $Top - $Bottom
$dst  = New-Object System.Drawing.Bitmap $w, $newH
$g    = [System.Drawing.Graphics]::FromImage($dst)
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $newH
$srcRect = New-Object System.Drawing.Rectangle 0, $Top, $w, $newH
$g.DrawImage($src, $rect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$src.Dispose()

# Save to a temp file first, then move into place — avoids "file in use" if Out == Path.
$tmp = [System.IO.Path]::GetTempFileName() + ".png"
$dst.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
$dst.Dispose()
Move-Item -Force $tmp $Out

Write-Host "Cropped $Path : ${w}x${h} -> ${w}x${newH}  (-${Top}px top, -${Bottom}px bottom) -> $Out"
