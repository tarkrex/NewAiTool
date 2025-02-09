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
      setImage(acceptedFiles[0]);
      setImagePreview(URL.createObjectURL(acceptedFiles[0]));
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
          "Accept": "image/png",
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
      fetch(processedImage)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "processed-image.png";
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        });
    }
  };

  const handleColorPickerClose = () => {
    setShowColorPicker(false);
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
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
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
                    <img
                      src={imagePreview}
                      alt="Original"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}

                {/* Processed Image Preview */}
                {processedImage && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Processed Image</h3>
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-full rounded-lg border"
                    />
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
                    <div className="relative">
                      <ChromePicker
                        color={bgColor}
                        onChange={(color: any) => setBgColor(color.hex)}
                        className="mx-auto"
                      />
                      <Button
                        onClick={handleColorPickerClose}
                        className="mt-2 w-full"
                      >
                        OK
                      </Button>
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