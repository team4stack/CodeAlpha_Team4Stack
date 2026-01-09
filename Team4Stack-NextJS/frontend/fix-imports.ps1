# PowerShell script to fix import paths in Next.js migration
# Run this from the frontend directory

Write-Host "Starting import path fixes..." -ForegroundColor Green

# Fix import.meta.env to process.env.NEXT_PUBLIC_*
Write-Host "Fixing environment variables..." -ForegroundColor Yellow
Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Replace import.meta.env.VITE_* with process.env.NEXT_PUBLIC_*
    $content = $content -replace 'import\.meta\.env\.VITE_([A-Z_]+)', 'process.env.NEXT_PUBLIC_$1'
    $content = $content -replace 'import\.meta\.env\.DEV', 'process.env.NODE_ENV === ''development'''
    $content = $content -replace 'import\.meta\.env\.PROD', 'process.env.NODE_ENV === ''production'''
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($_.FullName)" -ForegroundColor Cyan
    }
}

# Fix supabaseClient imports
Write-Host "Fixing Supabase client imports..." -ForegroundColor Yellow
Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Replace various supabaseClient import patterns
    $content = $content -replace "from ['""]\.\.\/utils\/supabaseClient['""]", "from '@/lib/supabase/client'"
    $content = $content -replace "from ['""]\.\.\/\.\.\/utils\/supabaseClient['""]", "from '@/lib/supabase/client'"
    $content = $content -replace "from ['""]\.\.\/\.\.\/\.\.\/utils\/supabaseClient['""]", "from '@/lib/supabase/client'"
    $content = $content -replace "from ['""]\.\.\/\.\.\/\.\.\/\.\.\/utils\/supabaseClient['""]", "from '@/lib/supabase/client'"
    $content = $content -replace "from ['""]@\/utils\/supabaseClient['""]", "from '@/lib/supabase/client'"
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($_.FullName)" -ForegroundColor Cyan
    }
}

# Fix context imports
Write-Host "Fixing context imports..." -ForegroundColor Yellow
Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Replace context imports
    $content = $content -replace "from ['""]\.\.\/context\/ThemeContext['""]", "from '@/contexts/ThemeContext'"
    $content = $content -replace "from ['""]\.\.\/\.\.\/context\/ThemeContext['""]", "from '@/contexts/ThemeContext'"
    $content = $content -replace "from ['""]\.\.\/context\/AuthContext['""]", "from '@/contexts/AuthContext'"
    $content = $content -replace "from ['""]\.\.\/\.\.\/context\/AuthContext['""]", "from '@/contexts/AuthContext'"
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($_.FullName)" -ForegroundColor Cyan
    }
}

Write-Host "Import fixes completed!" -ForegroundColor Green
