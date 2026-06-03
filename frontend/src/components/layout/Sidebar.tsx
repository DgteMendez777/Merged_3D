export default function Sidebar() {
    return (
        <aside className="w-72 border border-(--border) bg-(--background-secondary) rounded-2xl flex flex-col justify-between pt-10 pb-8 px-8 m-6 shadow-xl">
            <div>
                <div className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-(--primary)">
                        Merge3D
                    </h1>
                    <p className="text-xs font-medium text-(--text-secondary) mt-1.5 tracking-wide">
                        Segmentación Inteligente
                    </p>
                </div>
                
                <div className="space-y-5">
                    <div className="bg-(--card) rounded-xl border border-(--border) p-5 shadow-sm hover:border-(--primary)/30 transition-colors">
                        <h3 className="font-semibold text-white text-base">Imagen</h3>
                        <p className="text-sm text-(--text-secondary) mt-1.5 leading-relaxed">
                            Selecciona una imagen para comenzar.
                        </p>
                    </div>
                    
                    <div className="bg-(--card) rounded-xl border border-(--border) p-5 shadow-sm hover:border-(--primary)/30 transition-colors">
                        <h3 className="font-semibold text-white text-base">Segmentación</h3>
                        <p className="text-sm text-(--text-secondary) mt-1.5 leading-relaxed">
                            Marca un punto sobre el objeto.
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-[11px] text-(--text-secondary)/50 font-mono tracking-wider pt-4 border-t border-(--border)/40">
                MERGE3D SYSTEM ENGINE
            </div>
        </aside>
    );
}