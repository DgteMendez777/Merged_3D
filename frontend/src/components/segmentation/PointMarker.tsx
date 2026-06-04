interface Props {
  x: number;
  y: number;
  label: number;
}

export default function PointMarker({
  x,
  y,
  label,
}: Props) {
  return (
    <div
      className="
      absolute
      -translate-x-1/2
      -translate-y-1/2
      pointer-events-none
    "
      style={{
        left: x,
        top: y,
      }}
    >
      <div
        className="
        w-6
        h-6
        rounded-full
        bg-[var(--primary)]
        border-2
        border-white
        flex
        items-center
        justify-center
        text-xs
        font-bold
      "
      >
        {label}
      </div>
    </div>
  );
}