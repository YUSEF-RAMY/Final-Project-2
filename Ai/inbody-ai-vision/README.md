\# 🧠 Healthify InBody AI Vision



An end-to-end AI system that automatically analyzes InBody body composition reports using Computer Vision and OCR, and converts them into structured JSON data.



\---



\## 🚀 Project Overview



This project takes an InBody report image as input and automatically extracts meaningful body metrics using AI.



\### 🔍 What the system does:



\- Detects InBody report sections using YOLO (Object Detection)

\- Crops each detected region from the image

\- Extracts text using PaddleOCR

\- Parses and structures the data into JSON format

\- Computes additional metrics like BMI and PBF



\---



\## 🧩 Tech Stack



\- Python

\- FastAPI

\- Ultralytics YOLO

\- PaddleOCR

\- OpenCV

\- NumPy

\- Pillow



\---



\## ⚙️ System Pipeline



1\. Upload InBody image via API

2\. YOLO detects key report regions

3\. Each region is cropped automatically

4\. OCR extracts text from each region

5\. Data is cleaned and structured

6\. Final metrics are calculated (BMI, PBF)



\---



\## 📡 API Endpoint



\### POST `/predict/`



Upload an InBody image and receive structured body composition results.



\---



\## 📊 Example Output



```json

{

&#x20; "data": {

&#x20;   "height": 155,

&#x20;   "age": 14,

&#x20;   "gender": "male",

&#x20;   "datetime": "2026.03.12.22:55",

&#x20;   "weight": 43.9,

&#x20;   "smm": 19,

&#x20;   "body\_fat\_mass": 8.2,

&#x20;   "water": 26.127,

&#x20;   "protein": 7.4,

&#x20;   "minerals": 7,

&#x20;   "bmi": 18.27,

&#x20;   "pbf": 18.7,

&#x20;   "segmental\_lean\_image": "/static/crops/inbody\_segmental.jpg",

&#x20;   "segmental\_fat\_image": "/static/crops/inbody\_segmental\_2.jpg"

&#x20; }

}

