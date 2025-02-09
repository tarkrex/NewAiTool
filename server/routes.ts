import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertImageSchema } from "@shared/schema";
import OpenAI from "openai";

const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI();

export function registerRoutes(app: Express): Server {
  app.post("/api/images/generate", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data[0].url;
      res.json({ url: imageUrl });
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