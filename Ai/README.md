# 🏋️ AI IN Body — AI-Powered Fitness Intelligence System

> End-to-end ML pipeline that predicts personalised daily nutrition targets from InBody body composition metrics.

---

## 📌 Overview

inbody-ai-predictor takes raw InBody scan data (weight, muscle mass, body fat %, etc.) alongside the user's activity level, fitness level, and goal — and returns tailored daily targets for **calories, protein, carbs, and fat**.

Built as a production-ready system with two connected layers:

| Layer | Technology | Responsibility |
|---|---|---|
| Training | TensorFlow / Keras · scikit-learn · Jupyter | Data preprocessing, model training, artifact saving |
| Serving | FastAPI · Pydantic · Uvicorn | Load artifacts, run inference, expose REST API |

---

## 📂 Project Structure

```
inbody-ai-predictor/
├── data/
│   └── fitness_dataset.csv        # 100K synthetic samples (physiologically consistent)
├── model/                         # Auto-created after training
│   ├── aimbody_model.keras
│   ├── scaler.pkl
│   ├── encoder.pkl
│   └── training_curves.png
├── notebook/
│   └── aimbody_training.ipynb     # Full training pipeline
├── api/
│   ├── __init__.py
│   ├── schemas.py                 # Pydantic request / response schemas
│   └── predictor.py               # Artifact loader + inference logic
├── main.py                        # FastAPI app
├── requirements.txt
└── README.md
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Train — opens notebook, run all cells
jupyter notebook notebook/aimbody_training.ipynb

# 3. Serve
python main.py
# → http://localhost:8000/docs
```

---

## 📮 API — POST `/predict`

**Request**
```json
{
  "height": 1.84,
  "weight": 109.7,
  "age": 21,
  "gender": "Male",
  "activity_level": 4,
  "fitness_level": 1,
  "goal": "lose_fat",
  "muscle_mass": 47.17,
  "body_fat_percentage": 35.0,
  "body_fat_mass": 38.40,
  "water": 51.69,
  "protein_intake": 13.90,
  "minerals": 5.16,
  "bmi": 32.4
}
```

**Response**
```json
{
  "calories": 2972,
  "protein": 152.0,
  "carbs": 367.6,
  "fat": 100.3
}
```

---

## 🧠 Model Architecture

```
Input (13 features)
    ↓
Dense(256) → BatchNorm → ReLU → Dropout(0.3)
    ↓
Dense(128) → BatchNorm → ReLU → Dropout(0.2)
    ↓
Dense(64)  → BatchNorm → ReLU → Dropout(0.1)
    ↓
Dense(32)  → ReLU
    ↓
Dense(4)   → [calories, protein, carbs, fat]
```

| Setting | Value |
|---|---|
| Optimizer | Adam (lr=1e-3) |
| Loss | Huber (δ=1.0) |
| Early Stopping | patience=15 |

---

## 📊 Model Performance

| Target | MAE | RMSE |
|---|---|---|
| calories | 28.88 kcal | 36.13 |
| protein | 3.45 g | 4.43 |
| carbs | 10.34 g | 13.15 |
| fat | 3.94 g | 5.02 |

Relative error on calories: **~1.3%**

---

## 🗂️ Input Features

| Feature | Type | Description |
|---|---|---|
| `height` | float | metres |
| `weight` | float | kg |
| `age` | int | years |
| `gender` | str | Male / Female |
| `activity_level` | int | 1=Sedentary · 2=Light · 3=Moderate · 4=Active · 5=Very Active |
| `fitness_level` | int | 1=Beginner · 2=Intermediate · 3=Advanced |
| `goal` | str | lose_fat · maintain · gain_muscle |
| `muscle_mass` | float | kg |
| `body_fat_percentage` | float | % |
| `body_fat_mass` | float | kg |
| `water` | float | litres |
| `protein_intake` | float | InBody body protein reading (g) |
| `minerals` | float | kg |
| `bmi` | float | kg/m² |

---

## 🔬 Dataset

100,000 synthetic samples — physiologically consistent, not purely random:

- `body_fat_mass` = `weight × body_fat% / 100`
- `bmi` = `weight / height²`
- `water` ≈ 72.5% of lean mass
- `calories` = Mifflin-St Jeor BMR × activity multiplier ± goal adjustment
- `protein` calculated on **lean mass** for `lose_fat` goal (muscle preservation)

---

## ⚠️ Input Constraints

| Feature | Male | Female |
|---|---|---|
| `body_fat_percentage` | 8 – 35% | 18 – 45% |
| `bmi` | 16.5 – 40.0 | 16.5 – 40.0 |

Values outside training distribution will be accepted but may reduce prediction accuracy.

---

## 🚀 Future Improvements

- [ ] Workout recommendation system
- [ ] Model versioning + MLflow tracking
- [ ] Real-time InBody device integration
- [ ] Docker deployment
- [ ] Frontend dashboard
