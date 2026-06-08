from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.segment import router as segment_router
from app.routes.depth import router as depth_router
from app.routes.pointcloud import router as pointcloud_router
from app.routes.midas import router as midas_router
from app.routes.segment import set_sam_service
from app.routes.depth import set_depth_services
from app.routes.pointcloud import set_pointcloud_service
from app.routes.midas import set_midas_service
from app.services.sam_service import SAMService
from app.services.depth_anything_service import DepthAnythingService
from app.services.point_cloud_service import PointCloudService
from app.services.midas_service import MiDaSService
from app.core.config import SAM_MODEL_PATH, ALLOWED_ORIGINS, DEPTH_ANYTHING_MODEL_PATH, MIDAS_MODEL_PATH

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

sam_service = SAMService(model_path=SAM_MODEL_PATH)
depth_service = DepthAnythingService(model_path=DEPTH_ANYTHING_MODEL_PATH)
midas_service = MiDaSService(model_path=MIDAS_MODEL_PATH)
pointcloud_service = PointCloudService(depth_service, sam_service)

set_sam_service(sam_service)
set_depth_services(depth_service)
set_pointcloud_service(pointcloud_service)
set_midas_service(midas_service)
app.include_router(segment_router)
app.include_router(depth_router)
app.include_router(midas_router)
app.include_router(pointcloud_router)