import os
import uuid
import numpy as np
import open3d as o3d

from app.core.config import TEMP_POINTCLOUD_DIR


class FusionService:
    def __init__(self):
        os.makedirs(TEMP_POINTCLOUD_DIR, exist_ok=True)

    def fuse(self, cloud_a_path: str, cloud_b_path: str):
        cloud_a = o3d.io.read_point_cloud(cloud_a_path)
        cloud_b = o3d.io.read_point_cloud(cloud_b_path)

        if cloud_a.is_empty() or cloud_b.is_empty():
            raise Exception("No se puede fusionar una nube vacía")

        threshold = self._calculate_threshold(cloud_a)

        points_a = np.asarray(cloud_a.points)
        points_b = np.asarray(cloud_b.points)

        colors_a = np.asarray(cloud_a.colors)
        colors_b = np.asarray(cloud_b.colors)

        tree_b = o3d.geometry.KDTreeFlann(cloud_b)

        fused_points = []
        fused_colors = []

        used_b = set()

        for index_a, point_a in enumerate(points_a):
            _, indices, distances = tree_b.search_knn_vector_3d(
                point_a,
                1
            )

            if len(indices) == 0:
                continue

            index_b = indices[0]
            distance = np.sqrt(distances[0])

            if distance <= threshold:
                point_b = points_b[index_b]

                fused_point = (point_a + point_b) / 2.0

                color_a = colors_a[index_a] if len(colors_a) > 0 else np.array([1, 1, 1])
                color_b = colors_b[index_b] if len(colors_b) > 0 else np.array([1, 1, 1])

                fused_color = (color_a + color_b) / 2.0

                fused_points.append(fused_point)
                fused_colors.append(fused_color)

                used_b.add(index_b)
            else:
                fused_points.append(point_a)

                color_a = colors_a[index_a] if len(colors_a) > 0 else np.array([1, 1, 1])
                fused_colors.append(color_a)

        for index_b, point_b in enumerate(points_b):
            if index_b in used_b:
                continue

            fused_points.append(point_b)

            color_b = colors_b[index_b] if len(colors_b) > 0 else np.array([1, 1, 1])
            fused_colors.append(color_b)

        fused_cloud = o3d.geometry.PointCloud()
        fused_cloud.points = o3d.utility.Vector3dVector(
            np.array(fused_points)
        )
        fused_cloud.colors = o3d.utility.Vector3dVector(
            np.array(fused_colors)
        )

        voxel_size = self._calculate_voxel_size(fused_cloud)
        fused_cloud = fused_cloud.voxel_down_sample(voxel_size)

        output_path = self._save_cloud(fused_cloud)

        return {
            "fused": output_path,
            "threshold": threshold,
            "points": len(fused_cloud.points),
        }

    def _calculate_threshold(self, cloud):
        bbox = cloud.get_axis_aligned_bounding_box()
        size = bbox.get_extent()
        max_dim = max(size)

        return max_dim * 0.025

    def _calculate_voxel_size(self, cloud):
        bbox = cloud.get_axis_aligned_bounding_box()
        size = bbox.get_extent()
        max_dim = max(size)

        return max_dim * 0.003

    def _save_cloud(self, cloud):
        filename = f"fusion_{uuid.uuid4()}.ply"
        output_path = os.path.join(
            TEMP_POINTCLOUD_DIR,
            filename
        )

        o3d.io.write_point_cloud(output_path, cloud)

        return output_path