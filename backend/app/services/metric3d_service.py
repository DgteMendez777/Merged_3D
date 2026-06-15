import os
import sys
import cv2
import torch
import numpy as np


class Metric3DService:
    def __init__(self, model_path: str, repo_path: str):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        repo_abs_path = os.path.abspath(repo_path)

        if repo_abs_path not in sys.path:
            sys.path.insert(0, repo_abs_path)

        self.model = torch.hub.load(
            repo_abs_path,
            "metric3d_vit_large",
            source="local",
            pretrain=False
        )

        checkpoint = torch.load(
            model_path,
            map_location=self.device
        )

        if "state_dict" in checkpoint:
            checkpoint = checkpoint["state_dict"]

        checkpoint = {
            key.replace("module.", ""): value
            for key, value in checkpoint.items()
        }

        self.model.load_state_dict(
            checkpoint,
            strict=False
        )

        self.model.to(self.device)
        self.model.eval()

    def predict(self, image: np.ndarray):
        original_h, original_w = image.shape[:2]

        input_tensor, pad_info = self._preprocess(image)

        with torch.no_grad():
            pred_depth, confidence, output_dict = self.model.inference(
                {"input": input_tensor}
            )

        depth = pred_depth.squeeze()

        pad_top, pad_bottom, pad_left, pad_right = pad_info

        if pad_bottom > 0:
            depth = depth[pad_top:-pad_bottom, :]
        else:
            depth = depth[pad_top:, :]

        if pad_right > 0:
            depth = depth[:, pad_left:-pad_right]
        else:
            depth = depth[:, pad_left:]

        depth = depth.detach().cpu().numpy()

        depth = cv2.resize(
            depth,
            (original_w, original_h),
            interpolation=cv2.INTER_CUBIC
        )

        return depth

    def _preprocess(self, image: np.ndarray):
        image = image.astype(np.float32)

        original_h, original_w = image.shape[:2]

        input_h = 616
        input_w = 1064

        scale = min(
            input_h / original_h,
            input_w / original_w
        )

        resized_h = int(original_h * scale)
        resized_w = int(original_w * scale)

        resized = cv2.resize(
            image,
            (resized_w, resized_h),
            interpolation=cv2.INTER_LINEAR
        )

        mean = np.array(
            [123.675, 116.28, 103.53],
            dtype=np.float32
        )

        std = np.array(
            [58.395, 57.12, 57.375],
            dtype=np.float32
        )

        resized = (resized - mean) / std

        pad_h = input_h - resized_h
        pad_w = input_w - resized_w

        pad_top = pad_h // 2
        pad_bottom = pad_h - pad_top
        pad_left = pad_w // 2
        pad_right = pad_w - pad_left

        padded = cv2.copyMakeBorder(
            resized,
            pad_top,
            pad_bottom,
            pad_left,
            pad_right,
            cv2.BORDER_CONSTANT,
            value=0
        )

        tensor = torch.from_numpy(
            padded.transpose(2, 0, 1)
        ).unsqueeze(0)

        tensor = tensor.to(self.device)

        return tensor, (
            pad_top,
            pad_bottom,
            pad_left,
            pad_right
        )