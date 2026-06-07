export interface ImageCoordinates {
    displayX: number;
    displayY: number;
    realX: number;
    realY: number;
}

export function getImageCoordinates(event: React.MouseEvent<HTMLImageElement>, image: HTMLImageElement): ImageCoordinates {
    const rect = image.getBoundingClientRect();
    const displayX = event.clientX - rect.left;
    const displayY = event.clientY - rect.top;
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;
    const realX = Math.round(displayX * scaleX);
    const realY = Math.round(displayY * scaleY);

    return {
        displayX,
        displayY,
        realX,
        realY
    }
}