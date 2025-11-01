from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import numpy as np
import pandas as pd
from keras.models import load_model
import yfinance as yf
from datetime import datetime, timedelta
import os
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import uvicorn

app = FastAPI(title="Stock Price Predictor API")

# Load model once at startup
MODEL_PATH = os.path.join('public', 'Stock_Predictions_Model.keras')
try:
    model = load_model(MODEL_PATH)
except Exception as e:
    print(f"Warning: Could not load model from {MODEL_PATH}. Error: {e}")
    model = None

class StockRequest(BaseModel):
    symbol: str = Field(..., description="Stock symbol (e.g., 'GOOG', 'AAPL')")
    days_to_predict: int = Field(default=30, ge=1, le=365, description="Number of days to predict (1-365)")

class PredictionResponse(BaseModel):
    symbol: str
    predictions: list[float]
    dates: list[str]
    rmse: float | None = None
    mae: float | None = None
    r2: float | None = None

def prepare_stock_data(symbol: str, start_date: str = '2012-01-01'):
    """Fetch and prepare stock data for prediction."""
    try:
        data = yf.download(symbol, start=start_date, end=datetime.today().strftime('%Y-%m-%d'))
        if data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
        
        # Prepare data similar to Streamlit app
        data_train = data.Close[0:int(len(data)*0.80)]
        data_test = data.Close[int(len(data)*0.80):]
        
        scaler = MinMaxScaler(feature_range=(0,1))
        past_100_days = data_train.tail(100)
        data_test_full = pd.concat([past_100_days, data_test], ignore_index=True)
        data_test_scale = scaler.fit_transform(data_test_full.values.reshape(-1,1))
        
        return data_test_scale, scaler, data_test
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error preparing data for symbol {symbol}: {str(e)}"
        )

def predict_future(model, last_100_days, scaler, n_days=30):
    """Predict next n days of prices."""
    future_predictions = []
    current_batch = last_100_days.copy()
    
    for _ in range(n_days):
        current_pred = model.predict(current_batch.reshape(1,100,1), verbose=0)
        future_predictions.append(current_pred[0,0])
        current_batch = np.roll(current_batch, -1)
        current_batch[-1] = current_pred
        
    return scaler.inverse_transform(np.array(future_predictions).reshape(-1,1))

@app.get("/health")
def health_check():
    """Check if the API and model are healthy."""
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_stock(request: StockRequest):
    """Predict stock prices for the next n days."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    try:
        # Prepare data
        data_scale, scaler, test_data = prepare_stock_data(request.symbol)
        last_100_days = data_scale[-100:]
        
        # Generate predictions
        predictions = predict_future(
            model=model,
            last_100_days=last_100_days,
            scaler=scaler,
            n_days=request.days_to_predict
        )
        
        # Calculate metrics using recent test data
        y_true = test_data.values[-min(len(test_data), 30):]  # Last 30 days or less
        y_pred = predictions[:min(len(y_true), len(predictions))]
        
        rmse = float(np.sqrt(mean_squared_error(y_true, y_pred))) if len(y_true) > 0 else None
        mae = float(mean_absolute_error(y_true, y_pred)) if len(y_true) > 0 else None
        r2 = float(r2_score(y_true, y_pred)) if len(y_true) > 0 else None
        
        # Generate future dates
        today = datetime.today()
        future_dates = [
            (today + timedelta(days=i)).strftime('%Y-%m-%d')
            for i in range(1, request.days_to_predict + 1)
        ]
        
        return PredictionResponse(
            symbol=request.symbol,
            predictions=predictions.flatten().tolist(),
            dates=future_dates,
            rmse=rmse,
            mae=mae,
            r2=r2
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run with: uvicorn api:app --host 0.0.0.0 --port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)