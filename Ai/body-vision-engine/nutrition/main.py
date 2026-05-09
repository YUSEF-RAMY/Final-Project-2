import logging

import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from api.predictor import AIMBodyPredictor
from api.schemas import PredictRequest, PredictResponse
from huggingface_hub import hf_hub_download
# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("aimbody")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI INBody API",
    description="AI-powered personalised nutrition prediction from InBody metrics.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load artifacts once at startup ───────────────────────────────────────────
predictor: AIMBodyPredictor | None = None


@app.on_event("startup")

def load_model() -> None:
    global predictor
    log.info("Loading model artifacts from Hugging Face …")

    model_path = hf_hub_download(
        repo_id="Heba15/inbody_model",
        filename="inbody_model.keras"
    )

    scaler_path = hf_hub_download(
        repo_id="Heba15/inbody_model",
        filename="scaler.pkl"
    )

    encoder_path = hf_hub_download(
        repo_id="Heba15/inbody_model",
        filename="encoder.pkl"
    )

    predictor = AIMBodyPredictor(
        model_path=model_path,
        scaler_path=scaler_path,
        encoder_path=encoder_path,
    )

    log.info("✅ Model ready.")

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health() -> dict:
    """Liveness check."""
    return {"status": "ok", "model_loaded": predictor is not None}


@app.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    tags=["Nutrition"],
    summary="Predict daily nutrition targets from InBody metrics",
)
def predict(req: PredictRequest) -> PredictResponse:
    """
    Accepts InBody-style body composition metrics and returns
    personalised daily nutrition targets:
    **calories**, **protein**, **carbs**, **fat**.
    """
    if predictor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded. Check server logs.",
        )
    try:
        result = predictor.predict(req.model_dump())
        return PredictResponse(**result)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        log.exception("Prediction error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal prediction error.",
        ) from exc


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
