"use client";

import { Point } from "@/types/segmentation";
import PointMarker from "./PointMarker";

interface Props {
  imageUrl: string;

  points: Point[];

  activePoint: number | null;

  onPointSelect: (
    point: Point
  ) => void;
}

export default function ImageCanvas({
  imageUrl,
  points,
  activePoint,
  onPointSelect,
}: Props) {
  return (
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
      <div className="relative inline-block">
        <img
          src={imageUrl}
          alt="preview"
          className="
          max-h-[700px]
          w-auto
          cursor-crosshair
          select-none
        "
          onClick={(e) => {
            if (activePoint === null)
              return;

            const img =
              e.currentTarget;

            const rect =
              img.getBoundingClientRect();

            const displayX =
              e.clientX - rect.left;

            const displayY =
              e.clientY - rect.top;

            const scaleX =
              img.naturalWidth /
              rect.width;

            const scaleY =
              img.naturalHeight /
              rect.height;

            const realX =
              Math.round(
                displayX * scaleX
              );

            const realY =
              Math.round(
                displayY * scaleY
              );

            onPointSelect({
  x: realX,
  y: realY,

  displayX,
  displayY,

  label:
    points[
      activePoint!
    ]?.label ?? 1,
});
          }}
        />

        {points.map(
          (point, index) => (
            <PointMarker
              key={index}
              x={point.displayX}
              y={point.displayY}
              label={index + 1}
            />
          )
        )}
      </div>
    </div>
  );
}