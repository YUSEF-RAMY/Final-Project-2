import json
import time
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
load_dotenv()
app = FastAPI(title="InBody AI Extractor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
def process_inbody_image(image_bytes):
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"status": "error", "message": "Invalid image file"}

        h, w = img.shape[:2]
        max_width = 1200
        if w > max_width:
            scale = max_width / w
            img = cv2.resize(img, (max_width, int(h * scale)), interpolation=cv2.INTER_AREA)
        
        _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
        compressed_image_data = buffer.tobytes()

        prompt = """
        You are an expert medical data extractor. Analyze this InBody report image.
        Extract the following fields and return them STRICTLY as a JSON object. 
        Do not include any other text, just the JSON.
        
        Rules:
        - Height must be in meters (e.g., 1.85).
        - Weight must be in kg (e.g., 72.8).
        - If a value is missing or unreadable, set it to null.
        - Muscle mass is SMM (Skeletal Muscle Mass).
        - Body fat percentage is PBF.
        
        JSON structure to follow:
        {
          "height": null,
          "weight": null,
          "age": null,
          "gender": null,
          "muscle_mass": null,
          "body_fat_percentage_(pbf)": null,
          "body_fat_mass": null,
          "water": null,
          "protein": null,
          "minerals": null,
          "bmi": null,
          "measured_at": null
        }
        """

        models_to_try = [
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite"
        ]

        response = None
        used_model = ""

        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(data=compressed_image_data, mime_type="image/jpeg"),
                        prompt
                    ]
                )
                used_model = model_name
                break 
                
            except Exception as e:
                error_msg = str(e)
                if "429" in error_msg or "503" in error_msg:
                    time.sleep(2)
                else:
                    raise e 

        if response is None:
            return {"status": "error", "message": "All AI models are currently busy."}

        result_text = response.text.strip()
        if result_text.startswith("```json"): result_text = result_text[7:]
        if result_text.startswith("```"): result_text = result_text[3:]
        if result_text.endswith("```"): result_text = result_text[:-3]

        data = json.loads(result_text.strip())

        final_data = {}
        for key, value in data.items():
            if value is None:
                if key == "age": final_data[key] = 0
                else: final_data[key] = "0.00"
            else:
                if key not in ["gender", "measured_at"]:
                    try:
                        final_data[key] = f"{float(value):.2f}"
                    except:
                        final_data[key] = value
                else:
                    final_data[key] = value

        return {
            "status": "success",
            "status_code": 200,
            "message": f"Extracted using API",
            "data": final_data
        }

    except json.JSONDecodeError:
        return {"status": "error", "message": "AI returned invalid JSON."}
    except Exception as e:
        return {"status": "error", "message": str(e)}



@app.get("/")
def read_root():
    return {"message": "InBody AI Extractor is running! Send a POST request to /extract-inbody"}


@app.post("/extract-inbody")
async def extract_inbody(file: UploadFile = (...)):

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")
    
    try:
        image_bytes = await file.read()
        
        result = process_inbody_image(image_bytes)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("Starting InBody AI API Server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)