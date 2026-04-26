from ultralytics import YOLO
from huggingface_hub import hf_hub_download

def load_model():
    model_path = hf_hub_download(
        repo_id="Heba15/healthify-inbody-ai-vision",
        filename="best.pt"
    )
    model = YOLO(model_path)
    return model