import os
import open3d as o3d
import numpy as np
import uuid

from app.core.config import TEMP_POINTCLOUD_DIR


class PointCloudService:
    def __init__(self, depth_service, sam_service):
        self.depth_service = depth_service
        self.sam_service = sam_service
        os.makedirs(TEMP_POINTCLOUD_DIR, exist_ok=True)

    def generate(self, image: np.ndarray, points_data):
        depth = self.depth_service.predict(image)

        self.sam_service.load_image(image)
        mask = self.sam_service.predict(points_data)

        h, w = depth.shape

        valid = mask & np.isfinite(depth)

        if not np.any(valid):
            raise Exception("No hay puntos válidos para generar la nube")

        depth_values = depth[valid]

        depth_min = depth_values.min()
        depth_max = depth_values.max()

        depth_normalized = (depth - depth_min) / (
            depth_max - depth_min + 1e-8
        )

        xs, ys = np.meshgrid(
            np.arange(w),
            np.arange(h)
        )

        x_centered = xs - (w / 2)
        y_centered = (h / 2) - ys

        z_centered = depth_normalized - depth_normalized[valid].mean()

        points = np.stack(
            (
                x_centered[valid],
                y_centered[valid],
                z_centered[valid] * max(h, w),
            ),
            axis=1
        )

        colors = image[valid] / 255.0

        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points)
        pcd.colors = o3d.utility.Vector3dVector(colors)

        voxel_size = max(h, w) * 0.0005
        pcd = pcd.voxel_down_sample(voxel_size=voxel_size)

        filename = f"{uuid.uuid4()}.ply"
        output_path = os.path.join(TEMP_POINTCLOUD_DIR, filename)

        o3d.io.write_point_cloud(output_path, pcd)

        return output_path