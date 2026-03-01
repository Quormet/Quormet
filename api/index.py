import os
import wolframalpha
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from datetime import datetime, timedelta

app = FastAPI()

# Wolfram Alpha Client Initialize
WOLFRAM_APP_ID = os.getenv("WOLFRAM_APP_ID")
wolfram_client = wolframalpha.Client(WOLFRAM_APP_ID) if WOLFRAM_APP_ID else None

class Payment(BaseModel):
    amount: int
    paid_at: str

class ForecastRequest(BaseModel):
    payments: List[Payment]
    months_ahead: int = 6

class WolframQuery(BaseModel):
    query: str
    context: Optional[str] = None

@app.get("/api/python/health")
def health_check():
    return {
        "status": "healthy", 
        "engine": "python",
        "wolfram_enabled": wolfram_client is not None
    }

@app.post("/api/python/forecast")
def get_forecast(request: ForecastRequest):
    if not request.payments:
        return {"forecast": [], "total_projected": 0}

    df = pd.DataFrame([p.dict() for p in request.payments])
    df['paid_at'] = pd.to_datetime(df['paid_at'])
    df = df.sort_values('paid_at')

    monthly = df.resample('M', on='paid_at')['amount'].sum().reset_index()
    
    if len(monthly) < 2:
        avg_monthly = df['amount'].sum() / (len(monthly) if len(monthly) > 0 else 1)
    else:
        avg_monthly = monthly['amount'].mean()

    forecast = []
    last_date = monthly['paid_at'].max() if not monthly.empty else datetime.now()
    
    for i in range(1, request.months_ahead + 1):
        next_date = last_date + timedelta(days=30 * i)
        forecast.append({
            "month": next_date.strftime("%B %Y"),
            "projected_amount": int(avg_monthly)
        })

    return {
        "forecast": forecast,
        "total_projected": int(avg_monthly * request.months_ahead),
        "confidence": "high" if len(monthly) > 3 else "medium"
    }

@app.post("/api/python/wolfram")
def query_wolfram(request: WolframQuery):
    if not wolfram_client:
        raise HTTPException(status_code=500, detail="Wolfram App ID not configured")
    
    try:
        res = wolfram_client.query(request.query)
        
        # Extract the primary result pod
        results = []
        for pod in res.pods:
            for subpod in pod.subpods:
                results.append({
                    "title": pod.title,
                    "text": subpod.plaintext,
                    "img": subpod.img
                })
        
        return {
            "query": request.query,
            "results": results[:5], # Return first 5 relevant pods
            "raw_result": next(res.results).text if hasattr(res, 'results') else "No direct answer"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
