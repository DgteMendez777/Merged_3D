from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import cv2
import numpy as np

router = APIRouter()
pointcloud_service = None

def set_pointcloud_service(service):
    global pointcloud_service
    pointcloud_service = service
    
@router.post("/pointcloud")
async def generate_pointcloud(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    ply_path = pointcloud_service.generate(image)
    
    return FileResponse(
        ply_path,
        media_type = "application/octet-stream",
        filename = "pointcloud.ply"
    )