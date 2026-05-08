
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from huggingface_hub import hf_hub_download
# APP SETUP

app = FastAPI(
    title="🏋️ Body Composition Classifier API",

    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════════════════════════════════════════
# LOAD MODEL
# ══════════════════════════════════════════════════════════════════════════════

MODEL_PATH = hf_hub_download(
    repo_id="Heba15/body_classifier",
    filename="body_classifier_final.joblib"
)

ARTIFACT = joblib.load(MODEL_PATH)
try:
    ARTIFACT = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded: {MODEL_PATH}")
    print(f"   Classes : {ARTIFACT['classes']}")
    print(f"   CV Acc  : {ARTIFACT['cv_accuracy']*100:.2f}%")
except FileNotFoundError:
    raise RuntimeError(
        f"❌ Model file not found: {MODEL_PATH}\n"
        "   Run the notebook first to generate body_classifier_final.joblib"
    )

# ══════════════════════════════════════════════════════════════════════════════
#THRESHOLDS & CONSTANTS
# ══════════════════════════════════════════════════════════════════════════════
THRESHOLDS = {
    'male': {
        'pbf_athletic_max':   13,
        'pbf_fit_max':        22,
        'pbf_overweight_max': 30,
        'ffmi_athletic_min':  19.5,
        'ffmi_fit_min':       17.0,
        'ffmi_sarco_max':     16.0,
        'smm_pct_high':       44,
        'smm_pct_normal_min': 38,
        'smm_pct_low':        32,
        'bmi_underweight':    18.5,
        'bmi_normal_max':     25.0,
        'bmi_overweight_max': 30.0,
    },
    'female': {
        'pbf_athletic_max':   22,
        'pbf_fit_max':        30,
        'pbf_overweight_max': 38,
        'ffmi_athletic_min':  16.0,
        'ffmi_fit_min':       13.5,
        'ffmi_sarco_max':     12.5,
        'smm_pct_high':       36,
        'smm_pct_normal_min': 31,
        'smm_pct_low':        27,
        'bmi_underweight':    18.5,
        'bmi_normal_max':     25.0,
        'bmi_overweight_max': 30.0,
    }
}

FEATURES = [
    'height', 'age', 'gender_bin', 'weight', 'smm', 'body_fat_mass',
    'water', 'protein', 'minerals', 'bmi', 'pbf',
    'smm_pct', 'lean_mass', 'ffmi', 'muscle_to_fat'
]

EMOJI = {
    'Athletic': '🏆', 'Fit': '💪', 'Overweight': '⚠️', 'Obese': '🔴',
    'Underweight': '📉', 'Thin': '🦴', 'Skinny Fat': '👻', 'Sarcopenic': '🧓'
}

# InBody biological constants (calibrated from real InBody data)
WATER_RATIO    = 0.733
PROTEIN_RATIO  = 0.198
MINERALS_RATIO = 0.069
SMM_LEAN_RATIO = 0.554


# ══════════════════════════════════════════════════════════════════════════════
# engineer_features()
# ══════════════════════════════════════════════════════════════════════════════
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    d = df.copy()
    d['gender']        = d['gender'].astype(str).str.strip().str.lower()
    d['gender_bin']    = (d['gender'] == 'male').astype(int)
    d['smm_pct']       = (d['smm'] / d['weight']) * 100
    d['lean_mass']     = d['weight'] * (1 - d['pbf'] / 100)
    d['ffmi']          = d['lean_mass'] / (d['height'] / 100) ** 2
    d['muscle_to_fat'] = d['smm'] / d['body_fat_mass'].replace(0, np.nan)
    return d


# ══════════════════════════════════════════════════════════════════════════════
# rule_classify()
# ══════════════════════════════════════════════════════════════════════════════
def rule_classify(row: pd.Series, thresholds: dict = THRESHOLDS) -> tuple:
    g       = str(row['gender']).strip().lower()
    t       = thresholds.get(g, thresholds['male'])
    bmi     = row['bmi']
    pbf     = row['pbf']
    ffmi    = row['ffmi']
    smm_pct = row['smm_pct']

    # ── 1. OBESE
    if bmi >= t['bmi_overweight_max'] and pbf > t['pbf_overweight_max']:
        conf = min(100, int(60 + (bmi-30)*2 + (pbf-t['pbf_overweight_max'])*1.5))
        return ('Obese', conf,
                f"BMI={bmi:.1f}≥30  &  PBF={pbf:.1f}%>{t['pbf_overweight_max']}%")

    # ── 2. ATHLETIC
    crit = [pbf  <= t['pbf_athletic_max'],
            ffmi >= t['ffmi_athletic_min'],
            smm_pct >= t['smm_pct_high']]
    if sum(crit) >= 2 and pbf <= t['pbf_fit_max']:
        conf = min(100, int(75 + sum(crit)*7))
        return ('Athletic', conf,
                f"PBF={pbf:.1f}%  |  FFMI={ffmi:.1f}  |  SMM%={smm_pct:.1f}%")

    # ── 3. FIT
    fit_crit = [
        pbf  <= t['pbf_fit_max'],
        ffmi >= t['ffmi_fit_min'],
        t['bmi_underweight'] <= bmi <= t['bmi_overweight_max'],
        smm_pct >= t['smm_pct_normal_min']
    ]
    if sum(fit_crit) >= 3:
        conf = min(100, int(60 + sum(fit_crit)*8))
        return ('Fit', conf,
                f"FFMI={ffmi:.1f}  |  PBF={pbf:.1f}%  |  SMM%={smm_pct:.1f}%")

    # ── 4. OVERWEIGHT
    if t['bmi_normal_max'] <= bmi < t['bmi_overweight_max']:
        conf = min(100, int(60 + (bmi - t['bmi_normal_max'])*4))
        return ('Overweight', conf, f"BMI={bmi:.1f} in overweight range 25–30")

    # ── 5. SARCOPENIC
    if (ffmi    < t['ffmi_sarco_max'] and
        smm_pct < t['smm_pct_low']   and
        bmi     < t['bmi_overweight_max']):
        conf = min(100, int(65 + (t['ffmi_sarco_max']-ffmi)*5))
        return ('Sarcopenic', conf,
                f"FFMI={ffmi:.1f}<{t['ffmi_sarco_max']}  |  SMM%={smm_pct:.1f}%<{t['smm_pct_low']}%")

    # ── 6. SKINNY FAT
    if (bmi < t['bmi_overweight_max'] and
        pbf > t['pbf_fit_max']        and
        (ffmi < t['ffmi_fit_min'] or smm_pct < t['smm_pct_normal_min'])):
        conf = min(100, int(60 + (pbf - t['pbf_fit_max'])*1.5))
        return ('Skinny Fat', conf,
                f"BMI={bmi:.1f} normal  BUT  PBF={pbf:.1f}%>{t['pbf_fit_max']}%  &  weak muscle")

    # ── 7. UNDERWEIGHT
    if bmi < t['bmi_underweight'] and pbf < 15 and smm_pct < t['smm_pct_normal_min']:
        conf = min(100, int(65 + (t['bmi_underweight']-bmi)*4))
        return ('Underweight', conf,
                f"BMI={bmi:.1f}<18.5  |  PBF={pbf:.1f}%  |  SMM%={smm_pct:.1f}%  all low")

    # ── 8. THIN
    if bmi < t['bmi_normal_max'] and pbf <= t['pbf_fit_max']:
        return ('Thin', 70, f"BMI={bmi:.1f} low  |  PBF={pbf:.1f}% acceptable — naturally lean")

    # ── FALLBACK
    return ('Fit', 60, f"Default — normal metrics: BMI={bmi:.1f}  PBF={pbf:.1f}%")


# ══════════════════════════════════════════════════════════════════════════════
#  predict()
# ══════════════════════════════════════════════════════════════════════════════
def predict(
    height:    float,
    weight:    float,
    age:          int,
    gender:       str,
    pbf:          float,
    smm:       float,
    body_fat_mass:  float,
    water:     float = None,
    protein:   float = None,
    minerals:  float = None,
    model_artifact: dict = None,
) -> dict:
    # ── Input validation (same asserts as notebook)
    assert 100 <= height  <= 220,  f"height_cm out of range [100-220]: {height}"
    assert 20  <= weight  <= 200,  f"weight_kg out of range [20-200]: {weight}"
    assert 5   <= age        <= 100,  f"age out of range [5-100]: {age}"
    gender = gender.strip().lower()
    assert gender in ('male', 'female'), f"gender must be 'male' or 'female', got: '{gender}'"
    assert 1   <= pbf        <= 60,   f"pbf out of range [1-60]: {pbf}"
    assert 1   <= smm    <= 100,  f"smm_kg out of range [1-100]: {smm}"
    assert 0.5 <= body_fat_mass <= 120, f"body_fat_kg out of range [0.5-120]: {body_fat_mass}"

    if model_artifact is None:
        model_artifact = ARTIFACT

    rf_  = model_artifact['model']
    le_  = model_artifact['label_encoder']
    feats= model_artifact['features']
    r    = model_artifact.get('inbody_ratios', {
               'water': WATER_RATIO, 'protein': PROTEIN_RATIO,
               'minerals': MINERALS_RATIO, 'smm_lean': SMM_LEAN_RATIO})

    # ── Compute derived metrics
    h_m           = height / 100
    bmi           = round(weight / h_m**2, 2)
    lean_mass     = round(weight * (1 - pbf/100), 2)
    ffmi          = round(lean_mass / h_m**2, 2)
    smm_pct       = round((smm / weight) * 100, 2)
    muscle_to_fat = round(smm / body_fat_mass, 2) if body_fat_mass > 0 else 0
    gender_bin    = 1 if gender == 'male' else 0

    if water    is None: water    = round(lean_mass * r['water'],    1)
    if protein  is None: protein  = round(lean_mass * r['protein'],  2)
    if minerals is None: minerals = round(lean_mass * r['minerals'], 2)

    row = pd.Series({
        'gender': gender, 'bmi': bmi, 'pbf': pbf, 'ffmi': ffmi, 'smm_pct': smm_pct,
        'height': height, 'age': age, 'gender_bin': gender_bin,
        'weight': weight, 'smm': smm, 'body_fat_mass': body_fat_mass,
        'water': water, 'protein': protein, 'minerals': minerals,
        'lean_mass': lean_mass, 'muscle_to_fat': muscle_to_fat,
    })

    # ── Rule engine (primary)
    rule_cat, rule_conf, reasoning = rule_classify(row)

    # ── RF prediction (secondary)
    X_in     = pd.DataFrame([row[feats].values], columns=feats).fillna(0)
    rf_proba = rf_.predict_proba(X_in)[0]
    rf_cat   = le_.inverse_transform([rf_proba.argmax()])[0]
    rf_conf  = int(rf_proba.max() * 100)

    # ── Hybrid decision (same logic as notebook)
    agrees     = (rf_cat == rule_cat)
    final_cat  = rule_cat
    final_conf = rule_conf if not agrees else min(100, rule_conf + int(rf_conf * 0.15))

    return {
        'category':         final_cat,
        'confidence':       final_conf,
        'emoji':            EMOJI.get(final_cat, ''),
        'rule_category':    rule_cat,
        'rf_category':      rf_cat,
        'rf_agrees':        agrees,
        'rf_probabilities': {
            le_.classes_[i]: round(float(p)*100, 1)
            for i, p in enumerate(rf_proba)
        },
        'reasoning':        reasoning,
        'metrics': {
            'BMI':           bmi,
            'Body_Fat_pct':  pbf,
            'FFMI':          ffmi,
            'SMM_pct':       smm_pct,
            'Lean_Mass_kg':  lean_mass,
            'Muscle_to_Fat': muscle_to_fat,
        }
    }


# ══════════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ══════════════════════════════════════════════════════════════════════════════
class ClassifyRequest(BaseModel):
    height:   float = Field(..., ge=100, le=220, example=181,  description="Height in cm")
    weight:   float = Field(..., ge=20,  le=200, example=82,   description="Total weight in kg")
    age:         int   = Field(..., ge=5,   le=100, example=24,   description="Age in years")
    gender:      str   = Field(...,                 example="male",description="'male' or 'female'")
    pbf:         float = Field(..., ge=1,   le=60,  example=9.0,  description="Body fat percentage %")
    smm:      float = Field(..., ge=1,   le=100, example=40.0, description="Skeletal muscle mass in kg")
    body_fat_mass: float = Field(..., ge=0.5, le=120, example=7.4,  description="Fat mass in kg")
    water:    Optional[float] = Field(None, description="Total body water kg (auto-estimated if omitted)")
    protein:  Optional[float] = Field(None, description="Body protein kg (auto-estimated if omitted)")
    minerals: Optional[float] = Field(None, description="Minerals kg (auto-estimated if omitted)")

    @validator('gender')
    def gender_must_be_valid(cls, v):
        v = v.strip().lower()
        if v not in ('male', 'female'):
            raise ValueError("gender must be 'male' or 'female'")
        return v

    class Config:
        schema_extra = {
            "example": {
                "height": 181,
                "weight": 82,
                "age": 24,
                "gender": "male",
                "pbf": 9.0,
                "smm": 40.0,
                "body_fat_mass": 7.4
            }
        }


class ClassifyResponse(BaseModel):
    category:         str
    confidence:       int
    emoji:            str
    rule_category:    str
    rf_category:      str
    rf_agrees:        bool
    rf_probabilities: dict
    reasoning:        str
    metrics:          dict


class BatchItem(BaseModel):
    height:   float
    weight:   float
    age:         int
    gender:      str
    pbf:         float
    smm:      float
    body_fat_mass: float
    water:    Optional[float] = None
    protein:  Optional[float] = None
    minerals: Optional[float] = None


class BatchRequest(BaseModel):
    records: list[BatchItem] = Field(..., min_items=1, max_items=1000)

    class Config:
        schema_extra = {
            "example": {
                "records": [
                    {"height":181,"weight":82,"age":24,"gender":"male","pbf":9,"smm":40,"body_fat_mass":7.4},
                    {"height":165,"weight":60,"age":28,"gender":"female","pbf":24,"smm":21,"body_fat_mass":14.4}
                ]
            }
        }


# ══════════════════════════════════════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def root():
    """Health check — returns model info."""
    return {
        "status":     "🟢 online",
        "model":      "Hybrid Rule Engine + Random Forest (500 trees)",
        "cv_accuracy": f"{ARTIFACT['cv_accuracy']*100:.2f}%",
        "classes":    ARTIFACT['classes'],
        "n_training": ARTIFACT.get('n_training', 'N/A'),
        "docs":       "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


@app.post(
    "/classify",
    response_model=ClassifyResponse,
    tags=["Classification"],
    summary="Classify a single individual",
    description="Takes InBody measurements and returns body composition category with confidence, reasoning, and RF probabilities."
)
def classify_single(req: ClassifyRequest):
    """
    Classify a single individual's body composition.
    **Required fields:** height_cm, weight_kg, age, gender, pbf, smm_kg, body_fat_kg
    **Optional:** water_kg, protein_kg, minerals_kg (auto-estimated from InBody ratios if not provided)
    """
    try:
        result = predict(
            height    = req.height,
            weight   = req.weight,
            age          = req.age,
            gender       = req.gender,
            pbf          = req.pbf,
            smm       = req.smm,
            body_fat_mass = req.body_fat_mass,
            water    = req.water,
            protein  = req.protein,
            minerals  = req.minerals,
            model_artifact = ARTIFACT,
        )
        return result
    except AssertionError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post(
    "/classify/batch",
    tags=["Classification"],
    summary="Classify multiple individuals at once",
    description="Submit up to 1000 records in one request. Returns list of results."
)
def classify_batch(req: BatchRequest):
    """
    Classify a batch of individuals (up to 1000 records).
    Each record uses the same fields as `/classify`.
    Returns a list of results in the same order as input.
    """
    results = []
    errors  = []

    for i, item in enumerate(req.records):
        try:
            res = predict(
                height   = item.height,
                weight   = item.weight,
                age          = item.age,
                gender       = item.gender,
                pbf          = item.pbf,
                smm       = item.smm,
                body_fat_mass  = item.body_fat_mass,
                water     = item.water,
                protein   = item.protein,
                minerals  = item.minerals,
                model_artifact = ARTIFACT,
            )
            results.append({"index": i, "status": "ok", **res})
        except (AssertionError, Exception) as e:
            errors.append({"index": i, "status": "error", "detail": str(e)})

    return {
        "total":    len(req.records),
        "success":  len(results),
        "errors":   len(errors),
        "results":  results,
        "failed":   errors,
    }


@app.get(
    "/categories",
    tags=["Info"],
    summary="List all 8 body composition categories"
)
def list_categories():
    """Returns all 8 supported categories with descriptions."""
    return {
        "categories": [
            {"name": "Athletic",    "emoji": "🏆", "description": "High muscle mass with low/essential body fat levels"},
            {"name": "Fit",         "emoji": "💪", "description": "Optimal balance between healthy muscle mass and normal body fat"},
            {"name": "Overweight",  "emoji": "⚠️", "description": "Elevated BMI with body fat exceeding the healthy range"},
            {"name": "Obese",       "emoji": "🔴", "description": "High BMI accompanied by excessive body fat mass"},
            {"name": "Underweight", "emoji": "📉", "description": "BMI below 18.5 — requires nutritional intervention"},
            {"name": "Thin",        "emoji": "🦴", "description": "Low BMI but maintains a healthy muscle-to-fat ratio"},
            {"name": "Skinny Fat",  "emoji": "👻", "description": "Normal weight/BMI but characterized by high fat and low muscle mass"},
            {"name": "Sarcopenic",  "emoji": "🧓", "description": "Critical loss of muscle mass (Muscle Atrophy)"},
        ]
    }


@app.get(
    "/thresholds",
    tags=["Info"],
    summary="Get classification thresholds for male and female"
)
def get_thresholds():
    """Returns the medical thresholds used by the rule engine."""
    return {"thresholds": THRESHOLDS}


@app.get(
    "/model/info",
    tags=["Info"],
    summary="Get model metadata and performance"
)
def model_info():
    """Returns model metadata, CV accuracy, and feature list."""
    return {
        "model_type":    "Hybrid Rule Engine + Random Forest",
        "n_estimators":  500,
        "cv_accuracy":   f"{ARTIFACT['cv_accuracy']*100:.2f}%",
        "cv_std":        f"{ARTIFACT.get('cv_std', 0)*100:.2f}%",
        "n_training":    ARTIFACT.get('n_training', 'N/A'),
        "classes":       ARTIFACT['classes'],
        "features":      ARTIFACT['features'],
        "medical_refs":  ["WHO (BMI)", "ACSM (Body Fat%)", "Kouri et al. (FFMI)", "InBody/DEXA (SMM%)"],
    }
