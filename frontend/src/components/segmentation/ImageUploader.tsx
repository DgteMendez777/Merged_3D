interface Props {
  onSelect: (file: File) => void;
}

export default function ImageUploader({ onSelect }: Props) {
    return (
        <label className=" flex flex-col items-center justify-center w-full h-52 rounded-2xl border-2 border-dashed border-(--border) bg-(--card) cursor-pointer hover:border-(--primary)   transition">
            <span className="text-lg font-medium">
                Subir Imagen
            </span>
            <span className="text-sm text-(--text-secondary) mt-2">
                PNG, JPG o JPEG
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                onSelect(file);
            }}/>
        </label>
    );
}