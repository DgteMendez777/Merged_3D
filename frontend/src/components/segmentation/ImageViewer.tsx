"use client";

interface Props {
  imageUrl: string;

  maskUrl: string | null;

  mode:
    | "original"
    | "mask"
    | "overlay";
}

export default function ImageViewer({
  imageUrl,
  maskUrl,
  mode,
}: Props) {
  if (mode === "original") {
    return (
      <img
        src={imageUrl}
        alt="original"
        className="
          max-h-[700px]
          rounded-2xl
        "
      />
    );
  }

  if (
    mode === "mask" &&
    maskUrl
  ) {
    return (
      <img
        src={maskUrl}
        alt="mask"
        className="
          max-h-[700px]
          rounded-2xl
        "
      />
    );
  }

  if (
    mode === "overlay" &&
    maskUrl
  ) {
    return (
      <div
        className="
        relative
        inline-block
      "
      >
        <img
          src={imageUrl}
          alt="original"
          className="
            max-h-[700px]
            rounded-2xl
          "
        />

        <img
          src={maskUrl}
          alt="mask"
          className="
            absolute
            inset-0
            opacity-40
            rounded-2xl
          "
        />
      </div>
    );
  }

  return null;
}