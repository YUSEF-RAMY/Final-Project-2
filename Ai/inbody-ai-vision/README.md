# 🧠 Healthify InBody AI Vision

An end-to-end AI system that automatically analyzes InBody body composition reports using Computer Vision and OCR, and converts them into structured JSON data.

---

## 🚀 Project Overview

This system takes an InBody report image as input and extracts structured health metrics using AI.

---

## 🔍 What the system does

- Detects InBody report sections using YOLO (Object Detection)
- Crops each detected region from the image
- Extracts text using PaddleOCR
- Parses and structures the data into JSON format
- Computes additional metrics like BMI and PBF

---

## 🧩 Tech Stack

- Python
- FastAPI
- Ultralytics YOLO
- PaddleOCR
- OpenCV
- NumPy
- Pillow

---

## ⚙️ Pipeline

1. Upload InBody image via API  
2. YOLO detects regions  
3. Image cropping  
4. OCR text extraction  
5. Data cleaning & structuring  
6. BMI & PBF calculation  

---

## 📡 API Endpoint

### POST `/predict/`

Upload an InBody image and receive structured body composition results.

---

## 📊 Example Output

```json
{
  "data": {
    "height": 155,
    "age": 14,
    "gender": "male",
    "datetime": "2026.03.12.22:55",
    "weight": 43.9,
    "smm": 19,
    "body_fat_mass": 8.2,
    "water": 26.127,
    "protein": 7.4,
    "minerals": 7,
    "bmi": 18.27,
    "pbf": 18.7,
    "segmental_lean_image": "/static/crops/inbody_segmental.jpg",
    "segmental_fat_image": "/static/crops/inbody_segmental_2.jpg"
  }
}
```

---

## 💡 Key Feature

✔ Real-time medical report parsing  
✔ AI-based detection (YOLO)  
✔ OCR-powered extraction  
✔ Structured medical JSON output  
