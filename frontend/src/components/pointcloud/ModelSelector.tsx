"use client";

import { DepthModel } from "@/types/depth-model";

interface Props {
  title: string;
  model: DepthModel;
  onChange: (value: DepthModel) => void;
}

export default function ModelSelector({ title, model, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
        {title}
      </label>

      <select
        value={model}
        onChange={(e) => onChange(e.target.value as DepthModel)}
        className="w-full rounded-xl border border-(--border) bg-(--card) p-3 text-sm focus:outline-none focus:border-(--primary) transition"
      >
        <option value="depth_anything">Depth Anything V2</option>
        <option value="midas">MiDaS DPT Large</option>
        <option value="adabins">AdaBins</option>
        <option value="metric3d">
  Metric3D
</option>
      </select>
    </div>
  );
}