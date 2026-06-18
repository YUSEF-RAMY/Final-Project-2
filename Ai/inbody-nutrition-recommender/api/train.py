"""
Training script for the Nutrition Model.
Trains on fitness_dataset_v10_clinical.csv and saves model + preprocessor artifacts.

FIXES v3:
  - Uses fitness_dataset_v10_clinical.csv (with lbm + tdee columns)
  - Goal balancing via oversampling
  - input_dim validated at runtime
  - Better per-target evaluation report
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
import os
import json
from datetime import datetime

from model import build_nutrition_model, compile_model
from preprocessing import NutritionPreprocessor

# ─────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────
DATA_PATH   = os.path.join(os.path.dirname(__file__), '..', 'data', 'fitness_dataset_v10_clinical.csv')
SAVE_DIR    = os.path.join(os.path.dirname(__file__), 'saved_model')
EPOCHS      = 50
BATCH_SIZE  = 256
PATIENCE    = 20
RANDOM_SEED = 42

tf.random.set_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)


# ─────────────────────────────────────────────────────
# Data loading
# ─────────────────────────────────────────────────────
def load_data(data_path: str) -> pd.DataFrame:
    df = pd.read_csv(data_path)
    print(f"Dataset loaded: {df.shape}")
    print(f"  Diseases : {df['disease_condition'].nunique()}")
    print(f"  Goals    : {df['goal'].value_counts().to_dict()}")
    print(f"  Nulls    : {df.isnull().sum().sum()}")

    # Validate required columns
    required = NutritionPreprocessor.NUMERIC_COLS + \
               ['gender', 'goal', 'disease_condition'] + \
               NutritionPreprocessor.TARGET_COLS
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")

    return df


# ─────────────────────────────────────────────────────
# Goal balancing
# ─────────────────────────────────────────────────────
def balance_goals(df: pd.DataFrame, seed: int = RANDOM_SEED) -> pd.DataFrame:
    """
    Oversample minority goal classes to match the majority class.
    Ensures the model learns all 3 goals equally.
    """
    max_count = df['goal'].value_counts().max()
    parts = []
    for goal in df['goal'].unique():
        subset = df[df['goal'] == goal]
        if len(subset) < max_count:
            subset = subset.sample(max_count, replace=True, random_state=seed)
        parts.append(subset)
    balanced = pd.concat(parts).sample(frac=1, random_state=seed).reset_index(drop=True)
    print(f"\nAfter goal balancing: {balanced.shape}")
    print(f"  Goal distribution: {balanced['goal'].value_counts().to_dict()}")
    return balanced


# ─────────────────────────────────────────────────────
# Split
# ─────────────────────────────────────────────────────
def split_data(df: pd.DataFrame, test_size: float = 0.15, val_size: float = 0.10):
    from sklearn.model_selection import train_test_split

    train_val, test = train_test_split(
        df, test_size=test_size, random_state=RANDOM_SEED,
        stratify=df['disease_condition'],
    )
    train, val = train_test_split(
        train_val,
        test_size=val_size / (1 - test_size),
        random_state=RANDOM_SEED,
        stratify=train_val['disease_condition'],
    )
    print(f"\nData split:")
    print(f"  Train : {len(train):>7,}")
    print(f"  Val   : {len(val):>7,}")
    print(f"  Test  : {len(test):>7,}")
    return train, val, test


# ─────────────────────────────────────────────────────
# Feature preparation
# ─────────────────────────────────────────────────────
def prepare_features(df: pd.DataFrame,
                     preprocessor: NutritionPreprocessor,
                     fit: bool = False):
    if fit:
        preprocessor.fit(df)

    X = preprocessor.transform(df)
    y = {
        'calories': df['calories'].values.astype(np.float32),
        'protein':  df['protein'].values.astype(np.float32),
        'carbs':    df['carbs'].values.astype(np.float32),
        'fat':      df['fat'].values.astype(np.float32),
    }
    return X, y


# ─────────────────────────────────────────────────────
# Training
# ─────────────────────────────────────────────────────
def train_model(train_df, val_df, preprocessor):
    X_train, y_train = prepare_features(train_df, preprocessor, fit=True)
    X_val,   y_val   = prepare_features(val_df,   preprocessor, fit=False)

    input_dim = X_train.shape[1]
    print(f"\nInput dimension : {input_dim}")
    assert input_dim == NutritionPreprocessor.get_input_dim(), \
        f"Expected {NutritionPreprocessor.get_input_dim()}, got {input_dim}"

    model = build_nutrition_model(input_dim=input_dim)
    model = compile_model(model, lr=1e-3)

    print("\nModel architecture:")
    model.summary()

    os.makedirs(SAVE_DIR, exist_ok=True)

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss', patience=PATIENCE,
            restore_best_weights=True, verbose=1,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss', factor=0.5,
            patience=7, min_lr=1e-6, verbose=1,
        ),
        keras.callbacks.ModelCheckpoint(
            os.path.join(SAVE_DIR, 'best_model.keras'),
            monitor='val_loss', save_best_only=True, verbose=1,
        ),
    ]

    print("\n" + "="*60)
    print("STARTING TRAINING")
    print("="*60)

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=2,
    )
    return model, history


# ─────────────────────────────────────────────────────
# Evaluation
# ─────────────────────────────────────────────────────
def evaluate_model(model, test_df, preprocessor):
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

    X_test, y_test = prepare_features(test_df, preprocessor, fit=False)
    predictions    = model.predict(X_test, verbose=0)

    pred_dict = {
        'calories': predictions[0].flatten(),
        'protein':  predictions[1].flatten(),
        'carbs':    predictions[2].flatten(),
        'fat':      predictions[3].flatten(),
    }

    print("\n" + "="*60)
    print("TEST RESULTS")
    print("="*60)
    print(f"{'Target':<12} {'MAE':>8} {'RMSE':>10} {'R²':>8}")
    print("-" * 42)

    metrics = {}
    for name in ['calories', 'protein', 'carbs', 'fat']:
        mae  = mean_absolute_error(y_test[name], pred_dict[name])
        rmse = mean_squared_error(y_test[name],  pred_dict[name]) ** 0.5
        r2   = r2_score(y_test[name], pred_dict[name])
        print(f"{name:<12} {mae:>8.2f} {rmse:>10.2f} {r2:>8.4f}")
        metrics[name] = {'mae': round(mae, 3), 'rmse': round(rmse, 3), 'r2': round(r2, 4)}

    return metrics


# ─────────────────────────────────────────────────────
# Save artifacts
# ─────────────────────────────────────────────────────
def save_artifacts(model, preprocessor, metrics, history):
    os.makedirs(SAVE_DIR, exist_ok=True)

    # Model
    model_path = os.path.join(SAVE_DIR, 'nutrition_model.keras')
    model.save(model_path)
    print(f"\n✅ Model      : {model_path}")

    # Preprocessor
    preprocessor.save(SAVE_DIR)
    print(f"✅ Preprocessor: {SAVE_DIR}")

    # Metadata
    metadata = {
        'trained_at':    datetime.now().isoformat(),
        'input_dim':     NutritionPreprocessor.get_input_dim(),
        'metrics':       metrics,
        'training_config': {
            'epochs':     EPOCHS,
            'batch_size': BATCH_SIZE,
            'patience':   PATIENCE,
            'loss':       'huber',
            'optimizer':  'adamw',
        },
        'output_names':    ['calories', 'protein', 'carbs', 'fat'],
        'valid_goals':     preprocessor.VALID_GOALS,
        'valid_diseases':  preprocessor.VALID_DISEASES,
        'feature_layout':  {
            'numeric_cols': preprocessor.NUMERIC_COLS,  # [0:19]
            'gender':       'binary [19]',              # [19]
            'goal_onehot':  preprocessor.VALID_GOALS,   # [20:23]
            'disease_onehot': preprocessor.VALID_DISEASES,  # [23:35]
        },
    }

    meta_path = os.path.join(SAVE_DIR, 'metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✅ Metadata   : {meta_path}")

    # Training plot
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt

        fig, axes = plt.subplots(2, 2, figsize=(14, 10))

        for ax, name in zip(axes.flatten(),
                            ['calories', 'protein', 'carbs', 'fat']):
            key_train = f'{name}_mae'
            key_val   = f'val_{name}_mae'
            if key_train in history.history:
                ax.plot(history.history[key_train], label='Train', lw=2)
                ax.plot(history.history[key_val],   label='Val',   lw=2)
                ax.set_title(f'{name.capitalize()} MAE', fontweight='bold')
                ax.legend()
                ax.set_xlabel('Epoch')

        plt.tight_layout()
        plot_path = os.path.join(SAVE_DIR, 'training_history.png')
        plt.savefig(plot_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"✅ Plot       : {plot_path}")
    except Exception as e:
        print(f"Plot skipped: {e}")


# ─────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────
def main():
    print("="*60)
    print("NUTRITION MODEL TRAINING v3")
    print("="*60)

    df                         = load_data(DATA_PATH)
    df                         = balance_goals(df)
    train_df, val_df, test_df  = split_data(df)
    preprocessor               = NutritionPreprocessor()
    model, history             = train_model(train_df, val_df, preprocessor)
    metrics                    = evaluate_model(model, test_df, preprocessor)
    save_artifacts(model, preprocessor, metrics, history)

    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)


if __name__ == "__main__":
    main()
