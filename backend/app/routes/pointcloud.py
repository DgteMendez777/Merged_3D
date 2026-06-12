from fastapi import APIRouter, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import json
import os

router = APIRouter()

pointcloud_factory = None
sam_service = None

def set_pointcloud_service(factory, sam=None):
    global pointcloud_factory, sam_service
    pointcloud_factory = factory
    sam_service = sam

@router.post("/pointcloud")
async def generate_pointcloud(
    request: Request,
    file: UploadFile = File(...),
    points: str = Form(...),
    model_a: str = Form(...),
    model_b: str = Form(...)
):
    points_data = json.loads(points)

    image_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    if pointcloud_factory is None:
        raise Exception("Pointcloud factory not initialized")

    service_a = pointcloud_factory(model_a)
    service_b = pointcloud_factory(model_b)

    ply_a_path = service_a.generate(image, points_data)
    ply_b_path = service_b.generate(image, points_data)

    base_url = str(request.base_url).rstrip("/")

    ply_a_url = f"{base_url}/pointcloud-files/{os.path.basename(ply_a_path)}"
    ply_b_url = f"{base_url}/pointcloud-files/{os.path.basename(ply_b_path)}"

    return JSONResponse({
        "ply_a": ply_a_url,
        "ply_b": ply_b_url,
        "model_a": model_a,
        "model_b": model_b
    })