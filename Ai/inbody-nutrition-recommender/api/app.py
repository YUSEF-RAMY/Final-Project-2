"""
FastAPI Application — Nutrition Recommendation with Gemini OCR
Version 4.0

Pipeline: InBody image → Gemini OCR → Validate → Safety Layer → Model → Macros

What's new v4:
  - Goal × Disease matrix validation (ok / warning / forbidden)
  - Safety layer clips model output to clinical bounds
  - Rich response: status, clinical_note, suggested_goal
  - /matrix endpoint returns full compatibility table
"""

import json, time, os
import cv2, numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types
import tensorflow as tf

from preprocessing import NutritionPreprocessor
from constraints   import (
    check_goal_disease, apply_safety_layer,
    GOAL_DISEASE_MATRIX, FORBIDDEN_MESSAGES, WARNING_MESSAGES,
)

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

SAVE_DIR     = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'saved_model')
model        = tf.keras.models.load_model(os.path.join(SAVE_DIR, 'nutrition_model.keras'))
preprocessor = NutritionPreprocessor()
preprocessor.load(SAVE_DIR)

with open(os.path.join(SAVE_DIR, 'metadata.json')) as f:
    metadata = json.load(f)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# ─────────────────────────────────────────────────────────────
# Gemini OCR
# ─────────────────────────────────────────────────────────────
OCR_PROMPT = """
You are an expert medical data extractor. Analyze this InBody report image.
Extract the following fields and return them STRICTLY as a JSON object.
Do not include any other text, just the JSON.

Rules:
- Height must be in meters (e.g., 1.85). If given in cm, divide by 100.
- Weight must be in kg. Muscle mass is SMM in kg. Body fat % is PBF.
- Body fat mass is BFM in kg. Water is TBW in kg. Protein is body protein in kg.
- Visceral fat level (VFL) is usually 1-20. BMR in kcal/day.
- If a value is missing or unreadable, set it to null.

JSON structure:
{
  "height": null, "weight": null, "age": null, "gender": null,
  "muscle_mass": null, "body_fat_percentage": null, "body_fat_mass": null,
  "water": null, "protein": null, "minerals": null,
  "visceral_fat_level": null, "bmr": null, "waist_hip_ratio": null,
  "trunk_fat_mass": null, "trunk_lean_mass": null, "inbody_score": null
}
"""


def process_inbody_image(image_bytes: bytes) -> dict:
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
        nparr  = np.frombuffer(image_bytes, np.uint8)
        img    = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(400, "Invalid image file")

        h, w = img.shape[:2]
        if w > 1200:
            img = cv2.resize(img, (1200, int(h*1200/w)), interpolation=cv2.INTER_AREA)

        _, buf = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])

        response = None
        for m in ["gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=m,
                    contents=[types.Part.from_bytes(data=buf.tobytes(), mime_type="image/jpeg"), OCR_PROMPT]
                )
                break
            except Exception as e:
                if "429" in str(e) or "503" in str(e): time.sleep(2)
                else: raise e

        if response is None:
            raise HTTPException(503, "All AI models busy. Try again later.")

        text = response.text.strip().replace("```json","").replace("```","")
        return normalize_ocr_data(json.loads(text.strip()))

    except json.JSONDecodeError:
        raise HTTPException(500, "AI returned invalid JSON. Upload a clearer image.")
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(500, f"OCR error: {str(e)}")


def normalize_ocr_data(raw: dict) -> dict:
    result = {}
    for f in ['height','weight','muscle_mass','body_fat_mass','water',
              'minerals','bmr','waist_hip_ratio','trunk_fat_mass','trunk_lean_mass']:
        if raw.get(f) is not None:
            try: result[f] = float(raw[f])
            except: pass

    for f, t in [('age', int), ('visceral_fat_level', int), ('inbody_score', int)]:
        if raw.get(f) is not None:
            try: result[f] = t(float(raw[f]))
            except: pass

    if raw.get('gender') is not None:
        v = str(raw['gender']).strip().lower()
        result['gender'] = 'Male' if v in ('male','m') else 'Female' if v in ('female','f') else None

    for k in ['body_fat_percentage','pbf','body_fat_pct']:
        if raw.get(k) is not None:
            try: result['body_fat_percentage'] = float(raw[k]); break
            except: pass

    for k in ['protein','protein_intake','body_protein']:
        if raw.get(k) is not None:
            try: result['protein_intake'] = float(raw[k]); break
            except: pass

    if result.get('height') and result['height'] > 3:
        result['height'] = round(result['height']/100, 3)

    return result


# ─────────────────────────────────────────────────────────────
# Prediction core
# ─────────────────────────────────────────────────────────────
def run_prediction(inbody_data: dict, user_inputs: dict) -> dict:
    goal    = user_inputs.get('goal',              'maintain')
    disease = user_inputs.get('disease_condition', 'healthy')

    # Step 1 — Matrix check
    check = check_goal_disease(goal, disease)
    if check['status'] == 'forbidden':
        raise HTTPException(
            status_code=422,
            detail={
                'status':         'forbidden',
                'message':        check['message'],
                'suggested_goal': check['suggested'],
                'note':           check['note'],
                'disease':        disease,
                'goal':           goal,
            }
        )

    # Step 2 — Model
    data      = {**inbody_data, **user_inputs}
    X         = preprocessor.transform_single(data)
    completed = preprocessor.complete_features(data)
    preds     = model.predict(X, verbose=0)

    cal  = max(800, float(preds[0][0][0]))
    prot = max(20,  float(preds[1][0][0]))
    carb = max(20,  float(preds[2][0][0]))
    fat  = max(10,  float(preds[3][0][0]))

    # Step 3 — Safety layer
    safe = apply_safety_layer(
        calories=cal, protein=prot, carbs=carb, fat=fat,
        weight=completed.get('weight', 70),
        disease=disease, goal=goal,
    )
    cal, prot, carb, fat = safe['calories'], safe['protein'], safe['carbs'], safe['fat']

    # Macro %
    total    = prot*4 + carb*4 + fat*9
    prot_pct = round(prot*4/total*100, 1) if total else 0
    carb_pct = round(carb*4/total*100, 1) if total else 0
    fat_pct  = round(fat*9 /total*100, 1) if total else 0

    return {
        'status':          check['status'],
        'calories':        cal,
        'protein':         prot,
        'carbs':           carb,
        'fat':             fat,
        'macro_breakdown': {
            'protein_pct': prot_pct,
            'carbs_pct':   carb_pct,
            'fat_pct':     fat_pct,
        },
        'clinical_note':  (
            check['message'] if check['status'] == 'warning'
            else ('تم تعديل القيم الغذائية تلقائياً لتتوافق مع الحدود السريرية الآمنة لحالتك الصحية.' if safe['clipped'] else None)
        ),
        'safety_applied': safe['clipped'],
        'inbody_data': {
            k: completed.get(k) for k in [
                'height','weight','age','gender','muscle_mass',
                'body_fat_percentage','visceral_fat_level','waist_hip_ratio',
                'trunk_fat_mass','trunk_lean_mass','inbody_score',
                'bmr','lbm','tdee','bmi',
            ]
        },
        'model_info': {
            'disease':   disease,
            'goal':      goal,
            'input_dim': NutritionPreprocessor.get_input_dim(),
            'version':   '4.0.0',
        },
    }


# ─────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────
class InBodyData(BaseModel):
    height:              float           = Field(..., gt=1.0, lt=2.5)
    weight:              float           = Field(..., gt=20,  lt=250)
    age:                 int             = Field(..., ge=10,  le=100)
    gender:              str
    muscle_mass:         float           = Field(..., gt=0)
    body_fat_percentage: float           = Field(..., gt=0,   lt=60)
    body_fat_mass:       Optional[float] = None
    water:               Optional[float] = None
    protein_intake:      Optional[float] = None
    minerals:            Optional[float] = None
    visceral_fat_level:  Optional[int]   = Field(None, ge=1, le=20)
    bmr:                 Optional[float] = None
    waist_hip_ratio:     Optional[float] = Field(None, gt=0.5, lt=1.5)
    trunk_fat_mass:      Optional[float] = None
    trunk_lean_mass:     Optional[float] = None
    inbody_score:        Optional[int]   = Field(None, ge=20, le=100)


class UserInputs(BaseModel):
    goal:              str           = "maintain"
    activity_level:    int           = Field(3, ge=1, le=5)
    fitness_level:     Optional[int] = Field(None, ge=1, le=3)
    disease_condition: str           = "healthy"


class NutritionRequest(BaseModel):
    inbody: InBodyData
    user:   UserInputs


# ─────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Nutrition Recommendation API",
    description="AI-powered nutrition with clinical safety constraints",
    version="4.0.0",
)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status":"running","version":"4.0.0",
            "endpoints":{
                "POST /predict":        "InBody image → macros",
                "POST /predict_manual": "Manual data → macros",
                "POST /extract-inbody": "Image → InBody data",
                "GET  /diseases":       "Valid diseases",
                "GET  /goals":          "Valid goals",
                "GET  /matrix":         "Goal × Disease matrix",
            }}


@app.get("/diseases")
async def list_diseases():
    return {"diseases": metadata['valid_diseases']}


@app.get("/goals")
async def list_goals():
    return {"goals": metadata['valid_goals']}


@app.get("/matrix")
async def get_matrix():
    """Full Goal × Disease compatibility matrix."""
    result = {}
    for disease, goals in GOAL_DISEASE_MATRIX.items():
        result[disease] = {}
        for goal, status in goals.items():
            entry = {"status": status}
            if status == 'warning':
                entry["message"]  = WARNING_MESSAGES.get((disease, goal), "")
            if status == 'forbidden':
                info = FORBIDDEN_MESSAGES.get((disease, goal), {})
                entry["reason"]    = info.get('reason', '')
                entry["suggested"] = info.get('suggested', '')
                entry["note"]      = info.get('note', '')
            result[disease][goal] = entry
    return result


@app.post("/extract-inbody")
async def extract_inbody(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Not an image.")
    ocr = process_inbody_image(await file.read())
    return {
        "status":  "success",
        "data":    ocr,
        "missing": [f for f in ['height','weight','age','gender',
                                 'muscle_mass','body_fat_percentage']
                    if ocr.get(f) is None],
    }


@app.post("/predict")
async def predict_from_image(
    file:              UploadFile    = File(...),
    goal:              str           = "maintain",
    activity_level:    int           = 3,
    fitness_level:     Optional[int] = None,
    disease_condition: str           = "healthy",
):
    if goal not in metadata['valid_goals']:
        raise HTTPException(400, f"Invalid goal. Valid: {metadata['valid_goals']}")
    if disease_condition not in metadata['valid_diseases']:
        raise HTTPException(400, f"Invalid disease. Valid: {metadata['valid_diseases']}")
    if not 1 <= activity_level <= 5:
        raise HTTPException(400, "activity_level must be 1-5")
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Not an image.")

    inbody  = process_inbody_image(await file.read())
    missing = [f for f in ['height','weight','age','gender','muscle_mass','body_fat_percentage']
               if inbody.get(f) is None]
    if missing:
        raise HTTPException(422, f"OCR could not extract: {missing}. Use /predict_manual.")

    return run_prediction(inbody, {
        'goal': goal, 'activity_level': activity_level,
        'fitness_level': fitness_level, 'disease_condition': disease_condition,
    })


@app.post("/predict_manual")
async def predict_manual(request: NutritionRequest):
    if request.user.goal not in metadata['valid_goals']:
        raise HTTPException(400, f"Invalid goal. Valid: {metadata['valid_goals']}")
    if request.user.disease_condition not in metadata['valid_diseases']:
        raise HTTPException(400, f"Invalid disease. Valid: {metadata['valid_diseases']}")

    return run_prediction(
        request.inbody.dict(),
        {'goal':              request.user.goal,
         'activity_level':    request.user.activity_level,
         'fitness_level':     request.user.fitness_level,
         'disease_condition': request.user.disease_condition},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
