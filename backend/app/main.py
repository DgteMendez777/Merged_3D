from fastapi import FastAPI
from app.services.sam_service import SAMService
from app.routes.segment import router as segment_router, set_sam_service

app = FastAPI(
    title="Merged 3D API",
    description="API para reconstruccion 3D con IA",
    version="1.0.0"
)

sam = SAMService("models/sam/sam_vit_b_01ec64.pth")
set_sam_service(sam)
app.include_router(segment_router)

@app.get("/")
def read_root():
    return {"message": "Merged 3D API funcionando"}

@app.get("/health")
def health_check():
    return {"status": "ok"}