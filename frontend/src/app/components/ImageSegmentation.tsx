import { useRef, useState } from "react";

export default function ImageSegmentation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<string | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setImage(url);
    };

    return (
        <div>
            <h2>Segmentación SAM</h2>
            <input type="file" accept="image/*" onChange={handleUpload} />

            {image && (
                <canvas ref={canvasRef} onClick={() => console.log("click detectado")}/>
            )}
        </div>
    );
}