import { useState } from "react";
import { generatePointCloud } from "@/services/pointcloud.service";
import { Point } from "@/types/segmentation";

export function usePointCloud() {
    const [loading, setLoading] = useState(false);
    const [pointCloudUrl, setPointCloudUrl] = useState<string | null>(null);

    async function runPointCloud(file: File, points: Point[]) {
        try {
            setLoading(true);
            const url = await generatePointCloud(file, points);
            setPointCloudUrl(url);
        } finally {
            setLoading(false);
        }
    }

    return {loading, pointCloudUrl, runPointCloud};
}