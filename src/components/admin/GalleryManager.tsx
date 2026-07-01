import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Loader2, Image as ImageIcon, Monitor, Smartphone, Tablet, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface GalleryItem {
  url: string;
  caption: string;
  type: string;
}

interface GalleryManagerProps {
  value: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}

const TYPE_OPTIONS = [
  { value: "desktop", label: "Desktop", Icon: Monitor },
  { value: "mobile", label: "Mobile", Icon: Smartphone },
  { value: "tablet", label: "Tablet", Icon: Tablet },
  { value: "detail", label: "Detail", Icon: Search },
] as const;

/**
 * Converts an image File to WebP format using canvas.
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

const GalleryManager = ({ value, onChange }: GalleryManagerProps) => {
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
        setProgress(10);

        // Convert to WebP
        const webpBlob = await convertToWebP(file);
        setProgress(40);

        // Generate unique filename
        const random = Math.random().toString(36).substring(2, 8);
        const filePath = `gallery/${Date.now()}-${random}.webp`;

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

        // Add to gallery items
        const newItem: GalleryItem = {
          url: urlData.publicUrl,
          caption: "",
          type: "desktop",
        };
        onChange([...value, newItem]);
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      }
    },
    [value, onChange]
  );

  const handleMultipleFiles = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) handleMultipleFiles(files);
    },
    [handleMultipleFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleMultipleFiles(files);
      e.target.value = "";
    },
    [handleMultipleFiles]
  );

  const removeItem = useCallback(
    async (index: number) => {
      const item = value[index];

      // Try to delete from storage
      try {
        const url = new URL(item.url);
        const pathParts = url.pathname.split("/storage/v1/object/public/project-images/");
        if (pathParts[1]) {
          await supabase.storage.from("project-images").remove([pathParts[1]]);
        }
      } catch {
        // If URL parsing fails, just remove from array
      }

      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const updateItem = (index: number, field: keyof GalleryItem, fieldValue: string) => {
    const updated = value.map((item, i) =>
      i === index ? { ...item, [field]: fieldValue } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">Project Gallery</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Upload screenshots and visuals of the project
        </p>
      </div>

      {/* Gallery grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {value.map((item, index) => {
            const typeOption = TYPE_OPTIONS.find((t) => t.value === item.type);
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-xl overflow-hidden group hover:border-muted-foreground/30 transition-all"
              >
                {/* Image preview */}
                <div className="relative aspect-video bg-muted">
                  <img
                    src={item.url}
                    alt={item.caption || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Delete overlay */}
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* Type badge */}
                  {typeOption && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md text-foreground">
                      <typeOption.Icon className="w-3 h-3" />
                      {typeOption.label}
                    </div>
                  )}
                </div>

                {/* Caption & type */}
                <div className="p-3 space-y-2">
                  <Input
                    value={item.caption}
                    onChange={(e) => updateItem(index, "caption", e.target.value)}
                    placeholder="Image caption..."
                    className="rounded-lg bg-muted border-border text-foreground placeholder:text-muted-foreground/60 h-9 text-xs"
                  />
                  <Select
                    value={item.type}
                    onValueChange={(val) => updateItem(index, "type", val)}
                  >
                    <SelectTrigger className="rounded-lg bg-muted border-border text-foreground h-9 text-xs">
                      <SelectValue placeholder="View type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <opt.Icon className="w-3.5 h-3.5 text-muted-foreground" />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
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
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <>
            <Loader2 className="w-7 h-7 text-lime animate-spin" />
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
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              {dragOver ? (
                <ImageIcon className="w-5 h-5 text-lime" />
              ) : (
                <Plus className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {dragOver ? "Drop images here" : "Add gallery images"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Drag & drop or click · Supports multiple files · Auto WebP
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

      {/* Count */}
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {value.length} image{value.length !== 1 ? "s" : ""} in gallery
        </p>
      )}
    </div>
  );
};

export default GalleryManager;
