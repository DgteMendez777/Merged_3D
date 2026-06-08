"use client";

import { DepthModel } from "@/types/depth-model";

interface Props {
    model: DepthModel;
    onChange: (value: DepthModel) => void;
}

export default function ModelSelector({model, onChange}: Props) {
    return (
        <div className="space-y-2">
            <label className="font-semibold">
                Modelo de profundidad
            </label>

            <select value={model} onChange={(e) => onChange(
                        e.target.value as DepthModel
                    )}
                className="w-full rounded-xl border border-(--border) bg-(--card) p-3"
            >
                <option value="depth_anything">
                    Depth Anything V2
                </option>
                <option value="midas">
                    MiDaS DPT Large
                </option>
            </select>
        </div>
    );
}