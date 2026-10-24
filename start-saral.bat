@echo off
echo ==========================================================
echo  Starting Saral: Your Electricity & Water, Explained
echo ==========================================================
start "Saral Backend" cmd /k "py -3.13 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"
cd frontend
npm run dev
