"""
AIMBodyPredictor
----------------
Loads saved artifacts (model / scaler / encoder) and exposes a single
.predict() method that mirrors the EXACT preprocessing done in the notebook.
"""
from __future__ import annotations

import numpy as np
import joblib
from tensorflow import keras


# Must match FEATURE_COLS order defined in the notebook
FEATURE_ORDER: list[str] = [
    "height", "weight", "age", "gender",
    "activity_level", "fitness_level", "goal",
    "muscle_mass", "body_fat_percentage",
    "body_fat_mass", "water", "protein_intake",
    "minerals", "bmi",
]


class AIMBodyPredictor:
    def __init__(
        self,
        model_path: str,
        scaler_path: str,
        encoder_path: str,
    ) -> None:
        self.model    = keras.models.load_model(model_path)
        self.scaler   = joblib.load(scaler_path)
        self.encoders = joblib.load(encoder_path)  # dict: {'gender': ..., 'goal': ...}

    # ------------------------------------------------------------------
    # Preprocessing  (identical to notebook Cell 4 + Cell 5)
    # ------------------------------------------------------------------
    def _preprocess(self, data: dict) -> np.ndarray:
        row = {k: v for k, v in data.items()}

        # Encode categorical columns exactly as LabelEncoders fitted during training
        row["gender"] = int(
            self.encoders["gender"].transform([str(row["gender"])])[0]
        )
        row["goal"] = int(
            self.encoders["goal"].transform([str(row["goal"])])[0]
        )

        # Build feature vector in the SAME column order
        arr = np.array(
            [[row[f] for f in FEATURE_ORDER]], dtype=np.float32
        )

        # Scale with the SAME fitted StandardScaler
        return self.scaler.transform(arr)

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------
    def predict(self, data: dict) -> dict:
        X   = self._preprocess(data)
        out = self.model.predict(X, verbose=0)[0]
        return {
            "calories": round(float(out[0]), 2),
            "protein":  round(float(out[1]), 2),
            "carbs":    round(float(out[2]), 2),
            "fat":      round(float(out[3]), 2),
        }
