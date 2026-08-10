"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export the cropped image."))), "image/jpeg", 0.92);
  });
}

/**
 * A file input that opens a drag-to-position + zoom-to-resize cropper
 * (react-easy-crop) before the image is attached to the form. The visible
 * "Choose file" input is a separate, non-submitting picker — the actual
 * <input type="file" name={name}> that the server action reads is hidden and
 * has its FileList set programmatically (via DataTransfer) once the user
 * confirms the crop, so the rest of the form/action code needs zero changes.
 */
export function ImageCropInput({
  name,
  aspect,
  currentImage,
  onRemove,
}: {
  name: string;
  aspect: number;
  currentImage?: string | null;
  onRemove?: () => void;
}) {
  const submitInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage ?? null);
  const [cropping, setCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSourceUrl(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropping(true);
  }

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => setCroppedAreaPixels(areaPixels), []);

  async function applyCrop() {
    if (!sourceUrl || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedBlob(sourceUrl, croppedAreaPixels);
      const file = new File([blob], `${name}.jpg`, { type: "image/jpeg" });
      const dt = new DataTransfer();
      dt.items.add(file);
      if (submitInputRef.current) submitInputRef.current.files = dt.files;
      setPreviewUrl(URL.createObjectURL(blob));
      setCropping(false);
    } catch {
      setError("Could not process that image — try a different file.");
    }
  }

  return (
    <div>
      <input ref={submitInputRef} type="file" name={name} style={{ display: "none" }} />
      <input
        ref={pickerRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handlePick}
      />

      {previewUrl && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" style={{ maxWidth: 120, maxHeight: 50, objectFit: "cover", borderRadius: 6 }} />
          {onRemove && (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setPreviewUrl(null);
                if (submitInputRef.current) submitInputRef.current.value = "";
                onRemove();
              }}
            >
              Remove
            </button>
          )}
        </div>
      )}

      <button type="button" className="button small secondary" onClick={() => pickerRef.current?.click()}>
        {previewUrl ? "Change" : "Upload"} &amp; crop
      </button>
      {error && <p className="login-error">{error}</p>}

      {cropping && sourceUrl && (
        <div className="crop-overlay">
          <div className="crop-panel">
            <div className="crop-stage">
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <label className="crop-zoom-label">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
            <p className="muted" style={{ fontSize: 12, margin: 0 }}>
              Drag to reposition, use the slider to zoom in or out.
            </p>
            <div className="crop-actions">
              <button type="button" className="text-link" onClick={() => setCropping(false)}>
                Cancel
              </button>
              <button type="button" className="button small" onClick={applyCrop}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
