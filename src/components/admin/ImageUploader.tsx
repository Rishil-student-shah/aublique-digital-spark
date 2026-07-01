import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

/**
 * Converts an image File to WebP format using canvas.
 * Returns a Blob in WebP format.
 */
const convertToWebP = (file: File, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("WebP conversion failed"));
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

const ImageUploader = ({ value, onChange, folder = "thumbnails" }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Simulate progress for conversion phase
        setProgress(10);

        // Convert to WebP
        const webpBlob = await convertToWebP(file);
        setProgress(40);

        // Generate unique filename
        const random = Math.random().toString(36).substring(2, 8);
        const filePath = `${folder}/${Date.now()}-${random}.webp`;

        setProgress(50);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(filePath, webpBlob, {
            contentType: "image/webp",
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        setProgress(85);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("project-images")
          .getPublicUrl(filePath);

        setProgress(100);

        onChange(urlData.publicUrl);
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        // Small delay to show 100% before clearing
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      }
    },
    [folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [uploadFile]
  );

  const handleDelete = useCallback(async () => {
    if (!value) return;

    try {
      // Extract file path from URL
      const url = new URL(value);
      const pathParts = url.pathname.split("/storage/v1/object/public/project-images/");
      if (pathParts[1]) {
        await supabase.storage.from("project-images").remove([pathParts[1]]);
      }
    } catch {
      // If URL parsing fails, just clear the value
    }

    onChange("");
  }, [value, onChange]);

  // Show uploaded image preview
  if (value && !uploading) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-border bg-card">
        <img
          src={value}
          alt="Uploaded"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="rounded-lg"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
        <div className="absolute top-2 right-2 bg-lime/90 text-lime-foreground text-xs px-2 py-1 rounded-md font-medium">
          WebP
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
          dragOver
            ? "border-lime bg-lime/5 shadow-[0_0_20px_hsl(75_100%_50%/0.1)]"
            : "border-border hover:border-muted-foreground hover:bg-muted/30",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-lime animate-spin" />
            <p className="text-sm text-muted-foreground">
              {progress < 40
                ? "Converting to WebP..."
                : progress < 85
                ? "Uploading..."
                : "Finalizing..."}
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              {dragOver ? (
                <ImageIcon className="w-6 h-6 text-lime" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {dragOver ? "Drop image here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images auto-converted to WebP for optimal performance
              </p>
            </div>
          </>
        )}

        {/* Progress bar */}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted rounded-b-xl overflow-hidden">
            <div
              className="h-full bg-lime transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
