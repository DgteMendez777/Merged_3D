"use client";

import { useState } from "react";
import { generatePointCloud } from "@/services/pointcloud.service";
import { Point } from "@/types/segmentation";
import { DepthModel } from "@/types/depth-model";
import { API_URL } from "@/lib/api"; // 👈 CORREGIDO: Importamos tu constante real

export function usePointCloud() {
  const [loading, setLoading] = useState(false);
  const [pointCloudA, setPointCloudA] = useState<string | null>(null);
  const [pointCloudB, setPointCloudB] = useState<string | null>(null);

  const runPointCloud = async (
    file: File,
    points: Point[],
    modelA: DepthModel,
    modelB: DepthModel
  ) => {
    setLoading(true);

    try {
      const result = await generatePointCloud(file, points, modelA, modelB);

      // Limpiamos y unificamos las URLs usando tu API_URL ("http://127.0.0.1:8000")
      const urlA = result.ply_a.startsWith("http")
        ? result.ply_a
        : `${API_URL}/${result.ply_a.replace(/^\//, "")}`;

      const urlB = result.ply_b.startsWith("http")
        ? result.ply_b
        : `${API_URL}/${result.ply_b.replace(/^\//, "")}`;

      console.log("Nubes listas en el origen correcto:");
      console.log("A ->", urlA);
      console.log("B ->", urlB);

      setPointCloudA(urlA);
      setPointCloudB(urlB);

    } catch (error) {
      console.error("Error al generar las nubes de puntos en el hook:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    pointCloudA,
    pointCloudB,
    runPointCloud
  };
}