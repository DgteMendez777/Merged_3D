import torch
import numpy as np
from segment_anything import sam_model_registry, SamPredictor

class SAMService:
    def __init__(self, model_path: str):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.sam = sam_model_registry["vit_l"](checkpoint = model_path)
        self.sam.to(self.device)
        self.predictor = SamPredictor(self.sam)
        
    def load_image(self, image: np.ndarray):
        self.predictor.set_image(image)
        
    def predict(self, points):
        input_point = np.array([
            [p["x"], p["y"]]
            for p in points
        ])

        input_label = np.ones(
            len(points),
            dtype=np.int32
        )
        
        masks, scores, logits = self.predictor.predict(
            point_coords=input_point,
            point_labels=input_label,
            multimask_output=True
        )
        
        best_mask = masks[np.argmax(scores)]
        return best_mask
