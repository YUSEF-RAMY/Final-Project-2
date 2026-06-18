# 🧠 Healthify — AI Services

> خدمة الذكاء الاصطناعي الخاصة بمنظومة **Healthify** — نظام توصية غذائية طبي مدعوم بـ Gemini OCR وTensorFlow.

---

## 📌 نظرة عامة

يأخذ المستخدم صورة تقرير **InBody** ↔ الـ AI يقرأها ↔ يوصي بخطة غذائية يومية مخصصة، مع مراعاة الهدف والحالة الصحية.

```
[ Laravel 12 Backend ]
        ↓  HTTP + X-Trace-Id
[ FastAPI AI Service ] ← أنت هنا
        ↓
  ┌──────────────────────────────────┐
  │  1) Gemini OCR  →  InBody JSON  │
  │  2) Goal × Disease Matrix check │
  │  3) TensorFlow Multi-Head Model │
  │  4) Clinical Safety Layer       │
  │  5) Response: macros + notes    │
  └──────────────────────────────────┘
```

---

## 📂 هيكل المجلد

```
Ai/
├── inbody-gemini-extractor/        # استخراج بيانات InBody من صورة عبر Gemini
│   ├── app.py                      # FastAPI — نقطة الدخول الرئيسية
│   ├── preprocessing.py            # NutritionPreprocessor: encoding + scaling + feature completion
│   ├── model.py                    # معمارية نموذج TensorFlow (Multi-Head)
│   ├── constraints.py              # طبقة الأمان السريري: matrix + safety layer
│   ├── train.py                    # سكريبت تدريب النموذج
│   ├── test_api.py                 # اختبار الـ API
│   ├── saved_model/                # artifacts (يُنشأ بعد التدريب)
│   │   ├── nutrition_model.keras
│   │   ├── scaler.pkl
│   │   ├── goal_encoder.pkl
│   │   ├── disease_encoder.pkl
│   │   ├── preprocessor_config.pkl
│   │   └── metadata.json
│   ├── requirements.txt
│   └── README.md
│
├── inbody-nutrition-recommender/   # (Notebook للتطوير والتجريب)
│   ├── Nutrition_Model_v3.ipynb    # pipeline كامل: تدريب + تقييم + inference
│   ├── data/
│   │   └── fitness_dataset_v10_clinical.csv   # 63,377 صف × 27 عمود
│   └── README.md
│
└── README.md                       # ← أنت هنا
```

---

## 🔄 Pipeline كامل

```
صورة InBody
    ↓
Gemini OCR  →  15+ حقل (height, weight, muscle_mass, ...)
    ↓
normalize_ocr_data()  →  تصحيح وحدات + تطبيع
    ↓
check_goal_disease()  →  ok / warning / forbidden
    ↓ (forbidden → 422 + suggested_goal)
NutritionPreprocessor.complete_features()
  └─ يحسب: lbm, bmr, tdee, bmi, water, ...
    ↓
transform_single()  →  numpy array (1, 36)
  └─ 20 numeric + 1 gender + 3 goal onehot + 12 disease onehot
    ↓
NutritionModel_v3 (Keras Multi-Head)
  └─ backbone: Dense(256→128→64) + BatchNorm + Dropout
  └─ 4 heads: calories / protein / carbs / fat
    ↓
apply_safety_layer()  →  قص ضمن الحدود السريرية لكل مرض
    ↓
Response JSON
  └─ status, calories, protein, carbs, fat
  └─ macro_breakdown %, clinical_note, safety_applied
```

---

## 📮 API Endpoints

| Method | Endpoint | الوصف |
|---|---|---|
| `GET` | `/` | فحص حالة الـ API + قائمة endpoints |
| `GET` | `/diseases` | 12 مرض مدعوم |
| `GET` | `/goals` | الأهداف: lose_fat / maintain / gain_muscle |
| `GET` | `/matrix` | جدول توافق Goal × Disease كامل |
| `POST` | `/extract-inbody` | صورة InBody → JSON بيانات |
| `POST` | `/predict` | صورة + بيانات مستخدم → توصية غذائية |
| `POST` | `/predict_manual` | بيانات يدوية → توصية غذائية |

**مثال — Request:**
```json
POST /predict_manual
{
  "inbody": {
    "height": 1.75, "weight": 80, "age": 30, "gender": "Male",
    "muscle_mass": 35, "body_fat_percentage": 22.5
  },
  "user": {
    "goal": "lose_fat",
    "activity_level": 3,
    "disease_condition": "healthy"
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "calories": 2100,
  "protein": 145.0,
  "carbs": 220.0,
  "fat": 65.0,
  "macro_breakdown": { "protein_pct": 27.6, "carbs_pct": 41.9, "fat_pct": 27.9 },
  "clinical_note": null,
  "safety_applied": false
}
```

---

## 🧠 معمارية النموذج

```
Input (36 features)
    ↓
Dense(256) → BatchNorm → ReLU → Dropout(0.3)
    ↓
Dense(128) → BatchNorm → ReLU → Dropout(0.3)
    ↓
Dense(64)  → BatchNorm → ReLU → Dropout(0.3)
    ↓
    ├─ Dense(32, relu) → Dropout(0.15) → Dense(1)  → calories  (weight: 2.0)
    ├─ Dense(32, relu) → Dropout(0.15) → Dense(1)  → protein   (weight: 1.5)
    ├─ Dense(32, relu) → Dropout(0.15) → Dense(1)  → carbs     (weight: 1.0)
    └─ Dense(32, relu) → Dropout(0.15) → Dense(1)  → fat       (weight: 1.0)
```

| Loss | Optimizer | Early Stopping |
|---|---|---|
| Huber (δ=1.0) | AdamW (lr=1e-3, wd=1e-4) | patience=20 |

---

## 🛡️ الأمراض المدعومة (12)

`healthy` · `overweight` · `obesity` · `underweight` · `diabetes_type2` · `hypertension` · `insulin_resistance` · `fatty_liver` · `heart_disease` · `hypothyroidism` · `kidney_disease` · `pcos`

---

## ⚙️ تشغيل محلي

```bash
# 1. clone
git clone https://github.com/YUSEF-RAMY/Healthify.git
cd Healthify/Ai/inbody-gemini-extractor

# 2. install
pip install -r requirements.txt

# 3. .env
echo "GOOGLE_API_KEY=your_key_here" > .env

# 4. train (لو saved_model/ فاضي)
python train.py

# 5. run
python app.py
# → http://localhost:8000/docs

# 6. test
python test_api.py
```

---

## 🔗 تشغيل مع الـ Stack الكامل

```bash
# من root المشروع
docker compose up -d ai-service
```

كل request من Laravel بيحمل `X-Trace-Id` للـ distributed tracing:
```bash
tail -f storage/logs/ai.log | grep "your-trace-id"
```

---

## 📊 أداء النموذج

| Target | MAE | RMSE | R² |
|---|---|---|---|
| calories | ~28 kcal | ~36 | > 0.97 |
| protein | ~3.5 g | ~4.4 | > 0.97 |
| carbs | ~10 g | ~13 | > 0.96 |
| fat | ~4 g | ~5 | > 0.97 |

خطأ نسبي في السعرات: **~1.3%**

---

## 🔗 روابط

- [Healthify — الريبو الرئيسي](https://github.com/YUSEF-RAMY/Healthify)
- [Google Gemini API](https://ai.google.dev/docs)
- [README المشروع الكامل](https://github.com/YUSEF-RAMY/Healthify/blob/develop/README.md)