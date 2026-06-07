"use client";

import { useState } from "react";
import { segmentImage } from "@/services/segmentation.service";
import { Point } from "@/types/segmentation";

export function useSegmentation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mask, setMask] = useState<string | null>(null);

  async function runSegmentation(file: File, points: Point[]) {
    try {
      setLoading(true);
      setError(null);

      const maskUrl = await segmentImage(file, points);

      setMask(maskUrl);
    } catch (err) {
      console.error(err);

      setError("Error al segmentar");
    } finally {
      setLoading(false);
    }
  }

  return {loading, error, mask, runSegmentation};
}