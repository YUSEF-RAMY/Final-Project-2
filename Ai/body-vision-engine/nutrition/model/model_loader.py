from huggingface_hub import hf_hub_download
import keras
import pickle

def load_assets():

    model_path = hf_hub_download("Heba15/inbody_model", "inbody_model.keras")
    scaler_path = hf_hub_download("Heba15/inbody_model", "scaler.pkl")
    encoder_path = hf_hub_download("Heba15/inbody_model", "encoders.pkl")

    model = keras.saving.load_model(model_path)

    scaler = pickle.load(open(scaler_path, "rb"))
    encoder = pickle.load(open(encoder_path, "rb"))

    return model, scaler, encoder