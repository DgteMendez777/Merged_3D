interface Props {
    x: number;
    y: number;
}

export default function PointMarker({ x, y }: Props) {
    return (
        <div className="absolute w-5 h-5 rounded-full border-2 border-white bg-(--primary) shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
            left: x,
            top: y,
        }}/>
    );
}