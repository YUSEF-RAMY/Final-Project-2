"""
Nutrition Recommendation Model — TensorFlow/Keras
Multi-output regression: calories, protein, carbs, fat

FIXES v3:
  - Loss: MSE → Huber (robust to outliers)
  - Optimizer: Adam(weight_decay) → AdamW (correct API)
  - input_dim default: 32 → 35 (gender fix + lbm + tdee)
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model


def build_nutrition_model(input_dim: int = 36,
                          hidden_dims: list = [256, 128, 64],
                          dropout: float = 0.3) -> Model:
    """
    Multi-head nutrition prediction model.

    Architecture:
      Shared backbone  →  4 separate output heads
      (calories, protein, carbs, fat)

    Args:
        input_dim:   Number of input features (default 35)
        hidden_dims: Hidden layer sizes for backbone
        dropout:     Dropout rate in backbone
    """
    inputs = keras.Input(shape=(input_dim,), name="input_features")

    # ── Shared Backbone ──
    x = inputs
    for i, h in enumerate(hidden_dims):
        x = layers.Dense(h, name=f"shared_dense_{i}")(x)
        x = layers.BatchNormalization(name=f"shared_bn_{i}")(x)
        x = layers.ReLU(name=f"shared_relu_{i}")(x)
        x = layers.Dropout(dropout, name=f"shared_drop_{i}")(x)

    shared = x

    # ── Output Heads ──
    def _head(name: str, units: int = 32) -> layers.Layer:
        h = layers.Dense(units, activation='relu', name=f"{name}_dense")(shared)
        h = layers.Dropout(0.15, name=f"{name}_drop")(h)
        return layers.Dense(1, name=name)(h)

    cal_out  = _head("calories", 32)
    prot_out = _head("protein",  32)
    carb_out = _head("carbs",    32)
    fat_out  = _head("fat",      32)

    model = Model(
        inputs=inputs,
        outputs=[cal_out, prot_out, carb_out, fat_out],
        name="NutritionModel_v3",
    )
    return model


def compile_model(model: Model, lr: float = 1e-3, clipnorm: float = None) -> Model:
    """
    Compile with Huber loss + AdamW optimizer.

    Loss weights:
      calories × 2.0  (most important — sets energy budget)
      protein  × 1.5  (critical for body composition)
      carbs    × 1.0
      fat      × 1.0

    Args:
        clipnorm: If set, clips gradients by global norm (e.g. 1.0).
                  Helps stabilise val_loss oscillation.
    """
    huber = tf.keras.losses.Huber(delta=1.0)

    optimizer_kwargs = dict(learning_rate=lr, weight_decay=1e-4)
    if clipnorm is not None:
        optimizer_kwargs['clipnorm'] = clipnorm

    model.compile(
        optimizer=tf.keras.optimizers.AdamW(**optimizer_kwargs),
        loss={
            'calories': huber,
            'protein':  huber,
            'carbs':    huber,
            'fat':      huber,
        },
        loss_weights={
            'calories': 2.0,
            'protein':  1.5,
            'carbs':    1.0,
            'fat':      1.0,
        },
        metrics={
            'calories': ['mae'],
            'protein':  ['mae'],
            'carbs':    ['mae'],
            'fat':      ['mae'],
        },
    )
    return model


# ─────────────────────────────────────────────────────
# Quick test
# ─────────────────────────────────────────────────────
if __name__ == "__main__":
    model = build_nutrition_model(input_dim=35)
    model = compile_model(model)
    model.summary()
    print(f"\nTotal parameters: {model.count_params():,}")
