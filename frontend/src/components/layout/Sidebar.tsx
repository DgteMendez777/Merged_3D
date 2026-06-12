"use client";

import { Point } from "@/types/segmentation";
import ViewSelector from "./ViewSelector";
import ModelSelector from "@/components/pointcloud/ModelSelector";
import { DepthModel } from "@/types/depth-model";

interface Props {
  points: Point[]; 
  activePoint: number | null;

  onAddPoint: () => void;
  onDeletePoint: (index: number) => void;
  onEditPoint: (index: number) => void;
  onResetImage: () => void;
  
  viewMode: "original" | "mask" | "overlay" | "pointcloud";
  onChangeViewMode: (mode: "original" | "mask" | "overlay" | "pointcloud") => void;

  depthModel: DepthModel;
  onChangeDepthModel: (model: DepthModel) => void;

  modelA: DepthModel;
  modelB: DepthModel;

  onChangeModelA: (m: DepthModel) => void;
  onChangeModelB: (m: DepthModel) => void;
}

export default function Sidebar({
  points,
  activePoint,
  onAddPoint,
  onDeletePoint,
  onEditPoint,
  onResetImage,
  viewMode,
  onChangeViewMode,
  modelA,
  modelB,
  onChangeModelA,
  onChangeModelB
}: Props) {
  return (
    <aside className="w-80 min-h-screen bg-(--background-secondary) border-r border-(--border) p-6 flex flex-col gap-6 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-(--primary)">
          Merge3D
        </h1>
        <p className="text-sm text-(--text-secondary) mt-1">
          Segmentación interactiva
        </p>
      </div>

      <button onClick={onResetImage} className="w-full py-3 rounded-xl border border-(--border) bg-(--card) hover:border-(--primary) transition text-sm font-medium">
        Nueva imagen
      </button>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">
            Puntos
          </h2>
          <button onClick={onAddPoint} className="w-8 h-8 rounded-lg bg-(--primary) hover:bg-(--primary-hover) transition font-bold flex items-center justify-center">
            +
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {points.map((point, index) => (
            <div key={index} className={`rounded-xl p-3 border transition ${activePoint === index ? "border-(--primary) bg-(--card)" : "border-(--border)"}`}>
              <button className="w-full text-left">
                <p className="font-medium text-sm">
                  Punto {index + 1}
                </p>
                <p className="text-xs text-(--text-secondary)">
                  X: {point.x} | Y: {point.y}
                </p>
              </button>
              <div className="flex gap-2 mt-2">
                <button onClick={() => onEditPoint(index)} className="flex-1 rounded-lg py-1 bg-blue-500/10 hover:bg-blue-500/20 text-xs transition">
                  ✏️
                </button>
                <button onClick={() => onDeletePoint(index)} className="flex-1 rounded-lg py-1 bg-red-500/10 hover:bg-red-500/20 text-xs transition">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <ViewSelector viewMode={viewMode} onChange={onChangeViewMode}/>
      
      <div className="space-y-4 border-t border-(--border) pt-4 mt-auto">
        <h3 className="font-bold text-xs text-(--text-secondary) uppercase tracking-wider">Configuración 3D</h3>
        <ModelSelector title="Nube de Puntos (A)" model={modelA} onChange={onChangeModelA}/>
        <ModelSelector title="Nube de Puntos (B)" model={modelB} onChange={onChangeModelB}/>
      </div>
    </aside>
  );
}