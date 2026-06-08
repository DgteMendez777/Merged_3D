import cv2
import torch
import numpy as np
from torchvision.transforms import Compose
from external.midas.midas.dpt_depth import DPTDepthModel
from external.midas.midas.transforms import (Resize, NormalizeImage, PrepareForNet)

class MiDaSService:
    def __init__(self, model_path: str):
        self.device = ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DPTDepthModel(path=model_path, backbone="vitl16_384", non_negative=True,)
        self.model.to(self.device)
        self.model.eval()
        
        self.transform = Compose(
            [
                Resize(
                    384,
                    384,
                    resize_target=None,
                    keep_aspect_ratio=True,
                    ensure_multiple_of=32,
                    resize_method="minimal",
                    image_interpolation_method=cv2.INTER_CUBIC,
                ),
                NormalizeImage(
                    mean=[0.5, 0.5, 0.5],
                    std=[0.5, 0.5, 0.5],
                ),
                PrepareForNet(),
            ]
        )

    def predict(self, image: np.ndarray):
        image = image.astype(np.float32) / 255.0
        transformed = self.transform({"image": image})
        input_tensor = (torch.from_numpy(transformed["image"])
            .unsqueeze(0)
            .to(self.device)
        )

        with torch.no_grad():
            prediction = self.model(input_tensor)
            prediction = torch.nn.functional.interpolate(
                prediction.unsqueeze(1),
                size=image.shape[:2],
                mode="bicubic",
                align_corners=False,
            ).squeeze()

        depth = (prediction
            .cpu()
            .numpy()
        )

        return depth