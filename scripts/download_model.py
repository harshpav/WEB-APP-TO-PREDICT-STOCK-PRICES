import os
import urllib.request

DEST = os.path.join('public', 'Stock_Predictions_Model.keras')


def download_model(dest=DEST):
    url = os.getenv('MODEL_URL')
    if not url:
        print("MODEL_URL not set; skipping model download.")
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    try:
        print(f"Downloading model from {url} ...")
        urllib.request.urlretrieve(url, dest)
        print("Model downloaded to", dest)
    except Exception as e:
        print("Failed to download model:", e)


if __name__ == '__main__':
    download_model()
