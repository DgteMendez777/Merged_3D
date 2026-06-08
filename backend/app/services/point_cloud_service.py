import os
import cv2
import open3d as o3d
import numpy as np
from app.core.config import (TEMP_POINTCLOUD_DIR)
import uuid

class PointCloudService:
    def __init__(self, depth_service, sam_service):
        self.depth_service = depth_service
        self.sam_service = sam_service
        os.makedirs(TEMP_POINTCLOUD_DIR, exist_ok=True)
        
    def generate(self, image: np.ndarray, points_data):
        depth = self.depth_service.predict(image)
        self.sam_service.load_image(image)
        mask = self.sam_service.predict(points_data)
        depth_masked = np.where(mask, depth, 0)
        h, w = depth.shape
        xs, ys = np.meshgrid(np.arange(w), np.arange(h))
        valid = depth_masked > 0
        points = np.stack(
            (
                xs[valid],
                ys[valid],
                depth_masked[valid]
            ),
            axis = 1,
        )        
        
        colors = image[valid] / 255.0
        
        pcd = o3d.geometry.PointCloud()
        pcd.points = (o3d.utility.Vector3dVector(points))
        pcd.colors = (o3d.utility.Vector3dVector(colors))
        
        filename = f"{uuid.uuid4()}.ply"
        output_path = os.path.join(TEMP_POINTCLOUD_DIR, filename)
        o3d.io.write_point_cloud(output_path, pcd)
        
        return output_path