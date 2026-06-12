import { API_URL } from "@/lib/api";
import { DepthModel } from "@/types/depth-model";
import { Point } from "@/types/segmentation";

export async function generatePointCloud(
  file: File,
  points: Point[],
  modelA: DepthModel,
  modelB: DepthModel
) {
  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "points",
    JSON.stringify(points.map(p => ({
      x: p.x,
      y: p.y,
      label: p.label
    })))
  );

  formData.append("model_a", modelA);
  formData.append("model_b", modelB);

  const response = await fetch(`${API_URL}/pointcloud`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error generando nube");
  }

  return response.json();
}