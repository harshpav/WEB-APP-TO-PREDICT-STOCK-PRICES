# Deployment guide

This repository contains a Vite/React frontend and a Python FastAPI backend that serves a Keras model.

Overview
- Frontend: build with `npm run build`, output in `dist/`. Deploy to Vercel (recommended for static frontend).
- Backend: FastAPI app (`api.py`). Containerize with the provided `Dockerfile` and deploy to Render (or Cloud Run).

Frontend (Vercel)
1. Go to https://vercel.com and create a new project by importing your GitHub repository.
2. Framework preset: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add any environment variables needed by the frontend under project Settings > Environment Variables.

Backend (Render)
Option A (recommended): Connect the repository directly in Render and let Render build the Dockerfile. Steps:
1. Create a new Web Service on Render and connect your GitHub repo.
2. Select "Docker" as the environment (Render will use the provided `Dockerfile`).
3. Add environment variables under the service settings:
   - `MODEL_URL` (optional): a URL where the model artifact can be downloaded at container start. If not set, make sure the model is available in the repo via Git LFS or included in the image.
4. Deploy. Render will build and run the container. You can also enable automatic deploys from `main`.

Option B (GitHub Actions -> Render deploy trigger):
1. Add the following repository secrets in GitHub: `RENDER_SERVICE_ID` and `RENDER_API_KEY`.
2. The included GitHub Actions workflow `.github/workflows/deploy-backend.yml` will trigger a Render deploy when you push to `main`.

Model artifact handling
- Small / medium models can be tracked with Git LFS (we configured LFS for `public/Stock_Predictions_Model.keras`). Ensure LFS objects are present in the Render build environment. If Render builds from your repo, LFS objects are pulled automatically when Render builds the repo.
- For larger models or to avoid Git LFS, host the model on cloud storage (S3/GCS) and provide `MODEL_URL` to the service; the container will download the model at startup.

Running locally
- Frontend dev: `npm run dev` (runs on http://localhost:8080)
- Backend dev: create & activate a Python 3.11 venv and install dependencies. Example:

```powershell
py -3.11 -m venv .venv-py311
.\.venv-py311\Scripts\activate.ps1
pip install -r requirements.txt
uvicorn api:app --reload
```

Notes & next steps
- If you want a single deployable artifact (frontend + backend), containerize both and use a single cloud service or split frontend to Vercel and backend to Render/Cloud Run.
- If you want, I can also add a GitHub Actions workflow that builds and pushes a Docker image to Google Cloud Run (requires GCP service account keys), or to GitHub Container Registry.
