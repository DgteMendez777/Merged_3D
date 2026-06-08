from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
import cv2
import json
import numpy as np

router = APIRouter()
pointcloud_midas_service = None

def set_pointcloud_midas_service(service):
    global pointcloud_midas_service
    pointcloud_midas_service = service

@router.post("/pointcloud-midas")
async def generate_pointcloud_midas(file: UploadFile = File(...), points: str = Form(...)):
    points_data = json.loads(points)
    image_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    ply_path = pointcloud_midas_service.generate(image, points_data)

    return FileResponse(
        ply_path,
        media_type="application/octet-stream",
        filename="pointcloud_midas.ply"
    )