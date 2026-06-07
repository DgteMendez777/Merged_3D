"use client";

import Sidebar from "@/components/layout/Sidebar";
import ImageUploader from "@/components/segmentation/ImageUploader";
import ImageCanvas from "@/components/segmentation/ImageCanvas";
import ImageViewer from "@/components/segmentation/ImageViewer";
import { useState } from "react";
import { Point } from "@/types/segmentation";
import { useSegmentation } from "@/hooks/useSegmentation";

export default function Home() {
  const {loading, error, mask, runSegmentation} = useSegmentation();
  const [viewMode, setViewMode] = useState<"original" | "mask" | "overlay">("original");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [activePoint, setActivePoint] = useState<number | null>(null);

  function addPoint() {
    setActivePoint(null);
    setIsAddingPoint(true);
  }

  function createPoint(point: Point) {
    setPoints((prev) => [...prev, point]);

    setActivePoint(null);
    setIsAddingPoint(false);
  }

  function updatePoint(point: Point) {
    if (activePoint === null)
      return;

    const updated = [...points];
    updated[activePoint] = {...point, label: updated[activePoint] ?.label ?? 1};

    setPoints(updated);
    setActivePoint(null);
  }

  function deletePoint(index: number) {
    const updated = points.filter((_, i) => i !== index);

    setPoints(updated);

    if (activePoint === index) {
      setActivePoint(null);
    }
  }

  function editPoint(index: number) {
    setActivePoint(index);
  }

  function resetImage() {
    setImageUrl("");
    setSelectedFile(null);
    setPoints([]);
    setActivePoint(null);
    setIsAddingPoint(false);
  }

  return (
    <main className="flex min-h-screen bg-(--background)">
      <Sidebar
        points={points}
        activePoint={activePoint}
        onAddPoint={addPoint}
        onDeletePoint={deletePoint}
        onEditPoint={editPoint}
        onResetImage={resetImage}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />

      <section className="flex-1 flex flex-col gap-8 p-8">
        <div>
          <h2 className="text-3xl font-bold">
            Segmentación SAM
          </h2>
          <p className="text-(--text-secondary)">
            Selecciona una imagen
            y agrega puntos.
          </p>
        </div>

        {!imageUrl && (
          <ImageUploader 
            onSelect={(file) => {
              setSelectedFile(file);
              setImageUrl(URL.createObjectURL(file));
            }}
          />
        )}

        {imageUrl && viewMode === "original" && (
          <ImageCanvas
            imageUrl={imageUrl}
            points={points}
            isAddingPoint={isAddingPoint}
            activePoint={activePoint}
            onCreatePoint={createPoint}
            onUpdatePoint={updatePoint}
          />
        )}

        {imageUrl && mask && viewMode !== "original" && (
          <div className="bg-(--background-secondary) border border-(--border) rounded-3xl p-8 flex justify-center items-center min-h-[650px]">
            <ImageViewer
              imageUrl={imageUrl}
              maskUrl={mask}
              mode={viewMode}
            />
          </div>
        )}

        {points.length > 0 && selectedFile && (
          <button onClick={() => runSegmentation(
            selectedFile,
            points
          )}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-(--primary) hover:bg-(--primary-hover)">
            {loading ? "Segmentando..." : "Generar máscara"}
          </button>
        )}

        {error && (
          <p className="text-red-400">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}