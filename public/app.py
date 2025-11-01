import numpy as np
import pandas as pd
import yfinance as yf
from keras.models import load_model
import streamlit as st
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Load Trained Model
model = load_model(r"C:\Users\harsh\Downloads\Stock_Market_Prediction_ML\Stock Predictions Model.keras")

# Streamlit App Setup
st.set_page_config(page_title='Stock Market Predictor', layout='wide')
st.header('📈 Stock Market Predictor')

# User Input
stock = st.text_input('Enter Stock Symbol', 'GOOG')
start = '2012-01-01'
end = datetime.today().strftime('%Y-%m-%d')

# Fetch Data
data = yf.download(stock, start, end)
st.subheader('Stock Data')
st.write(data)

# Train/Test Split
data_train = pd.DataFrame(data.Close[0:int(len(data)*0.80)])
data_test = pd.DataFrame(data.Close[int(len(data)*0.80):])

scaler = MinMaxScaler(feature_range=(0,1))
pas_100_days = data_train.tail(100)
data_test_full = pd.concat([pas_100_days, data_test], ignore_index=True)
data_test_scale = scaler.fit_transform(data_test_full)

# Moving Averages
st.subheader('Price vs MA50')
ma_50_days = data.Close.rolling(50).mean()
fig1 = plt.figure(figsize=(8,6))
plt.plot(ma_50_days, 'r')
plt.plot(data.Close, 'g')
st.pyplot(fig1)

st.subheader('Price vs MA50 vs MA100')
ma_100_days = data.Close.rolling(100).mean()
fig2 = plt.figure(figsize=(8,6))
plt.plot(ma_50_days, 'r')
plt.plot(ma_100_days, 'b')
plt.plot(data.Close, 'g')
st.pyplot(fig2)

st.subheader('Price vs MA100 vs MA200')
ma_200_days = data.Close.rolling(200).mean()
fig3 = plt.figure(figsize=(8,6))
plt.plot(ma_100_days, 'r')
plt.plot(ma_200_days, 'b')
plt.plot(data.Close, 'g')
st.pyplot(fig3)

# Prepare Test Data
x, y = [], []
for i in range(100, data_test_scale.shape[0]):
    x.append(data_test_scale[i-100:i])
    y.append(data_test_scale[i,0])
x, y = np.array(x), np.array(y)

# Predictions
predict = model.predict(x)
predict = scaler.inverse_transform(predict)
y = scaler.inverse_transform(y.reshape(-1,1))

# Efficiency Metrics
rmse = np.sqrt(mean_squared_error(y, predict))
mae = mean_absolute_error(y, predict)
r2 = r2_score(y, predict)
st.subheader('Model Efficiency Metrics')
st.write(f"**RMSE:** {rmse:.2f}")
st.write(f"**MAE:** {mae:.2f}")
st.write(f"**R² Score:** {r2:.2f}")

# Plot Results
st.subheader('Original Price vs Predicted Price')
fig4 = plt.figure(figsize=(10,6))
plt.plot(y, 'g', label='Original Price')
plt.plot(predict, 'r', label='Predicted Price')
plt.xlabel('Time')
plt.ylabel('Price')
plt.legend()
st.pyplot(fig4)

# ---------- Future 30 Days Prediction ----------
st.subheader("📊 Next 30 Days Forecast")

last_100_days = data_test_full[-100:].values
last_100_scaled = scaler.transform(last_100_days)

# keep only floats
future_input = list(last_100_scaled.flatten())

predicted_prices = []
for _ in range(30):  # next 30 days
    x_future = np.array(future_input[-100:]).reshape(1,100,1)
    future_price = model.predict(x_future, verbose=0)
    predicted_prices.append(future_price[0,0])  # store scalar
    future_input.append(future_price[0,0])      # append scalar

predicted_prices = np.array(predicted_prices).reshape(-1,1)
predicted_prices = scaler.inverse_transform(predicted_prices)

fig5 = plt.figure(figsize=(10,6))
plt.plot(predicted_prices, 'r', label="Predicted Future Price (30 days)")
plt.xlabel("Days Ahead")
plt.ylabel("Price")
plt.legend()
st.pyplot(fig5)

# Save the Streamlit app
st.write("Model loaded and ready for predictions.")
