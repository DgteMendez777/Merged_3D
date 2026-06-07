from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.segment import router as segment_router
from app.routes.segment import set_sam_service
from app.services.sam_service import SAMService
from app.core.config import SAM_MODEL_PATH, ALLOWED_ORIGINS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

sam_service = SAMService(model_path=SAM_MODEL_PATH)

set_sam_service(sam_service)
app.include_router(segment_router)