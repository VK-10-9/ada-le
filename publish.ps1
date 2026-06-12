# ADA Lab Companion - Publishing Script
# This script guides you through deploying your modern Next.js Visualizer.

Clear-Host
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   ADA LAB COMPANION DEPLOYMENT ASSISTANT   " -ForegroundColor Cyan -BackGroundColor Black
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Run checks
Write-Host "[*] Checking Git installation..." -ForegroundColor Gray
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if ($gitCheck -eq $null) {
    Write-Host "[-] Git is not installed or not in PATH." -ForegroundColor Yellow
} else {
    Write-Host "[+] Git found: $(git --version)" -ForegroundColor Green
}

Write-Host "[*] Checking npm installation..." -ForegroundColor Gray
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCheck -eq $null) {
    Write-Host "[!] npm is required to run Next.js." -ForegroundColor Red
    Exit
} else {
    Write-Host "[+] npm found: $(npm -v)" -ForegroundColor Green
}
Write-Host ""

# 2. Deploy options
Write-Host "Select a publishing method:" -ForegroundColor Cyan
Write-Host "1. Vercel (Recommended - Instant, free cloud hosting, easiest Next.js deployment)" -ForegroundColor White
Write-Host "2. GitHub (Initialize a git repository, commit, and link to GitHub)" -ForegroundColor White
Write-Host "3. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1, 2, or 3)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "   DEPLOYING TO VERCEL CLOUD (ZERO CONFIG)      " -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "We will run the Vercel CLI. Vercel will build and host your app for free." -ForegroundColor Gray
    Write-Host "If this is your first time, it will prompt you to log in in your browser." -ForegroundColor Gray
    Write-Host ""
    
    # Run vercel CLI
    npx vercel
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "   INITIALIZING GIT REPOSITORY                  " -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    
    if (Test-Path .git) {
        Write-Host "[!] Git repository already initialized." -ForegroundColor Yellow
    } else {
        Write-Host "[*] Initializing new Git repository..." -ForegroundColor Gray
        git init
        Write-Host "[+] Git repository initialized." -ForegroundColor Green
    }
    
    Write-Host "[*] Adding files..." -ForegroundColor Gray
    git add .
    
    Write-Host "[*] Committing code..." -ForegroundColor Gray
    git commit -m "Initial commit of ADA Lab Companion Next.js app"
    Write-Host "[+] Code committed successfully!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "What to do next:" -ForegroundColor Cyan
    Write-Host "1. Create a new repository on GitHub (https://github.com/new)" -ForegroundColor White
    Write-Host "2. Copy the Git URL (e.g. https://github.com/username/repo-name.git)" -ForegroundColor White
    Write-Host "3. Link it and push your code by running:" -ForegroundColor White
    Write-Host "   git remote add origin <your-copied-git-url>" -ForegroundColor Gray
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Go to Vercel (https://vercel.com) and import the repository for automated CD!" -ForegroundColor Green
    Write-Host ""

} else {
    Write-Host "Exiting Assistant. You can run 'npm run dev' to test locally." -ForegroundColor Yellow
}
