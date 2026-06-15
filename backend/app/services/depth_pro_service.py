import torch
import numpy as np
import cv2
from PIL import Image
import depth_pro


class DepthProService:
    def __init__(self, model_path: str):
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.model, self.transform = depth_pro.create_model_and_transforms(
            device=self.device,
            precision=torch.float16 if self.device.type == "cuda" else torch.float32,
        )

        self.model.to(self.device)
        self.model.eval()

    def predict(self, image: np.ndarray):
        original_h, original_w = image.shape[:2]

        pil_image = Image.fromarray(image).convert("RGB")

        input_tensor = self.transform(pil_image)

        if input_tensor.dim() == 3:
            input_tensor = input_tensor.unsqueeze(0)

        input_tensor = input_tensor.to(self.device)

        with torch.no_grad():
            prediction = self.model.infer(input_tensor)

        depth = prediction["depth"]

        if isinstance(depth, torch.Tensor):
            depth = depth.squeeze().detach().float().cpu().numpy()

        depth = np.asarray(depth)

        if depth.shape == (original_w, original_h):
            depth = depth.T

        if depth.shape != (original_h, original_w):
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

        return depth