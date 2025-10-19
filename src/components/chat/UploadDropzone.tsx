"use client";

import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Upload, Loader2 } from "lucide-react";

export default function UploadDropzone({
  imageUrl,
  analyzing,
  onSelectImage,
}: {
  imageUrl: string | null;
  analyzing: boolean;
  onSelectImage: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      onSelectImage(url);
    },
    [onSelectImage]
  );

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSelectImage(url);
  }, [onSelectImage]);

  return (
    <div className="space-y-3">
      {!imageUrl && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={cn(
            "flex h-56 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed",
            "border-border bg-background/60 text-sm text-muted-foreground"
          )}
          role="group"
          aria-label="Upload chart"
        >
          <ImageIcon className="h-5 w-5 opacity-80" />
          <p>Drag & drop a chart image here</p>
          <p className="text-xs">or</p>
          <Button
            variant="default"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="font-mono no-ring"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose file
          </Button>
          <p className="text-xs text-neutral-500 mt-2">PNG/JPG; clear charts work best.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
        </div>
      )}

      {imageUrl && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border bg-background">
            {/* Preview image */}
            <img
              src={imageUrl}
              alt="Uploaded chart preview"
              className="block max-h-[360px] w-full object-contain"
            />
            {/* Fake analysis overlay */}
            {analyzing && (
              <div className="absolute inset-0 grid place-items-center bg-black/50">
                <div className="flex items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-xs text-white">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing chart…
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // reset - call parent with empty string to indicate removal
                onSelectImage("");
              }}
              className="no-ring"
            >
              Remove
            </Button>
            <Button
              size="sm"
              onClick={() => {
                // re-trigger fake analysis
                onSelectImage(imageUrl);
              }}
              className="no-ring"
            >
              Re-run analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}