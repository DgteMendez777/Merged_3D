"use client";

import { Point } from "@/types/segmentation";
import PointMarker from "./PointMarker";
import { getImageCoordinates } from "@/utils/imageCoordinates";

interface Props {
  imageUrl: string;
  points: Point[];
  isAddingPoint: boolean;
  onCreatePoint: (point: Point) => void;
  activePoint: number | null;
  onUpdatePoint: (point: Point) => void;
}

export default function ImageCanvas({imageUrl, points, isAddingPoint, onCreatePoint, activePoint, onUpdatePoint}: Props) {
  return (
    <div className="bg-(--background-secondary) border border-(--border) rounded-3xl p-8 flex justify-center items-center min-h-[650px]">
      <div className="relative inline-block">
        <img src={imageUrl} alt="preview" className="max-h-[700px] w-auto cursor-crosshair select-none"
          onClick={(e) => {
            if (!isAddingPoint && activePoint === null)
              return;

            const img = e.currentTarget;
            const {displayX, displayY, realX, realY} = getImageCoordinates(e, img);
            const pointData = {x: realX, y: realY, displayX, displayY, label: 1 as 0 | 1};

            if (activePoint !== null) {
              onUpdatePoint(pointData);
            } else {
              onCreatePoint(pointData);
            }
          }}
        />

        {points.map((point, index) => (
            <PointMarker key={index} x={point.displayX} y={point.displayY} label={index + 1}/>
          )
        )}
      </div>
    </div>
  );
}