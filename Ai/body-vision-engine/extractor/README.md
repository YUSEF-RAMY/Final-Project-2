# InBody AI Extractor API

API that extracts InBody data from images using Google Gemini AI.

## 📦 Required Libraries

```bash
pip install fastapi uvicorn opencv-python numpy google-genai
```

## ⚙️ Running

1. Add your API Key in `api.py`
2. Run:
```bash
python api.py
```
The server will start on: `http://localhost:8000`

## 📡 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Check if API is running |
| POST | `/extract-inbody` | Send InBody image and receive JSON data |

## 📊 Extracted Data Example

```json
{
  "height": "1.75",
  "weight": "72.50",
  "age": "25",
  "gender": "male",
  "muscle_mass": "35.20",
  "body_fat_percentage_(pbf)": "15.50",
  "body_fat_mass": "11.24",
  "water": "42.30",
  "protein": "12.80",
  "minerals": "3.50",
  "bmi": "23.67",
  "measured_at": "2024-01-15"
}
```

## 🔧 How it Works

1. **Image Processing**: OpenCV resizes and compresses the image.
2. **AI Extraction**: Gemini reads data from the image.
3. **JSON Output**: Returns the data in a structured format.

## ⚠️ Notes

- Requires an **Internet connection** (AI is online).
- The **API Key** must be valid.
- It only accepts images.
