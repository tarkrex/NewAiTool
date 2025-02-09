import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload } from "lucide-react";
import { Link } from "wouter";
import { ChromePicker } from "react-color";

export default function BgRemover() {
  const [image, setImage] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setImage(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const handleRemoveBackground = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("bgColor", bgColor);

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

      if (!response.ok) throw new Error("Failed to remove background");

      const blob = await response.blob();
      setProcessedImage(URL.createObjectURL(blob));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove background",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement("a");
      link.href = processedImage;
      link.download = "processed-image.png";
      link.click();
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
        <div className="max-w-2xl mx-auto space-y-6">
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
              <div className="space-y-4">
                <ChromePicker
                  color={bgColor}
                  onChange={(color) => setBgColor(color.hex)}
                  className="mx-auto"
                />
                <Button
                  onClick={handleRemoveBackground}
                  className="w-full"
                >
                  Remove Background
                </Button>
              </div>

              {progress > 0 && progress < 100 && (
                <Progress value={progress} className="w-full" />
              )}

              {processedImage && (
                <div className="space-y-4">
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="max-w-full rounded-lg"
                  />
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                  >
                    Download
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
