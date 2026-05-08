# 🏋️ Body Composition Classifier — API

Exact implementation of `body_classifier.ipynb` as a production FastAPI.

---

## 📁 Files Required

```
your_project/
├── main.py                       ← API (this file)
├── requirements.txt
├── body_classifier_final.joblib  ← from notebook output
└── README.md
```

> **Important:** `body_classifier_final.joblib` must be in the same folder as `main.py`.
> Run the notebook first to generate it (Cell 12: `train_body_classifier()`).

---

## 🚀 Setup & Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📖 API Docs (Swagger UI)

Open in browser after starting: **http://localhost:8000/docs**

---

## 🔗 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check + model info |
| GET | `/health` | Simple health check |
| POST | `/classify` | Classify single individual |
| POST | `/classify/batch` | Classify up to 1000 records |
| GET | `/categories` | List all 8 categories |
| GET | `/thresholds` | View medical thresholds |
| GET | `/model/info` | Model metadata & CV accuracy |

---

## 📡 Example: Single Classification

### Request
```bash
curl -X POST http://localhost:8000/classify \
  -H "Content-Type: application/json" \
  -d '{
    "height_cm": 181,
    "weight_kg": 82,
    "age": 24,
    "gender": "male",
    "pbf": 9.0,
    "smm_kg": 40.0,
    "body_fat_kg": 7.4
  }'
```

### Response
```json
{
  "category": "Athletic",
  "confidence": 96,
  "emoji": "🏆",
  "rule_category": "Athletic",
  "rf_category": "Athletic",
  "rf_agrees": true,
  "rf_probabilities": {
    "Athletic": 91.2,
    "Fit": 6.3,
    "Obese": 0.1,
    ...
  },
  "reasoning": "PBF=9.0%  |  FFMI=22.34  |  SMM%=48.78%",
  "metrics": {
    "BMI": 25.02,
    "Body_Fat_pct": 9.0,
    "FFMI": 22.34,
    "SMM_pct": 48.78,
    "Lean_Mass_kg": 74.62,
    "Muscle_to_Fat": 5.41
  }
}
```

---

## 📡 Example: Batch Classification

```bash
curl -X POST http://localhost:8000/classify/batch \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {"height_cm":181,"weight_kg":82,"age":24,"gender":"male","pbf":9,"smm_kg":40,"body_fat_kg":7.4},
      {"height_cm":165,"weight_kg":60,"age":28,"gender":"female","pbf":24,"smm_kg":21,"body_fat_kg":14.4},
      {"height_cm":172,"weight_kg":105,"age":42,"gender":"male","pbf":37,"smm_kg":34,"body_fat_kg":38.9}
    ]
  }'
```

---

## 📥 Input Fields

| Field | Type | Required | Range | Description |
|-------|------|----------|-------|-------------|
| `height_cm` | float | ✅ | 100–220 | Height in centimetres |
| `weight_kg` | float | ✅ | 20–200 | Total body weight |
| `age` | int | ✅ | 5–100 | Age in years |
| `gender` | str | ✅ | male / female | Gender |
| `pbf` | float | ✅ | 1–60 | Body Fat Percentage |
| `smm_kg` | float | ✅ | 1–100 | Skeletal Muscle Mass (kg) |
| `body_fat_kg` | float | ✅ | 0.5–120 | Fat Mass (kg) |
| `water_kg` | float | ⬜ | — | Total Body Water (auto-estimated) |
| `protein_kg` | float | ⬜ | — | Body Protein (auto-estimated) |
| `minerals_kg` | float | ⬜ | — | Minerals (auto-estimated) |

---

## 🧠 How It Works (same as notebook)

```
Input → Feature Engineering (FFMI, SMM%, lean_mass, muscle_to_fat)
      → Rule Engine (8 rules, priority cascade) — primary decision
      + Random Forest 500 trees — secondary (probability output)
      → Hybrid: Rule Engine always wins · RF boosts confidence if agrees
      → { category, confidence, rf_probabilities, reasoning, metrics }
```

### Classification Priority
1. **Obese** → BMI≥30 AND fat% above threshold
2. **Athletic** → low fat AND high FFMI AND high SMM% (2 of 3)
3. **Fit** → 3 of 4 good metrics
4. **Overweight** → BMI 25–30
5. **Sarcopenic** → low FFMI AND low SMM%
6. **Skinny Fat** → normal BMI + high fat + weak muscle
7. **Underweight** → low BMI + low fat + low muscle
8. **Thin** → low BMI + acceptable fat
