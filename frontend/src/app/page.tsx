"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import ImageUploader from "@/components/segmentation/ImageUploader";
import ImageCanvas from "@/components/segmentation/ImageCanvas";

import { Point } from "@/types/segmentation";

import {
  useSegmentation,
} from "@/hooks/useSegmentation";

import ImageViewer
from "@/components/segmentation/ImageViewer";

export default function Home() {
  const {
    loading,
    error,
    mask,
    runSegmentation,
  } = useSegmentation();

  const [viewMode, setViewMode] =
  useState<
    "original"
    | "mask"
    | "overlay"
  >("original");

  const [imageUrl, setImageUrl] =
    useState("");

  const [selectedFile,
    setSelectedFile] =
    useState<File | null>(null);

  const [points, setPoints] =
    useState<Point[]>([]);

  const [activePoint,
    setActivePoint] =
    useState<number | null>(null);

  const selectedPoint =
  activePoint !== null
    ? points[activePoint]
    : null;

  function addPoint() {
  const newIndex =
    points.length;

  setPoints((prev) => [
    ...prev,
    {
  x: 0,
  y: 0,

  displayX: 0,
  displayY: 0,

  label: 1,
},
  ]);

  setActivePoint(newIndex);
}

  function updatePoint(
    point: Point
  ) {
    if (
      activePoint === null
    )
      return;

    const updated =
      [...points];

    updated[activePoint] = {
  ...point,

  label:
    updated[activePoint]
      ?.label ?? 1,
};

    setPoints(updated);
  }

  function deletePoint(
  index: number
) {
  const updated =
    points.filter(
      (_, i) => i !== index
    );

  setPoints(updated);

  if (activePoint === index) {
    setActivePoint(null);
  }
}

function editPoint(
  index: number
) {
  setActivePoint(index);
}

function resetImage() {
  setImageUrl("");

  setSelectedFile(null);

  setPoints([]);

  setActivePoint(null);
}

  return (
    <main
      className="
      flex
      min-h-screen
      bg-[var(--background)]
    "
    >
      <Sidebar
  points={points}
  activePoint={activePoint}

  onAddPoint={addPoint}

  onSelectPoint={
    setActivePoint
  }

  onDeletePoint={
    deletePoint
  }

  onEditPoint={
    editPoint
  }

  onResetImage={
    resetImage
  }

  viewMode={viewMode}

  onChangeViewMode={
    setViewMode
  }
/>

      <section
        className="
        flex-1
        flex
        flex-col
        gap-8
        p-8
      "
      >
        <div>
          <h2
            className="
            text-3xl
            font-bold
          "
          >
            Segmentación SAM
          </h2>

          <p
            className="
            text-[var(--text-secondary)]
          "
          >
            Selecciona una imagen
            y agrega puntos.
          </p>
        </div>

        {!imageUrl && (
          <ImageUploader
            onSelect={(file) => {
              setSelectedFile(
                file
              );

              setImageUrl(
                URL.createObjectURL(
                  file
                )
              );
            }}
          />
        )}

        {imageUrl &&
 viewMode ===
  "original" && (
  <ImageCanvas
    imageUrl={imageUrl}
    points={points}
    activePoint={
      activePoint
    }
    onPointSelect={
      updatePoint
    }
  />
)}

{imageUrl &&
 mask &&
 viewMode !==
  "original" && (
  <div
    className="
    bg-[var(--background-secondary)]
    border
    border-[var(--border)]
    rounded-3xl
    p-8
    flex
    justify-center
    items-center
    min-h-[650px]
  "
  >
    <ImageViewer
      imageUrl={imageUrl}
      maskUrl={mask}
      mode={viewMode}
    />
  </div>
)}

        {points.some(
  (p) =>
    p.x !== 0 &&
    p.y !== 0
) &&
selectedFile && (
  <button
    onClick={() =>
      runSegmentation(
        selectedFile,
        points.filter(
          (p) =>
            p.x !== 0 &&
            p.y !== 0
        )
      )
    }
    disabled={loading}
    className="
      px-6
      py-3
      rounded-xl
      bg-[var(--primary)]
      hover:bg-[var(--primary-hover)]
    "
  >
    {loading
      ? "Segmentando..."
      : "Generar máscara"}
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