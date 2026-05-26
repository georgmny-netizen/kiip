# ============================================================
# Copies renamed files from sources-png\img to sources-png\img2
# New format: tb-XXX-original-name.png (XXX = 3-digit physical page number)
# ============================================================

$srcDir = "D:\KIIP\site\sources-png\img"
$dstDir = "D:\KIIP\site\sources-png\img2"

if (!(Test-Path $dstDir)) {
    New-Item -ItemType Directory -Path $dstDir | Out-Null
    Write-Host "Created directory: $dstDir"
}

$count = 0

function Copy-Renamed($oldName, $pageNum) {
    $src = Join-Path $srcDir $oldName
    $prefix = $oldName.Substring(0, 2)          # "tb" or "wb"
    $rest   = $oldName.Substring(3)              # everything after the first dash
    $newName = "${prefix}-${pageNum}-${rest}"
    $dst = Join-Path $dstDir $newName
    if (Test-Path $src) {
        Copy-Item $src $dst -Force
        Write-Host "  $oldName  ->  $newName"
        $script:count++
    } else {
        Write-Warning "NOT FOUND: $oldName"
    }
}

# ── FRONT MATTER (pages without printed numbers get estimated values) ──────────
Write-Host "`n[FRONT MATTER]"
# Inside front cover (decorative icons, no printed number)
Copy-Renamed "tb-p1-div-front.png"   "000"
# Title page (no printed number)
Copy-Renamed "tb-front-title.png"    "001"
# Publisher foreword and intro pages (printed: 2-9)
2..9 | ForEach-Object {
    $p = $_.ToString("D2")
    Copy-Renamed "tb-front-p${p}.png" $_.ToString("D3")
}
# Part 1 divider and title (no printed numbers, before ch01 which is p.12)
Copy-Renamed "tb-p1-div.png"         "010"
Copy-Renamed "tb-p1-title.png"       "011"

# ── TEXTBOOK CHAPTERS ─────────────────────────────────────────────────────────
Write-Host "`n[TEXTBOOK CHAPTERS]"
$partStarts = @(
    @{ start = 12; chStart = 1  }   # Part 1: ch01–04
    @{ start = 34; chStart = 5  }   # Part 2: ch05–08
    @{ start = 56; chStart = 9  }   # Part 3: ch09–12
    @{ start = 78; chStart = 13 }   # Part 4: ch13–16
    @{ start = 100; chStart = 17 }  # Part 5: ch17–20
)

foreach ($part in $partStarts) {
    $startPage = $part.start
    $chStart   = $part.chStart
    for ($ch = $chStart; $ch -le ($chStart + 3); $ch++) {
        $chStr = $ch.ToString("D2")
        for ($p = 1; $p -le 4; $p++) {
            $pageNum = ($startPage + ($ch - $chStart) * 4 + ($p - 1)).ToString("D3")
            Copy-Renamed "tb-ch${chStr}-p${p}.png" $pageNum
        }
    }
}

# ── PART 1 END (pages 28-31) + PART 2 INTRO (pages 32-33) ────────────────────
Write-Host "`n[PART 1 END / PART 2 INTRO]"
Copy-Renamed "tb-p1-review.png"       "028"
Copy-Renamed "tb-p1-test.png"         "029"
Copy-Renamed "tb-p1-culture.png"      "030"
Copy-Renamed "tb-p1-culture-p2.png"   "031"
Copy-Renamed "tb-p2-div.png"          "032"   # no printed number
Copy-Renamed "tb-p2-title.png"        "033"   # no printed number

# ── PART 2 END (pages 50-53) + PART 3 INTRO (pages 54-55) ────────────────────
Write-Host "`n[PART 2 END / PART 3 INTRO]"
Copy-Renamed "tb-p2-review.png"       "050"
Copy-Renamed "tb-p2-test-p1.png"      "051"
Copy-Renamed "tb-p2-test-p2.png"      "052"
Copy-Renamed "tb-p2-test-p3.png"      "053"
Copy-Renamed "tb-p3-div.png"          "054"   # no printed number
Copy-Renamed "tb-p3-title.png"        "055"   # no printed number

# ── PART 3 END (pages 72-75) + PART 4 INTRO (pages 76-77) ────────────────────
Write-Host "`n[PART 3 END / PART 4 INTRO]"
Copy-Renamed "tb-p3-review.png"       "072"
Copy-Renamed "tb-p3-test.png"         "073"
Copy-Renamed "tb-p3-culture-p1.png"   "074"
Copy-Renamed "tb-p3-culture-p2.png"   "075"
Copy-Renamed "tb-p4-div.png"          "076"   # no printed number
Copy-Renamed "tb-p4-title.png"        "077"   # no printed number

# ── PART 4 END (pages 94-97) + PART 5 INTRO (pages 98-99) ────────────────────
Write-Host "`n[PART 4 END / PART 5 INTRO]"
Copy-Renamed "tb-p4-review.png"       "094"
Copy-Renamed "tb-p4-test.png"         "095"
Copy-Renamed "tb-p4-culture-p1.png"   "096"
Copy-Renamed "tb-p4-culture-p2.png"   "097"
Copy-Renamed "tb-blank.png"           "098"   # no printed number (blank facing page)
Copy-Renamed "tb-p5-title.png"        "099"   # no printed number

# ── PART 5 END (pages 116-119) ────────────────────────────────────────────────
Write-Host "`n[PART 5 END]"
Copy-Renamed "tb-p5-review.png"       "116"
Copy-Renamed "tb-p5-test.png"         "117"
Copy-Renamed "tb-p5-culture-p1.png"   "118"
Copy-Renamed "tb-p5-culture-p2.png"   "119"

# ── ANSWERS (pages 120-125) ───────────────────────────────────────────────────
Write-Host "`n[ANSWERS]"
1..6 | ForEach-Object {
    $pageNum = (119 + $_).ToString("D3")
    Copy-Renamed "tb-answers-p${_}.png" $pageNum
}

# ── INDEX / GLOSSARY (pages 126-127) ─────────────────────────────────────────
Write-Host "`n[INDEX]"
Copy-Renamed "tb-index-p1.png"  "126"
Copy-Renamed "tb-index-p2.png"  "127"

# ── BACK COVER (no printed number) ────────────────────────────────────────────
Write-Host "`n[BACK COVER]"
Copy-Renamed "tb-back-cover.png"  "128"   # estimated (after last index page)
Copy-Renamed "tb-front-cover.png" "000"   # front cover

# ── WORKBOOK FILES (wb-NNN -> physical page = 13 + NNN) ──────────────────────
Write-Host "`n[WORKBOOK]"
1..47 | ForEach-Object {
    $fileNum = $_.ToString("D3")
    $pageNum = (13 + $_).ToString("D3")
    Copy-Renamed "wb-${fileNum}.png" $pageNum
}

Write-Host "`nDone! Copied $count files to $dstDir"
