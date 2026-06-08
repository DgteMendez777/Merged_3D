from fastapi import APIRouter, UploadFIle, File
from fastapi.responses import Response
import cv2
import numpy as np

router = APIRouter()
midas_service = None

def set_midas_service(service):
    global midas_service
    midas_service = service
    
@router.post("/depth-midas")
async def depth_midas(file: UploadFIle = File(...)):
    pass