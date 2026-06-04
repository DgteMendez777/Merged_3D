from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.segment import router as segment_router
from app.routes.segment import set_sam_service

from app.services.sam_service import SAMService

app = FastAPI()

# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# SAM
# ==========================

sam_service = SAMService(
    model_path="models/sam/sam_vit_l_0b3195.pth"
)

set_sam_service(sam_service)

# ==========================
# ROUTES
# ==========================

app.include_router(segment_router)