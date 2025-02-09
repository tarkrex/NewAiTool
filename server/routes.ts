import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertImageSchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export function registerRoutes(app: Express): Server {
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
