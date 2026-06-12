import os
import json
import uuid
import copy
import numpy as np
import open3d as o3d

from app.core.config import TEMP_POINTCLOUD_DIR


class ICPService:
    def __init__(self):
        os.makedirs(TEMP_POINTCLOUD_DIR, exist_ok=True)

    def align(self, source_path: str, target_path: str):
        target = o3d.io.read_point_cloud(target_path)
        source = o3d.io.read_point_cloud(source_path)

        if target.is_empty() or source.is_empty():
            raise Exception("Una de las nubes está vacía")

        target_down, source_down, threshold = self._preprocess(
            target,
            source
        )

        initial_transformation = np.identity(4)

        result = o3d.pipelines.registration.registration_icp(
            source_down,
            target_down,
            threshold,
            initial_transformation,
            o3d.pipelines.registration.TransformationEstimationPointToPlane(),
            o3d.pipelines.registration.ICPConvergenceCriteria(
                max_iteration=80
            )
        )

        aligned_target = copy.deepcopy(target)
        aligned_source = copy.deepcopy(source)

        aligned_source.transform(result.transformation)

        aligned_target_path = self._save_cloud(
            aligned_target,
            "aligned_a"
        )

        aligned_source_path = self._save_cloud(
            aligned_source,
            "aligned_b"
        )

        transformation_path = self._save_transformation(
            result.transformation,
            result.fitness,
            result.inlier_rmse
        )

        return {
            "aligned_a": aligned_target_path,
            "aligned_b": aligned_source_path,
            "transformation": transformation_path,
            "fitness": result.fitness,
            "rmse": result.inlier_rmse,
        }

    def _preprocess(self, target, source):
        bbox = target.get_axis_aligned_bounding_box()
        size = bbox.get_extent()
        max_dim = max(size)

        voxel_size = max_dim * 0.006
        threshold = max_dim * 0.06

        target_down = target.voxel_down_sample(voxel_size)
        source_down = source.voxel_down_sample(voxel_size)

        radius = voxel_size * 3

        target_down.estimate_normals(
            o3d.geometry.KDTreeSearchParamHybrid(
                radius=radius,
                max_nn=30
            )
        )

        source_down.estimate_normals(
            o3d.geometry.KDTreeSearchParamHybrid(
                radius=radius,
                max_nn=30
            )
        )

        return target_down, source_down, threshold

    def _save_cloud(self, cloud, prefix: str):
        filename = f"{prefix}_{uuid.uuid4()}.ply"
        output_path = os.path.join(
            TEMP_POINTCLOUD_DIR,
            filename
        )

        o3d.io.write_point_cloud(output_path, cloud)

        return output_path

    def _save_transformation(self, matrix, fitness, rmse):
        filename = f"transformation_{uuid.uuid4()}.json"
        output_path = os.path.join(
            TEMP_POINTCLOUD_DIR,
            filename
        )

        data = {
            "matrix": matrix.tolist(),
            "fitness": fitness,
            "rmse": rmse,
        }

        with open(output_path, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)

        return output_path