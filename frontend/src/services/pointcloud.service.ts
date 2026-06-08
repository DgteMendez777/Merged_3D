import { API_URL } from "@/lib/api";
import { DepthModel } from "@/types/depth-model";
import { Point } from "@/types/segmentation"

export async function generatePointCloud(file: File, points: Point[], model: DepthModel){
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
    formData.append("model", model);

    const response = await fetch(
        `${API_URL}/pointcloud`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Error generando nube");
    }

    const blob = await response.blob();

    return URL.createObjectURL(blob);
}