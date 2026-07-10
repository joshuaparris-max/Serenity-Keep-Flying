import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const offline = !process.env.DATABASE_URL;
  if (!offline) {
    await setupAuth(app);
    registerAuthRoutes(app);
  }

  // Game Save Routes
  if (!offline) {
    app.get(api.saves.list.path, async (req, res) => {
      if (req.isUnauthenticated()) return res.sendStatus(401);
      // @ts-ignore
      const userId = req.user!.claims.sub;
      const saves = await storage.getGameSaves(userId);
      res.json(saves);
    });

    app.post(api.saves.save.path, async (req, res) => {
      if (req.isUnauthenticated()) return res.sendStatus(401);
      try {
        // @ts-ignore
        const userId = req.user!.claims.sub;
        const input = api.saves.save.input.parse(req.body);
        // Force user ID from session
        const save = await storage.createGameSave({ ...input, userId });
        res.status(201).json(save);
      } catch (err) {
        if (err instanceof z.ZodError) {
          res.status(400).json({ message: err.errors[0].message });
        } else {
          console.error(err);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }
    });

    app.get(api.saves.load.path, async (req, res) => {
      if (req.isUnauthenticated()) return res.sendStatus(401);
      const id = parseInt(req.params.id);
      const save = await storage.getGameSave(id);
      if (!save) return res.status(404).json({ message: "Save not found" });
      
      // Verify ownership
      // @ts-ignore
      if (save.userId !== req.user!.claims.sub) return res.sendStatus(403);
      
      res.json(save);
    });
  
    app.delete(api.saves.delete.path, async (req, res) => {
      if (req.isUnauthenticated()) return res.sendStatus(401);
      const id = parseInt(req.params.id);
      const save = await storage.getGameSave(id);
      if (!save) return res.status(404).json({ message: "Save not found" });
      
      // Verify ownership
      // @ts-ignore
      if (save.userId !== req.user!.claims.sub) return res.sendStatus(403);
      
      await storage.deleteGameSave(id);
      res.sendStatus(204);
    });
  }

  return httpServer;
}
