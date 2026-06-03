"use client";

import { Point } from "@/types/segmentation";
import PointMarker from "./PointMarker";

interface Props {imageUrl: string; point: Point | null; onPointSelect: (point: Point) => void;}

export default function ImageCanvas({imageUrl, point, onPointSelect,}: Props) {
    return (
        <div className="bg-(--background-secondary) border border-(--border) rounded-3xl p-8 flex justify-center items-center min-h-[650px]">
            <div className="relative inline-block">
                <img src={imageUrl} alt="preview" className="max-h-[700px] w-auto cursor-crosshair select-none"
                    onClick={(e) => {const rect = e.currentTarget.getBoundingClientRect();
                    onPointSelect({
                        x: Math.round(e.clientX - rect.left),
                        y: Math.round(e.clientY - rect.top),
                    });
                }}/>

                {point && (<PointMarker x={point.x} y={point.y}/>)}
            </div>
        </div>
    );
}