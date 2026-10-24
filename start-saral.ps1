# Start Saral Backend & Frontend concurrently
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Saral: Your Electricity & Water, Explained " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Python FastAPI backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "py -3.13 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start React Vite frontend
Set-Location frontend
npm run dev
