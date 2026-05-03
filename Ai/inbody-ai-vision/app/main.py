import re
import numpy as np
import cv2
import os
from io import BytesIO
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from huggingface_hub import hf_hub_download
from ultralytics import YOLO
from paddleocr import PaddleOCR

app = FastAPI(title="InBody OCR API ")

# --- تجهيز المسارات ---
UPLOAD_DIR = "static/crops"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 1. تحميل الموديلات
MODEL_PATH = r"D:/Nutrition/inbody1_model-20260316T114557Z-1-001/inbody1_model/weights/best.pt"
yolo_model = YOLO(MODEL_PATH)
ocr_model = PaddleOCR(lang="en", use_angle_cls=True, use_gpu=False, show_log=False)

DATE_PATTERN = r'\d{4}[\./-]\d{2}[\./-]\d{2}'
TIME_PATTERN = r'\d{2}:\d{2}(:\d{2})?'


# 2. الدوال الهندسية
def order_points(pts):
    pts = np.array(pts, dtype="float32")
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0], rect[2] = pts[np.argmin(s)], pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1], rect[3] = pts[np.argmin(diff)], pts[np.argmax(diff)]
    return rect


def crop_obb(image, points):
    pts = order_points(points)
    (tl, tr, br, bl) = pts
    width = int(max(np.linalg.norm(tr - tl), np.linalg.norm(br - bl)))
    height = int(max(np.linalg.norm(bl - tl), np.linalg.norm(br - tr)))
    dst = np.array([[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]], dtype="float32")
    M = cv2.getPerspectiveTransform(pts, dst)
    return cv2.warpPerspective(image, M, (width, height))


# 3. الـ API الرئيسي
@app.post("/predict/")
async def predict(image: UploadFile = File(...)):
    try:
        img_data = await image.read()
        img_pil = Image.open(BytesIO(img_data)).convert("RGB")
        img_np = np.array(img_pil)

        results = yolo_model(img_np)

        if not results or results[0].obb is None or len(results[0].obb.cls) == 0:
            return JSONResponse(status_code=400, content={"error": "Not an InBody report."})

        boxes = results[0].obb.xyxyxyxy.cpu().numpy()
        classes = results[0].obb.cls.cpu().numpy().astype(int)
        class_names = results[0].names

        response_data = {
            "data": {
                "height": None, "age": None, "gender": None, "datetime": "",
                "weight": None, "smm": None, "body_fat_mass": None,
                "water": None, "protein": None, "minerals": None,
                "bmi": None, "pbf": None,
                "segmental_lean_image": None,  # روابط صور فقط
                "segmental_fat_image": None
            }
        }

        d = response_data["data"]

        for box, cls in zip(boxes, classes):
            label = class_names[cls]
            crop = crop_obb(img_np, box.reshape(4, 2))

            # حفظ الصورة المقصوصة
            img_filename = f"{label}_{image.filename}"
            img_path = os.path.join(UPLOAD_DIR, img_filename)
            cv2.imwrite(img_path, cv2.cvtColor(crop, cv2.COLOR_RGB2BGR))

            # منطق التعامل مع الأجزاء
            if label == "inbody_segmental":
                d["segmental_lean_image"] = f"/static/crops/{img_filename}"
                continue  # تخطي الـ OCR لهذا الجزء بناءً على طلبك

            elif label == "inbody_segmental_2":
                d["segmental_fat_image"] = f"/static/crops/{img_filename}"
                continue  # تخطي الـ OCR لهذا الجزء بناءً على طلبك

            # تشغيل OCR فقط للأجزاء التي نحتاج منها أرقام نصية
            ocr_res = ocr_model.ocr(crop, cls=True)
            if not ocr_res or ocr_res[0] is None:
                continue
            lines = ocr_res[0]

            if label == "inbody_info":
                for line in lines:
                    text = str(line[1][0]).strip()
                    if line[1][1] < 0.4: continue
                    t_low = text.lower()
                    if t_low in ["male", "female", "m", "f"]:
                        d["gender"] = t_low
                    elif "cm" in t_low:
                        val = "".join(filter(lambda x: x.isdigit() or x == '.', text))
                        if val: d["height"] = float(val)
                    elif re.search(DATE_PATTERN, text) or re.search(TIME_PATTERN, text):
                        d["datetime"] = (d["datetime"] + " " + text).strip()
                    elif text.isdigit() and 5 <= int(text) <= 110:
                        d["age"] = int(text)

            elif label == "inbody_muscle":
                nums = []
                for line in lines:
                    text = str(line[1][0]).strip()
                    match = re.search(r'\d+\.\d+', text)
                    if match:
                        nums.append({"val": float(match.group()), "y": line[0][0][1]})
                nums.sort(key=lambda x: x['y'])
                if len(nums) >= 1: d["weight"] = nums[0]["val"]
                if len(nums) >= 2: d["smm"] = nums[1]["val"]
                if len(nums) >= 3: d["body_fat_mass"] = nums[2]["val"]

            elif label == "inbody_composition":
                comp_nums = []
                for line in lines:
                    text = str(line[1][0]).strip()
                    match = re.search(r'\d+\.\d+', text)
                    if match:
                        comp_nums.append({"val": float(match.group()), "y": line[0][0][1]})
                comp_nums.sort(key=lambda x: x['y'])
                keys = ["water", "protein", "minerals", "body_fat_mass", "weight"]
                for i, res in enumerate(comp_nums[:5]):
                    if i < len(keys): d[keys[i]] = res["val"]

        # الحسابات التلقائية
        if d["weight"] and d["height"]:
            height_m = d["height"] / 100
            d["bmi"] = round(d["weight"] / (height_m ** 2), 2)
        if d["body_fat_mass"] and d["weight"]:
            d["pbf"] = round((d["body_fat_mass"] / d["weight"]) * 100, 1)

        return JSONResponse(content=response_data)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})