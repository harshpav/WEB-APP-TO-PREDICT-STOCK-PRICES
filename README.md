# Stock Price Prediction Web

A web frontend for stock price prediction built with Vite, React and TypeScript. The repo contains a React UI (in `src/`) and an optional Python model/demo under `public/`.

## Project overview

- Frontend: Vite + React + TypeScript
- UI: shadcn-ui + Tailwind CSS
- Optional Python model and demo files: `public/app.py`, `public/Stock_model_creation.py`, and a saved model `public/Stock_Predictions_Model.keras`

## Prerequisites

- Node.js (v16+ recommended) and npm
- (Optional) Python 3.8+ if you plan to run the included Python model/demo

## Local development

### Frontend setup

1. Install Node.js dependencies:

```sh
npm install
```

2. Start the frontend dev server:

```sh
npm run dev
```

The frontend will be available at http://localhost:8080

### Backend setup (Python)

1. Create a Python virtual environment (recommended):
```sh
python -m venv venv
.\venv\Scripts\activate  # On Windows
```

2. Install Python dependencies:
```sh
pip install -r requirements.txt
```

3. Start the Streamlit backend:
```sh
streamlit run public/app.py
```

The backend will open in your browser (usually at http://localhost:8501)

## Running the optional Python demo

There is a small Python demo and a saved model in `public/`. If you want to run it:

1. Create and activate a Python virtual environment (optional but recommended).
2. Install any required Python packages (not included in this repo). If you have your own requirements file, use it; otherwise install Flask and other dependencies you need.
3. Run the demo script (example):

```sh
python public/app.py
```

Note: This README does not include a requirements.txt—add one if you decide to run the Python demo.

## Build for production

```sh
npm run build
npm run preview
```

## Deployment

This project can be deployed to most static hosting platforms that support Vite builds (Vercel, Netlify, etc.). Build the project with `npm run build` and follow your host's instructions for deploying a static site. If you also need the Python demo, deploy it separately (for example using a small Flask app host).

## Contributing

Contributions are welcome. Open an issue or submit a pull request with improvements.

## License

Add a license file or include licensing information here.
