import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertImageSchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export function registerRoutes(app: Express): Server {
  app.post("/api/images/generate", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const response = await fetch('https://modelslab.com/api/v6/realtime/text2img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model_id: 'sdxl',
          samples: 1,
          steps: 20,
          aspect_ratio: '1:1',
          guidance_scale: 7.5,
          seed: -1
        })
      });

      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Failed to generate image");
      }

      if (data.status === "success" && data.output && data.output[0]) {
        res.json({ url: data.output[0] });
      } else {
        throw new Error("No image generated");
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