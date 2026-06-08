"use client";

import Sidebar from "@/components/layout/Sidebar";
import ImageUploader from "@/components/segmentation/ImageUploader";
import ImageCanvas from "@/components/segmentation/ImageCanvas";
import ImageViewer from "@/components/segmentation/ImageViewer";
import PointCloudViewer from "@/components/pointcloud/PointCloudViewer";
import { useState } from "react";
import { Point } from "@/types/segmentation";
import { useSegmentation } from "@/hooks/useSegmentation";
import { usePointCloud } from "@/hooks/usePointCloud";

export default function Home() {
  const {loading: segmentationLoading, error, mask, runSegmentation} = useSegmentation();
  const {loading: pointCloudLoading, pointCloudUrl, runPointCloud} = usePointCloud();
  const [viewMode, setViewMode] = useState<"original" | "mask" | "overlay" | "pointcloud">("original");
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

        {imageUrl && mask && (viewMode === "mask" || viewMode === "overlay") && (
          <div className="bg-(--background-secondary) border border-(--border) rounded-3xl p-8 flex justify-center items-center min-h-[650px]">
            <ImageViewer
              imageUrl={imageUrl}
              maskUrl={mask}
              mode={viewMode}
            />
          </div>
        )}

        {
          viewMode === "pointcloud" && pointCloudUrl && (
            <div className="bg-(--background-secondary) border border-(--border) rounded-3xl p-4">
              <PointCloudViewer pointCloudUrl={pointCloudUrl}/>
            </div>
          )
        }

        {points.length > 0 && selectedFile && (
          <button onClick={() => runSegmentation(
            selectedFile,
            points
          )}
          disabled={segmentationLoading}
          className="px-6 py-3 rounded-xl bg-(--primary) hover:bg-(--primary-hover)">
            {segmentationLoading ? "Segmentando..." : "Generar máscara"}
          </button>
        )}

        {points.length > 0 && selectedFile && (
          <button onClick={() => {runPointCloud(selectedFile, points);}}
            disabled={pointCloudLoading}
            className="px-6 py-3 rounded-xl bg-(--primary) hover:bg-(--primary-hover)"
          >
            {pointCloudLoading ? "Generando nube..." : "Generar Nube 3D"}
          </button>
        )}

        {pointCloudUrl && (<p className="text-green-400"> Nube generada correctamente </p>)}

        {error && (
          <p className="text-red-400">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}