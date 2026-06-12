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
import { DepthModel } from "@/types/depth-model";

export default function Home() {
  const { loading: segmentationLoading, error, mask, runSegmentation } = useSegmentation();
  const { loading: pointCloudLoading, pointCloudA, pointCloudB, runPointCloud } = usePointCloud();
  const [viewMode, setViewMode] = useState<"original" | "mask" | "overlay" | "pointcloud">("original");
  const [depthModel, setDepthModel] = useState<DepthModel>("depth_anything");

  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [points, setPoints] = useState<Point[]>([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [activePoint, setActivePoint] = useState<number | null>(null);

  const [modelA, setModelA] = useState<DepthModel>("depth_anything");
  const [modelB, setModelB] = useState<DepthModel>("midas");

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
    if (activePoint === null) return;

    const updated = [...points];
    updated[activePoint] = {
      ...point,
      label: updated[activePoint]?.label ?? 1,
    };

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
        depthModel={depthModel}
        onChangeDepthModel={setDepthModel}
        modelA={modelA}
        modelB={modelB}
        onChangeModelA={setModelA}
        onChangeModelB={setModelB}
      />

      <section className="flex-1 flex flex-col gap-8 p-8">
        <div>
          <h2 className="text-3xl font-bold">Segmentación SAM y Fusión 3D</h2>
          <p className="text-(--text-secondary)">
            Selecciona una imagen, agrega puntos y proyecta la profundidad en un único escenario.
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

        {imageUrl && mask &&
          (viewMode === "mask" || viewMode === "overlay") && (
            <div className="bg-(--background-secondary) border border-(--border) rounded-3xl p-8 flex justify-center items-center min-h-[650px]">
              <ImageViewer
                imageUrl={imageUrl}
                maskUrl={mask}
                mode={viewMode}
              />
            </div>
          )}

        {viewMode === "pointcloud" && (pointCloudA || pointCloudB) && (
  <div className="bg-(--background-secondary) border border-(--border) rounded-3xl p-6 w-full">
    <div className="w-full flex justify-between items-center mb-4 px-2">
      <span className="text-sm font-semibold text-blue-400">
        Modelo A: {modelA.toUpperCase()}
      </span>

      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-medium border border-emerald-500/20">
        Escenario Fusionado Superpuesto
      </span>

      <span className="text-sm font-semibold text-purple-400">
        Modelo B: {modelB.toUpperCase()}
      </span>
    </div>

    <div className="w-full h-[650px] bg-[#1e1e2e] rounded-2xl border border-(--border) overflow-hidden">
      <PointCloudViewer pointCloudUrls={   [pointCloudA, pointCloudB].filter(Boolean) as string[] }/>
    </div>
  </div>
)}

        <div className="flex gap-4">
          {points.length > 0 && selectedFile && (
            <button
              onClick={() => runSegmentation(selectedFile, points)}
              disabled={segmentationLoading}
              className="px-6 py-3 rounded-xl bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-50 transition"
            >
              {segmentationLoading ? "Segmentando..." : "Generar máscara"}
            </button>
          )}

          {points.length > 0 && selectedFile && (
            <button
              onClick={() => runPointCloud(selectedFile, points, modelA, modelB)}
              disabled={pointCloudLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-medium transition"
            >
              {pointCloudLoading ? "Generando nubes..." : "Generar Nube 3D Comparativa"}
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-400 font-medium">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}