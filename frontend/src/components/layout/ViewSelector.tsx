"use client";

interface Props {
  viewMode: | "original" | "mask" | "overlay" | "pointcloud";
  onChange: (mode: | "original" | "mask" | "overlay" | "pointcloud") => void;
}

export default function ViewSelector({viewMode, onChange}: Props) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold">
        Visualización
      </h2>

      <button onClick={() => onChange("original")}
        className={`w-full p-3 rounded-xl border text-left
          ${
            viewMode === "original" ? "border-(--primary) bg-(--card)" : "border-(--border)"
          }
        `}
      >
        Imagen Original
      </button>

      <button onClick={() => onChange("mask")}
        className={`w-full p-3 rounded-xl border text-left
          ${
            viewMode === "mask" ? "border-(--primary) bg-(--card)" : "border-(--border)"
          }
        `}
      >
        Máscara
      </button>

      <button onClick={() => onChange("overlay")}
        className={`w-full p-3 rounded-xl border text-left
          ${
            viewMode === "overlay" ? "border-(--primary) bg-(--card)" : "border-(--border)"
          }
        `}
      >
        Overlay
      </button>

      <button onClick={() => onChange("pointcloud")}
        className={`w-full p-3 rounded-xl border text-left
          ${
            viewMode === "pointcloud" ? "border-(--primary) bg-(--card)" : "border-(--border)"
          }
        `}
      >
        Nube de Puntos 3D
      </button>
    </div>
  );
}