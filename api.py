from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from keras.models import load_model
import yfinance as yf
from datetime import datetime, timedelta
import os
from sklearn.preprocessing import MinMaxScaler
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
    symbol: str
    days_to_predict: int = 30

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
        
        return data_test_scale, scaler

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
        data_scale, scaler = prepare_stock_data(request.symbol)
        last_100_days = data_scale[-100:]
        
        # Generate predictions
        predictions = predict_future(
            model=model,
            last_100_days=last_100_days,
            scaler=scaler,
            n_days=request.days_to_predict
        )
        
        # Generate future dates
        today = datetime.today()
        future_dates = [
            (today + timedelta(days=i)).strftime('%Y-%m-%d')
            for i in range(1, request.days_to_predict + 1)
        ]
        
        return PredictionResponse(
            symbol=request.symbol,
            predictions=predictions.flatten().tolist(),
            dates=future_dates
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run with: uvicorn api:app --host 0.0.0.0 --port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)