import os
import cv2
import open3d as o3d
import numpy as np
from app.core.config import (TEMP_POINTCLOUD_DIR)
from app.services.depth_anything_service import (DepthAnythingService)

class PointCloudService:
    def __init__(self, depth_service):
        self.depth_service = depth_service
        os.makedirs(TEMP_POINTCLOUD_DIR, exist_ok=True)
        
    def generate(self, image: np.ndarray):
        depth = self.depth_service.predict(image)
        h, w = depth.shape
        xs, ys = np.meshgrid(np.arange(w), np.arange(h))
        points = np.stack(
            (
                xs.flatten(),
                ys.flatten(),
                depth.flatten()
            ),
            axis = 1
        )
        
        colors = (image.reshape(-1, 3) / 255.0)
        
        pcd = o3d.geometry.PointCloud()
        pcd.points = (o3d.utility.Vector3dVector(points))
        pcd.colors = (o3d.utility.Vector3dVector(colors))
        
        output_path = (f"{TEMP_POINTCLOUD_DIR}/pointcloud.ply")
        o3d.io.write_point_cloud(output_path, pcd)
        
        return output_path