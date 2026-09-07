Add-Type -AssemblyName System.Drawing

# Scene definitions: [name, bgTop, bgBottom, title]
$scenes = @(
    @{ Name="exterior";  Top="157,50,50";    Bottom="74,10,10";   Title="Exterior View";     Icon="house" },
    @{ Name="pool";      Top="0,119,190";    Bottom="0,60,100";   Title="Swimming Pool";     Icon="pool" },
    @{ Name="garden";    Top="85,150,60";    Bottom="30,70,20";   Title="Green Garden";      Icon="tree" },
    @{ Name="bedroom";   Top="239,200,130";  Bottom="160,120,70"; Title="Master Bedroom";    Icon="bed" },
    @{ Name="living";    Top="200,150,110";  Bottom="130,90,60";  Title="Living Room";       Icon="sofa" },
    @{ Name="bbq";       Top="210,120,70";   Bottom="120,60,30";  Title="BBQ & Fire Pit";    Icon="fire" },
    @{ Name="kitchen";   Top="190,160,110";  Bottom="110,90,50";  Title="Farmhouse Kitchen"; Icon="kitchen" }
)

$dir = Join-Path (Get-Location) "images"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

foreach ($scene in $scenes) {
    $w = 1200; $h = 800
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Sky gradient background
    $parts = $scene.Top -split ","
    $t1 = [System.Drawing.Color]::FromArgb([int]$parts[0], [int]$parts[1], [int]$parts[2])
    $parts = $scene.Bottom -split ","
    $t2 = [System.Drawing.Color]::FromArgb([int]$parts[0], [int]$parts[1], [int]$parts[2])
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $t1, $t2, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($brush, $rect)

    # Sun glow
    $sunBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 255, 244, 180))
    $g.FillEllipse($sunBrush, 950, 60, 140, 140)

    # Ground
    $groundBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 225, 195))
    $g.FillRectangle($groundBrush, 0, 620, $w, 180)

    # Simple sunburst rays top-left
    $rayPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), 3)
    for ($i = 0; $i -lt 16; $i++) {
        $angle = [Math]::PI * $i / 18
        $g.DrawLine($rayPen, 1000, 130, 1000 + [int](400 * [Math]::Cos($angle)), 130 + [int](400 * [Math]::Sin($angle)))
    }

    # Draw a house silhouette in center
    $housePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(230, 250, 250, 250), 12)
    $houseBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 250, 250, 250))

    # Walls
    $g.FillRectangle($houseBrush, 300, 350, 600, 300)
    # Roof
    $roofColor = [System.Drawing.Color]::FromArgb(220, 60, 30, 20)
    $roofBrush = New-Object System.Drawing.SolidBrush($roofColor)
    $pts = @(
        (New-Object System.Drawing.PointF([float](280), [float](350))),
        (New-Object System.Drawing.PointF([float](600), [float](200))),
        (New-Object System.Drawing.PointF([float](920), [float](350)))
    )
    $g.FillPolygon($roofBrush, [System.Drawing.PointF[]]$pts)

    # Door
    $doorBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 90, 55, 30))
    $g.FillRectangle($doorBrush, 545, 480, 110, 170)
    $g.DrawLine($housePen, 600, 480, 600, 650)

    # Windows
    $winBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 190, 230, 255))
    $g.FillRectangle($winBrush, 340, 430, 130, 110)
    $g.FillRectangle($winBrush, 730, 430, 130, 110)
    $g.DrawLine($housePen, 405, 430, 405, 540)
    $g.DrawLine($housePen, 340, 485, 470, 485)
    $g.DrawLine($housePen, 795, 430, 795, 540)
    $g.DrawLine($housePen, 730, 485, 860, 485)

    # Chimney
    $chimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 120, 90, 60))
    $g.FillRectangle($chimBrush, 800, 220, 70, 130)
    # Smoke
    $smokeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 255, 255, 255))
    $g.FillEllipse($smokeBrush, 810, 160, 60, 60)
    $g.FillEllipse($smokeBrush, 850, 110, 80, 80)
    $g.FillEllipse($smokeBrush, 900, 60, 90, 90)

    # Bushes
    $bushBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 50, 120, 50))
    $g.FillEllipse($bushBrush, 200, 580, 200, 80)
    $g.FillEllipse($bushBrush, 830, 580, 200, 80)

    # Sun/flower accents on ground
    $flowerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 200, 80))
    for ($i = 0; $i -lt 24; $i++) {
        $fx = 40 + ($i % 8) * 150
        $fy = 650 + (($i % 3) * 45)
        $g.FillEllipse($flowerBrush, $fx, $fy, 18, 18)
    }

    # Title text at bottom
    $font = New-Object System.Drawing.Font("Segoe UI", 48, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 0, 0, 0))
    $text = $scene.Title
    $textSize = $g.MeasureString($text, $font)
    $tx = ($w - $textSize.Width) / 2
    $ty = $h - 150
    $g.DrawString($text, $font, $shadowBrush, $tx + 3, $ty + 3)
    $g.DrawString($text, $font, $whiteBrush, $tx, $ty)

    # Subtitle
    $subFont = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $sub = "Serenity Farmhouse - Hyderabad (placeholder image)"
    $subSize = $g.MeasureString($sub, $subFont)
    $g.DrawString($sub, $subFont, $shadowBrush, [float](($w - $subSize.Width) / 2 + 2), [float]($ty + 70))
    $g.DrawString($sub, $subFont, $whiteBrush, [float](($w - $subSize.Width) / 2), [float]($ty + 68))

    $filePath = Join-Path $dir "$($scene.Name).jpg"
    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

    $g.Dispose()
    $brush.Dispose()
    $sunBrush.Dispose()
    $rayPen.Dispose()
    $housePen.Dispose()
    $houseBrush.Dispose()
    $roofBrush.Dispose()
    $doorBrush.Dispose()
    $winBrush.Dispose()
    $chimBrush.Dispose()
    $smokeBrush.Dispose()
    $bushBrush.Dispose()
    $flowerBrush.Dispose()
    $font.Dispose()
    $subFont.Dispose()
    $whiteBrush.Dispose()
    $shadowBrush.Dispose()
    $bmp.Dispose()
}

$count = (Get-ChildItem "$dir\*.jpg").Count
Write-Output "$count gallery images generated"