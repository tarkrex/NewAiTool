import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertImageSchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export function registerRoutes(app: any): Server {
  app.post("/api/images/generate", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      console.log("Sending request to Stability AI API with prompt:", prompt);

      const stabilityApiKey = "sk-DsevMHpd0tOSZoQDZQsZPXWhooZjjBeUKHPxx49sGd5tcP04";
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${stabilityApiKey}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1
        })
      });

      const data = await response.json();
      console.log("Stability AI API response:", data);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${data.message || 'Unknown error'}`);
      }

      if (data.artifacts && data.artifacts.length > 0) {
        const base64Image = data.artifacts[0].base64;
        const imageUrl = `data:image/png;base64,${base64Image}`;
        res.json({ url: imageUrl });
      } else {
        throw new Error("No image generated in the response");
      }
    } catch (error) {
      console.error("Image generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate image" 
      });
    }
  });

  app.post("/api/images/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageData = {
        filename: req.file.originalname,
        url: "placeholder-url", // In a real app, we'd upload to a storage service
      };

      const validatedData = insertImageSchema.parse(imageData);
      const image = await storage.createImage(validatedData);

      res.json(image);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}