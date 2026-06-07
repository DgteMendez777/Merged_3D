from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import Response
import json
import numpy as np
import cv2

router = APIRouter()
sam_service = None

def set_sam_service(service):
    global sam_service
    sam_service = service

@router.post("/segment")
async def segment_image(file: UploadFile = File(...), points: str = Form(...)):
    points_data = json.loads(points)
    image_bytes = await file.read()
    
    image = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    sam_service.load_image(image)
    mask = sam_service.predict(points_data)
    mask_image = (mask.astype(np.uint8) * 255)

    success, buffer = cv2.imencode(
        ".png",
        mask_image
    )

    if not success:
        raise Exception(
            "No se pudo generar la imagen PNG"
        )

    return Response(
        content=buffer.tobytes(),
        media_type="image/png"
    )