import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload } from "lucide-react";
import { Link } from "wouter";
import { ChromePicker } from "react-color";

export default function BgRemover() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setImage(file);
      // Create URL for preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (processedImage) URL.revokeObjectURL(processedImage);
    };
  }, [imagePreview, processedImage]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
    maxFiles: 1,
  });

  const handleRemoveBackground = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image_file", image);
    formData.append("size", "auto");
    formData.append("bg_color", bgColor.replace("#", ""));

    try {
      setProgress(0);
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "yjvnCpDCuVcPsYAAJxSsg6FA",
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const blob = await response.blob();
      if (processedImage) {
        URL.revokeObjectURL(processedImage);
      }
      const imageUrl = URL.createObjectURL(blob);
      setProcessedImage(imageUrl);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove background",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = processedImage;
      link.download = "processed-image.png"; // Set the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold">AI BG Remover</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2">Drag & drop an image or click to select</p>
          </div>

          {image && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image Preview */}
                {imagePreview && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Original Image</h3>
                    <div className="relative aspect-square rounded-lg border overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Processed Image Preview */}
                {processedImage && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Processed Image</h3>
                    <div className="relative aspect-square rounded-lg border overflow-hidden" style={{ backgroundColor: bgColor }}>
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    variant="outline"
                  >
                    Choose Background Color
                  </Button>
                  {showColorPicker && (
                    <div className="relative z-10">
                      <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                      <div className="absolute">
                        <ChromePicker
                          color={bgColor}
                          onChange={(color) => setBgColor(color.hex)}
                        />
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={handleRemoveBackground}
                    className="w-full"
                  >
                    Remove Background
                  </Button>
                </div>
              </div>

              {progress > 0 && progress < 100 && (
                <Progress value={progress} className="w-full" />
              )}

              {processedImage && (
                <Button
                  onClick={handleDownload}
                  className="w-full"
                >
                  Download
                </Button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}