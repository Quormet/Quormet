from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd
from datetime import datetime, timedelta

app = FastAPI()

class Payment(BaseModel):
    amount: int
    paid_at: str

class ForecastRequest(BaseModel):
    payments: List[Payment]
    months_ahead: int = 6

@app.get("/api/python/health")
def health_check():
    return {"status": "healthy", "engine": "python"}

@app.post("/api/python/forecast")
def get_forecast(request: ForecastRequest):
    if not request.payments:
        return {"forecast": [], "total_projected": 0}

    # Convert to DataFrame
    df = pd.DataFrame([p.dict() for p in request.payments])
    df['paid_at'] = pd.to_datetime(df['paid_at'])
    df = df.sort_values('paid_at')

    # Get monthly revenue
    monthly = df.resample('M', on='paid_at')['amount'].sum().reset_index()
    
    if len(monthly) < 2:
        # Not enough data for trend, assume average
        avg_revenue = df['amount'].sum() / (len(df) if len(df) > 0 else 1)
        # Assuming monthly recurrence if data is sparse
        avg_monthly = df['amount'].sum() / (len(monthly) if len(monthly) > 0 else 1)
    else:
        avg_monthly = monthly['amount'].mean()

    # Simple linear forecast (can be improved with Prophet later)
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
