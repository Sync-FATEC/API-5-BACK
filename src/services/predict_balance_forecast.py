import os
import sys
import json
import pickle
from datetime import datetime

import numpy as np


def load_artifacts(model_path: str, scaler_path: str):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Modelo não encontrado em: {model_path}")
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler não encontrado em: {scaler_path}")
    with open(model_path, 'rb') as fm:
        model = pickle.load(fm)
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    return model, scaler


def iterative_forecast(model, scaler, recent_values: list[float], months_ahead: int = 6):
    window = len(recent_values)
    recent_scaled = scaler.transform(np.array(recent_values).reshape(-1, 1)).flatten()
    seq = recent_scaled.copy()
    preds = []
    for _ in range(months_ahead):
        x = np.array(seq[-window:]).reshape(1, -1)
        y_scaled = float(model.predict(x)[0])
        y = float(scaler.inverse_transform(np.array([y_scaled]).reshape(-1, 1))[0][0])
        preds.append(y)
        seq = np.append(seq, y_scaled)
    return preds


def main():
    # Entrada: JSON via stdin com campos { series: number[], months: number }
    raw = sys.stdin.read()
    payload = json.loads(raw)
    series = payload.get('series')
    months = int(payload.get('months', 6))
    if not isinstance(series, list) or len(series) < 12:
        raise ValueError('Série deve conter ao menos 12 valores mensais')

    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.normpath(os.path.join(base_dir, '..', 'models'))
    model_path = os.path.join(models_dir, 'balance_forecast.pkl')
    scaler_path = os.path.join(models_dir, 'balance_forecast_scaler.pkl')

    model, scaler = load_artifacts(model_path, scaler_path)

    recent_values = series[-12:]
    preds = iterative_forecast(model, scaler, recent_values, months_ahead=months)

    # Construir labels de meses futuros
    start = datetime.now()
    labels = []
    year = start.year
    month = start.month
    for i in range(1, months + 1):
        m = month + i
        y = year + (m - 1) // 12
        mm = ((m - 1) % 12) + 1
        labels.append(f"{str(mm).zfill(2)}/{y}")

    print(json.dumps({
        'success': True,
        'labels': labels,
        'predictions': preds,
    }))


if __name__ == '__main__':
    main()