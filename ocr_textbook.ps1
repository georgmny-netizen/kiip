# OCR all tb-*.png files using Windows.Media.Ocr (Korean language)
# Output: D:\KIIP\site\textbook_content.md

Add-Type -AssemblyName System.Runtime.WindowsRuntime

$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType=WindowsRuntime]

# Generic AsTask for IAsyncOperation<T> — must use IsGenericMethodDefinition
$_asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethodDefinition -and $_.GetParameters().Count -eq 1 } |
    Select-Object -First 1

function AwaitOp($op, [System.Type]$resultType) {
    $task = $_asTaskGeneric.MakeGenericMethod($resultType).Invoke($null, @($op))
    $task.Wait(-1) | Out-Null
    return $task.Result
}

# Pick Korean language (ko)
$langs = [Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages
$korean = $langs | Where-Object { $_.LanguageTag -like 'ko*' } | Select-Object -First 1
if (-not $korean) {
    Write-Warning "Korean OCR language pack not found. Trying default engine."
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
} else {
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($korean)
}
if (-not $engine) {
    throw "Could not create OCR engine. Please install Korean language pack in Windows Settings."
}

Write-Host "OCR engine ready. Language: $($engine.RecognizerLanguage.LanguageTag)"

$files = Get-ChildItem "D:\KIIP\site\sources-png\tb-*.png" | Sort-Object Name
$outputPath = "D:\KIIP\site\textbook_content.md"
$total = $files.Count

$sb = [System.Text.StringBuilder]::new()
$null = $sb.AppendLine("# KIIP Level 5 — Учебник (OCR)")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("> Автоматически извлечено из tb-001.png — tb-$(($files[-1].Name -replace 'tb-','') -replace '.png','').png")
$null = $sb.AppendLine("")

$i = 0
foreach ($file in $files) {
    $i++
    Write-Host "[$i/$total] $($file.Name)"

    try {
        # Load file as StorageFile
        $storageFile = AwaitOp (
            [Windows.Storage.StorageFile]::GetFileFromPathAsync($file.FullName)
        ) ([Windows.Storage.StorageFile])

        # Open stream
        $stream = AwaitOp (
            $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)
        ) ([Windows.Storage.Streams.IRandomAccessStream])

        # Decode bitmap
        $decoder = AwaitOp (
            [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
        ) ([Windows.Graphics.Imaging.BitmapDecoder])

        $bitmap = AwaitOp (
            $decoder.GetSoftwareBitmapAsync()
        ) ([Windows.Graphics.Imaging.SoftwareBitmap])

        # Run OCR
        $result = AwaitOp (
            $engine.RecognizeAsync($bitmap)
        ) ([Windows.Media.Ocr.OcrResult])

        $text = $result.Text.Trim()

        $null = $sb.AppendLine("---")
        $null = $sb.AppendLine("")
        $null = $sb.AppendLine("## $($file.Name)")
        $null = $sb.AppendLine("")
        if ($text) {
            $null = $sb.AppendLine($text)
        } else {
            $null = $sb.AppendLine("_(страница пустая или не распознана)_")
        }
        $null = $sb.AppendLine("")

        $stream.Dispose()
    }
    catch {
        $null = $sb.AppendLine("---")
        $null = $sb.AppendLine("")
        $null = $sb.AppendLine("## $($file.Name)")
        $null = $sb.AppendLine("")
        $null = $sb.AppendLine("_(Ошибка OCR: $($_.Exception.Message))_")
        $null = $sb.AppendLine("")
        Write-Warning "Error on $($file.Name): $($_.Exception.Message)"
    }
}

[System.IO.File]::WriteAllText($outputPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host ""
Write-Host "Done! Saved to: $outputPath"
Write-Host "Total pages processed: $total"
