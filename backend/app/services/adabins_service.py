import os
import sys
import torch
import numpy as np
import cv2
from PIL import Image

ADABINS_REPO_PATH = os.path.abspath("external/adabins")

if ADABINS_REPO_PATH not in sys.path:
    sys.path.insert(0, ADABINS_REPO_PATH)

from infer import InferenceHelper


class AdaBinsService:
    def __init__(self, model_path: str):
        self.device = "cuda:0" if torch.cuda.is_available() else "cpu"

        self.model = InferenceHelper(
            dataset="nyu",
            device=self.device
        )

        self.input_width = 640
        self.input_height = 480

    def predict(self, image: np.ndarray):
        original_h, original_w = image.shape[:2]

        resized = cv2.resize(
            image,
            (self.input_width, self.input_height),
            interpolation=cv2.INTER_AREA
        )

        pil_image = Image.fromarray(resized).convert("RGB")

        with torch.no_grad():
            _, depth = self.model.predict_pil(pil_image)

        depth = np.asarray(depth).squeeze()

        depth = cv2.resize(
            depth,
            (original_w, original_h),
            interpolation=cv2.INTER_CUBIC
        )

        depth = np.nan_to_num(
            depth,
            nan=0.0,
            posinf=0.0,
            neginf=0.0
        )

        valid = depth > 0

        if np.any(valid):
            depth_valid = depth[valid]
            depth_min = depth_valid.min()
            depth_max = depth_valid.max()

            depth = depth_max - depth + depth_min

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        return depth