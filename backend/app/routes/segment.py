from fastapi import APIRouter, UploadFile, File, Form
import numpy as np
import cv2

router = APIRouter()
sam_service = None

def set_sam_service(service):
    global sam_service
    sam_service = service
    
@router.post("/segment")
async def segment_image(
    file: UploadFile = File(...),
    x: int = Form(...),
    y: int = Form(...)
):
    image_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    sam_service.load_image(image)
    mask = sam_service.predict(x, y)
    
    return{ "mask": mask.tolist() }