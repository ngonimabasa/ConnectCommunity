# ============================================
# WebP Image Converter Script
# ============================================
# This script converts JPEG/PNG images to WebP format
# Requires: ImageMagick (install via: winget install ImageMagick.ImageMagick)
# ============================================

param(
    [string]$ImagePath = "assets/img",
    [int]$Quality = 80
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "WebP Image Converter" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if ImageMagick is installed
$magickPath = Get-Command magick -ErrorAction SilentlyContinue

if (-not $magickPath) {
    Write-Host "ERROR: ImageMagick is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ImageMagick using one of these methods:" -ForegroundColor Yellow
    Write-Host "1. winget install ImageMagick.ImageMagick" -ForegroundColor White
    Write-Host "2. Download from: https://imagemagick.org/script/download.php" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use online converter at https://convertio.co/jpg-webp/" -ForegroundColor Cyan
    exit 1
}

Write-Host "ImageMagick found: $($magickPath.Source)" -ForegroundColor Green
Write-Host ""

# Get the base directory
$baseDir = $PSScriptRoot
if (-not $baseDir) {
    $baseDir = Get-Location
}

$imagePath = Join-Path $baseDir $ImagePath
Write-Host "Scanning directory: $imagePath" -ForegroundColor Cyan
Write-Host ""

# Find all JPEG and PNG files
$images = Get-ChildItem -Path $imagePath -Recurse -Include *.jpg,*.jpeg,*.png | 
    Where-Object { $_.Name -notlike "*_original*" -and $_.Name -notlike "*-640*" -and $_.Name -notlike "*-1280*" }

$totalImages = $images.Count
$convertedImages = 0
$totalSavings = 0

Write-Host "Found $totalImages images to convert" -ForegroundColor Cyan
Write-Host ""

foreach ($image in $images) {
    $webpPath = $image.FullName -replace '\.(jpe?g|png)$', '.webp'
    
    # Skip if WebP already exists and is newer
    if (Test-Path $webpPath) {
        $webpFile = Get-Item $webpPath
        if ($webpFile.LastWriteTime -gt $image.LastWriteTime) {
            Write-Host "[SKIP] $($image.Name) -> WebP already exists" -ForegroundColor Gray
            continue
        }
    }
    
    $originalSize = $image.Length
    
    # Convert to WebP
    try {
        & magick convert "$($image.FullName)" -quality $Quality "$webpPath"
        
        if (Test-Path $webpPath) {
            $webpSize = (Get-Item $webpPath).Length
            $savings = $originalSize - $webpSize
            $savingsPercent = [math]::Round(($savings / $originalSize) * 100, 1)
            
            $originalKB = [math]::Round($originalSize / 1KB, 1)
            $webpKB = [math]::Round($webpSize / 1KB, 1)
            
            Write-Host "[OK] $($image.Name)" -ForegroundColor Green
            Write-Host "     $originalKB KB -> $webpKB KB (saved $savingsPercent%)" -ForegroundColor White
            
            $convertedImages++
            $totalSavings += $savings
        }
    }
    catch {
        Write-Host "[ERROR] Failed to convert $($image.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Conversion Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Images converted: $convertedImages / $totalImages" -ForegroundColor White
Write-Host "Total space saved: $([math]::Round($totalSavings / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "WebP images will be automatically served to supported browsers" -ForegroundColor Cyan
Write-Host "using the .htaccess or web.config rules." -ForegroundColor Cyan
Write-Host ""
