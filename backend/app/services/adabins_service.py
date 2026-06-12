import cv2
import torch
import numpy as np
from PIL import Image
from external.adabins.infer import InferenceHelper

class AdaBinsService:
    def __init__(self, model_path: str):
        print("Setup model adabins")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_path = model_path
        self.model = InferenceHelper(dataset="nyu", device=self.device, model_path=model_path)

    def predict(self, image: np.ndarray):
        pil_image = Image.fromarray(image)

        with torch.no_grad():
            _, depth = self.model.predict_pil(pil_image)

        return depth.squeeze()