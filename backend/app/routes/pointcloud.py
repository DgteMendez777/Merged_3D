from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
import cv2
import numpy as np
import json

router = APIRouter()
pointcloud_service = None
pointcloud_service_midas = None

def set_pointcloud_service(depth_anything_service, midas_service):
    global pointcloud_service
    global pointcloud_service_midas
    pointcloud_service = depth_anything_service
    pointcloud_service_midas = midas_service
    
@router.post("/pointcloud")
async def generate_pointcloud(file: UploadFile = File(...), points: str = Form(...), model: str = Form(...)):
    points_data = json.loads(points)
    image_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    service = (pointcloud_service_midas if model == "midas" else pointcloud_service)
    ply_path = service.generate(image, points_data)
    
    return FileResponse(
        ply_path,
        media_type = "application/octet-stream",
        filename = "pointcloud.ply"
    )