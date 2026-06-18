"""
Preprocessing pipeline for the Nutrition Model.
Handles encoding, scaling, and feature completion.

FIXES v3:
  - Gender was computed but never added to feature array → FIXED
  - Added lbm + tdee to NUMERIC_COLS (19 features)
  - Input dim: 19 numeric + 1 gender + 3 goal + 12 disease = 35
"""

import numpy as np
import pandas as pd
import joblib
import os
from sklearn.preprocessing import StandardScaler, OneHotEncoder


class NutritionPreprocessor:
    """
    Handles all preprocessing for the nutrition model.

    Feature layout (35 total):
      [0:19]  numeric scaled   → 19 features
      [19]    gender binary    → 1 feature   (Male=1, Female=0)
      [20:23] goal one-hot     → 3 features
      [23:35] disease one-hot  → 12 features
    """

    NUMERIC_COLS = [
        'height', 'weight', 'age', 'activity_level', 'fitness_level',
        'muscle_mass', 'body_fat_percentage', 'body_fat_mass', 'water',
        'protein_intake', 'minerals', 'visceral_fat_level', 'waist_hip_ratio',
        'trunk_fat_mass', 'trunk_lean_mass', 'inbody_score', 'bmr',
        'lbm', 'tdee', 'bmi',                # ← bmi added
    ]

    TARGET_COLS = ['calories', 'protein', 'carbs', 'fat']

    VALID_GOALS = ['lose_fat', 'maintain', 'gain_muscle']
    VALID_DISEASES = [
        'healthy', 'overweight', 'insulin_resistance', 'underweight',
        'diabetes_type2', 'hypertension', 'obesity', 'fatty_liver',
        'heart_disease', 'hypothyroidism', 'kidney_disease', 'pcos',
    ]

    ACTIVITY_MULTIPLIERS = {1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9}

    def __init__(self):
        self.scaler           = StandardScaler()
        self.goal_encoder     = OneHotEncoder(sparse_output=False, handle_unknown='ignore',
                                              categories=[self.VALID_GOALS])
        self.disease_encoder  = OneHotEncoder(sparse_output=False, handle_unknown='ignore',
                                              categories=[self.VALID_DISEASES])
        self.fitted = False

    # ─────────────────────────────────────────────────────
    # Feature completion
    # ─────────────────────────────────────────────────────
    def complete_features(self, data: dict) -> dict:
        """
        Calculate missing features from available InBody data.
        Priority: real OCR data > calculated > defaults.
        """
        d = data.copy()

        # ── body_fat_mass ──
        if d.get('body_fat_mass') is None:
            if d.get('body_fat_percentage') and d.get('weight'):
                d['body_fat_mass'] = round(d['weight'] * d['body_fat_percentage'] / 100, 2)

        # ── LBM ──
        lbm = None
        if d.get('weight') and d.get('body_fat_mass') is not None:
            lbm = round(d['weight'] - d['body_fat_mass'], 2)
            d['lbm'] = lbm

        # ── Water (~73% of LBM) ──
        if d.get('water') is None and lbm:
            d['water'] = round(lbm * 0.73, 2)

        # ── Protein intake (~20% of LBM) ──
        if d.get('protein_intake') is None and lbm:
            d['protein_intake'] = round(lbm * 0.20, 2)

        # ── Minerals (~7% of LBM) ──
        if d.get('minerals') is None and lbm:
            d['minerals'] = round(lbm * 0.07, 2)

        # ── BMR (Mifflin-St Jeor) ──
        if d.get('bmr') is None:
            if all(d.get(k) for k in ['weight', 'height', 'age', 'gender']):
                h_cm = d['height'] * 100
                if d['gender'] == 'Male':
                    d['bmr'] = round(10*d['weight'] + 6.25*h_cm - 5*d['age'] + 5,    2)
                else:
                    d['bmr'] = round(10*d['weight'] + 6.25*h_cm - 5*d['age'] - 161,  2)

        # ── BMI ──
        if d.get('bmi') is None:
            if d.get('weight') and d.get('height'):
                d['bmi'] = round(d['weight'] / (d['height'] ** 2), 2)

        # ── TDEE ──
        if d.get('tdee') is None:
            if d.get('bmr') and d.get('activity_level'):
                mult = self.ACTIVITY_MULTIPLIERS.get(int(d['activity_level']), 1.55)
                d['tdee'] = round(d['bmr'] * mult, 2)

        # ── Visceral fat (estimate) ──
        if d.get('visceral_fat_level') is None and d.get('body_fat_percentage'):
            bf  = d['body_fat_percentage']
            age = d.get('age', 35)
            est = (bf - 10) / 4 + age / 20
            d['visceral_fat_level'] = int(np.clip(round(est), 1, 17))

        # ── Waist-hip ratio (estimate) ──
        if d.get('waist_hip_ratio') is None:
            if d.get('weight') and d.get('height'):
                bmi    = d['weight'] / (d['height'] ** 2)
                offset = 0.08 if d.get('gender') == 'Male' else 0.0
                d['waist_hip_ratio'] = round(np.clip(0.73 + bmi*0.005 + offset, 0.65, 1.10), 3)

        # ── Trunk fat mass (~55% of BFM) ──
        if d.get('trunk_fat_mass') is None and d.get('body_fat_mass'):
            d['trunk_fat_mass'] = round(d['body_fat_mass'] * 0.55, 2)

        # ── Trunk lean mass (~50% of LBM) ──
        if d.get('trunk_lean_mass') is None and lbm:
            d['trunk_lean_mass'] = round(lbm * 0.50, 2)

        # ── InBody score (estimate) ──
        if d.get('inbody_score') is None:
            if d.get('visceral_fat_level') and d.get('body_fat_percentage'):
                bf  = d['body_fat_percentage']
                vfl = d['visceral_fat_level']
                d['inbody_score'] = int(np.clip(round(100 - vfl*3 - (bf-15)*0.8), 40, 100))

        # ── Fitness level (from BF%) ──
        if d.get('fitness_level') is None and d.get('body_fat_percentage'):
            bf  = d['body_fat_percentage']
            fit = -bf / 20 + 2.5
            d['fitness_level'] = int(np.clip(round(fit), 1, 3))

        # ── User input defaults ──
        for key, val in [('activity_level', 3), ('fitness_level', 2),
                         ('goal', 'maintain'), ('disease_condition', 'healthy')]:
            if d.get(key) is None:
                d[key] = val

        # ── Numeric safety defaults ──
        defaults = {
            'height': 1.70, 'weight': 70, 'age': 35,
            'activity_level': 3, 'fitness_level': 2,
            'muscle_mass': 28, 'body_fat_percentage': 25,
            'body_fat_mass': 17.5, 'water': 38.5,
            'protein_intake': 10.5, 'minerals': 3.5,
            'visceral_fat_level': 6, 'waist_hip_ratio': 0.85,
            'trunk_fat_mass': 9.6, 'trunk_lean_mass': 26.3,
            'inbody_score': 72, 'bmr': 1500,
            'lbm': 52.5, 'tdee': 2325.0, 'bmi': 24.2,  # ← bmi added
        }
        for key, val in defaults.items():
            if d.get(key) is None:
                d[key] = val

        return d

    # ─────────────────────────────────────────────────────
    # Fit / Transform
    # ─────────────────────────────────────────────────────
    def fit(self, df: pd.DataFrame):
        """Fit encoders and scaler on training data."""
        self.scaler.fit(df[self.NUMERIC_COLS])
        self.goal_encoder.fit(df[['goal']])
        self.disease_encoder.fit(df[['disease_condition']])
        self.fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Transform dataframe → model input array (35 features).

        Layout:
          [0:19]  numeric scaled
          [19]    gender binary  ← was missing before, now FIXED
          [20:23] goal one-hot
          [23:35] disease one-hot
        """
        if not self.fitted:
            raise RuntimeError("Call fit() before transform().")

        # 1. Numeric (19)
        numeric_scaled = self.scaler.transform(df[self.NUMERIC_COLS])

        # 2. Gender binary (1)  ← FIXED: now included
        gender_encoded = (df['gender'] == 'Male').astype(int).values.reshape(-1, 1)

        # 3. Goal one-hot (3)
        goal_encoded = self.goal_encoder.transform(df[['goal']])

        # 4. Disease one-hot (12)
        disease_encoded = self.disease_encoder.transform(df[['disease_condition']])

        # Concatenate: 19 + 1 + 3 + 12 = 35
        features = np.hstack([
            numeric_scaled,
            gender_encoded,
            goal_encoded,
            disease_encoded,
        ])

        return features.astype(np.float32)

    def transform_single(self, data: dict) -> np.ndarray:
        """Transform a single dict → model input."""
        data = self.complete_features(data)
        return self.transform(pd.DataFrame([data]))

    @staticmethod
    def get_input_dim() -> int:
        """Total input features: 20 numeric + 1 gender + 3 goal + 12 disease = 36."""
        return 36

    # ─────────────────────────────────────────────────────
    # Save / Load
    # ─────────────────────────────────────────────────────
    def save(self, path: str):
        """Save all preprocessor artifacts."""
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.scaler,          os.path.join(path, 'scaler.pkl'))
        joblib.dump(self.goal_encoder,    os.path.join(path, 'goal_encoder.pkl'))
        joblib.dump(self.disease_encoder, os.path.join(path, 'disease_encoder.pkl'))
        joblib.dump({
            'numeric_cols':    self.NUMERIC_COLS,
            'target_cols':     self.TARGET_COLS,
            'valid_goals':     self.VALID_GOALS,
            'valid_diseases':  self.VALID_DISEASES,
            'input_dim':       self.get_input_dim(),
            'fitted':          self.fitted,
        }, os.path.join(path, 'preprocessor_config.pkl'))

    def load(self, path: str):
        """Load all preprocessor artifacts."""
        self.scaler          = joblib.load(os.path.join(path, 'scaler.pkl'))
        self.goal_encoder    = joblib.load(os.path.join(path, 'goal_encoder.pkl'))
        self.disease_encoder = joblib.load(os.path.join(path, 'disease_encoder.pkl'))
        cfg = joblib.load(os.path.join(path, 'preprocessor_config.pkl'))
        self.NUMERIC_COLS   = cfg['numeric_cols']
        self.TARGET_COLS    = cfg['target_cols']
        self.VALID_GOALS    = cfg['valid_goals']
        self.VALID_DISEASES = cfg['valid_diseases']
        self.fitted         = cfg['fitted']
        return self


# ─────────────────────────────────────────────────────
# Quick test
# ─────────────────────────────────────────────────────
if __name__ == "__main__":
    proc = NutritionPreprocessor()
    print(f"Input dimension: {proc.get_input_dim()}")

    test_data = {
        'height': 1.75, 'weight': 80, 'age': 30, 'gender': 'Male',
        'body_fat_percentage': 22.5, 'muscle_mass': 35.0,
        'visceral_fat_level': 6, 'waist_hip_ratio': 0.85,
        'trunk_fat_mass': 12.0, 'trunk_lean_mass': 28.0,
        'inbody_score': 75, 'goal': 'lose_fat',
        'disease_condition': 'healthy', 'activity_level': 3,
    }
    completed = proc.complete_features(test_data)
    print("\nCompleted features:")
    for k, v in completed.items():
        print(f"  {k}: {v}")
