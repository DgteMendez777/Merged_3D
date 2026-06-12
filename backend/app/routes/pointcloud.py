from fastapi import APIRouter, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import json
import os
from app.services.fusion_service import FusionService

from app.services.icp_service import ICPService

router = APIRouter()

pointcloud_factory = None
sam_service = None


def set_pointcloud_service(factory, sam=None):
    global pointcloud_factory, sam_service
    pointcloud_factory = factory
    sam_service = sam


def to_public_url(request: Request, path: str):
    base_url = str(request.base_url).rstrip("/")
    filename = os.path.basename(path)

    return f"{base_url}/pointcloud-files/{filename}"


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

    image = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    if pointcloud_factory is None:
        raise Exception("Pointcloud factory not initialized")

    service_a = pointcloud_factory(model_a)
    service_b = pointcloud_factory(model_b)

    ply_a_original = service_a.generate(
        image,
        points_data
    )

    ply_b_original = service_b.generate(
        image,
        points_data
    )

    icp_service = ICPService()

    icp_result = icp_service.align(
        source_path=ply_b_original,
        target_path=ply_a_original
    )
    
    fusion_service = FusionService()

    fusion_result = fusion_service.fuse(
        cloud_a_path=icp_result["aligned_a"],
        cloud_b_path=icp_result["aligned_b"]
    )

    return JSONResponse({
        "model_a": model_a,
        "model_b": model_b,
    
        "ply_a_original": to_public_url(request, ply_a_original),
        "ply_b_original": to_public_url(request, ply_b_original),
    
        "ply_a": to_public_url(request, icp_result["aligned_a"]),
        "ply_b": to_public_url(request, icp_result["aligned_b"]),
    
        "fusion": to_public_url(request, fusion_result["fused"]),
    
        "transformation": to_public_url(request, icp_result["transformation"]),
    
        "fitness": icp_result["fitness"],
        "rmse": icp_result["rmse"],
        "fusion_threshold": fusion_result["threshold"],
        "fusion_points": fusion_result["points"],
    })