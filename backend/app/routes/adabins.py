from fastapi import APIRouter, UploadFile, File
from fastapi.responses import Response
import cv2
import numpy as np

router = APIRouter()
adabins_service = None

def set_adabins_service(service):
    global adabins_service
    adabins_service = service

@router.post("/depth-adabins")
async def generate_depth_adabins(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    depth = adabins_service.predict(image)
    depth_normalized = cv2.normalize(depth, None, 0, 255, cv2.NORM_MINMAX)
    depth_normalized = depth_normalized.astype(np.uint8)
    success, buffer = cv2.imencode(".png", depth_normalized)

    if not success:
        raise Exception(
            "No se pudo generar profundidad AdaBins"
        )

    return Response(
        content=buffer.tobytes(),
        media_type="image/png"
    )