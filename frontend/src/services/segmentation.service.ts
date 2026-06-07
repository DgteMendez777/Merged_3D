import { API_URL } from "@/lib/api";
import { Point } from "@/types/segmentation";

export async function segmentImage(file: File, points: Point[]) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "points",
    JSON.stringify(
      points.map((p) => ({
        x: p.x,
        y: p.y,
        label: p.label,
      }))
    )
  );

  const response = await fetch(
    `${API_URL}/segment`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      "Error al segmentar"
    );
  }

  const blob = await response.blob();

  return URL.createObjectURL(blob);
}