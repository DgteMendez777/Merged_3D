import torch
import numpy as np
from external.depth_anything_v2.dpt import DepthAnythingV2

class DepthAnythingService:
    def __init__(self, model_path: str):
        self.device = ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DepthAnythingV2(encoder="vitl")
        self.model.load_state_dict(torch.load(model_path, map_location = self.device))
        self.model.to(self.device)
        self.model.eval()
        
    def predict(self, image: np.ndarray):
        depth = self.model.infer_image(image)
        
        return depth