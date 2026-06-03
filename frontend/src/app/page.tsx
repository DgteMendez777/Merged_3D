"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ImageUploader from "@/components/segmentation/ImageUploader";
import ImageCanvas from "@/components/segmentation/ImageCanvas";
import { Point } from "@/types/segmentation";

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [point, setPoint] = useState<Point | null>(null);

  return (
    <main className="flex min-h-screen bg-(--background)">
      <Sidebar />
      
      <section className="flex-1 flex flex-col gap-8 p-8 overflow-auto">
        <div>
          <h2 className="text-3xl font-bold">
            Segmentación SAM
          </h2>
          <p className="text-(--text-secondary) mt-1">
            Selecciona una imagen y marca un punto.
          </p>
        </div>

        <div className="flex-1 w-full">
          {!imageUrl && (
            <ImageUploader onSelect={(file) => { setImageUrl(URL.createObjectURL(file)); }} />
          )}
          {imageUrl && (
            <ImageCanvas imageUrl={imageUrl} point={point} onPointSelect={setPoint} />
          )}
        </div>

        {point && (
          <div className="bg-(--card) border border-(--border) rounded-xl p-4 max-w-xs">
            <p className="text-sm text-(--text-secondary)">Punto seleccionado:</p>
            <p className="text-(--primary) font-semibold mt-1">
              X: {point.x} | Y: {point.y}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}