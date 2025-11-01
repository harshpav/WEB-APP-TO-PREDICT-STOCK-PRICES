#!/usr/bin/env bash
set -euo pipefail

# If MODEL_URL is provided, download the model into public/ if it doesn't already exist.
MODEL_PATH="public/Stock_Predictions_Model.keras"
if [[ -n "${MODEL_URL:-}" ]]; then
  if [[ ! -f "$MODEL_PATH" ]]; then
    echo "Downloading model from $MODEL_URL to $MODEL_PATH"
    mkdir -p public
    curl -fsSL "$MODEL_URL" -o "$MODEL_PATH"
    echo "Model downloaded"
  else
    echo "Model already present at $MODEL_PATH"
  fi
else
  echo "No MODEL_URL provided. Ensure model is available at $MODEL_PATH (Git LFS or bundled)."
fi

# Start the FastAPI app using uvicorn
exec uvicorn api:app --host 0.0.0.0 --port 8000
