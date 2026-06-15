import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes.segment import router as segment_router
from app.routes.depth import router as depth_router
from app.routes.midas import router as midas_router
from app.routes.adabins import router as adabins_router
from app.routes.pointcloud import router as pointcloud_router

from app.routes.segment import set_sam_service
from app.routes.depth import set_depth_service
from app.routes.midas import set_midas_service
from app.routes.adabins import set_adabins_service
from app.routes.pointcloud import set_pointcloud_service

from app.services.sam_service import SAMService
from app.services.depth_anything_service import DepthAnythingService
from app.services.midas_service import MiDaSService
from app.services.adabins_service import AdaBinsService
from app.services.point_cloud_service import PointCloudService
from app.services.metric3d_service import Metric3DService
from app.services.depth_pro_service import DepthProService
from app.routes.pointcloud import set_pointcloud_service as inject_pointcloud_factory

from app.core.config import (
    SAM_MODEL_PATH,
    DEPTH_ANYTHING_MODEL_PATH,
    MIDAS_MODEL_PATH,
    ADABINS_MODEL_PATH,
    ALLOWED_ORIGINS,
    TEMP_POINTCLOUD_DIR,
    METRIC3D_MODEL_PATH,
    METRIC3D_REPO_PATH,
    DEPTH_PRO_MODEL_PATH
)

os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/pointcloud-files", StaticFiles(directory=TEMP_POINTCLOUD_DIR), name="pointcloud-files")

sam_service = SAMService(model_path=SAM_MODEL_PATH)
set_sam_service(sam_service)

def create_depth_service(model: str):
    if model == "midas":
        return MiDaSService(model_path=MIDAS_MODEL_PATH)

    if model == "adabins":
        return AdaBinsService(model_path=ADABINS_MODEL_PATH)
    
    if model == "depth_pro":
        return DepthProService(model_path=DEPTH_PRO_MODEL_PATH)
    
    if model == "metric3d":
        return Metric3DService(
            model_path=METRIC3D_MODEL_PATH,
            repo_path=METRIC3D_REPO_PATH
        )

    return DepthAnythingService(model_path=DEPTH_ANYTHING_MODEL_PATH)


def create_pointcloud_service(model: str):
    depth_service = create_depth_service(model)
    return PointCloudService(depth_service, sam_service)

set_depth_service(None)
set_midas_service(None)
set_adabins_service(None)

inject_pointcloud_factory(create_pointcloud_service, sam_service)

app.include_router(segment_router)
app.include_router(depth_router)
app.include_router(midas_router)
app.include_router(adabins_router)
app.include_router(pointcloud_router)