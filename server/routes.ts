import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVirtualOfficeSchema, insertContractSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Virtual Office routes
  app.post("/api/virtual-offices", async (req, res) => {
    try {
      const validated = insertVirtualOfficeSchema.parse(req.body);
      const office = await storage.createVirtualOffice(validated);
      
      // TODO: Send email to invited party
      console.log(`Email would be sent to ${office.invitedEmail} about office ${office.name}`);
      
      res.json(office);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.get("/api/virtual-offices/:id", async (req, res) => {
    try {
      const office = await storage.getVirtualOffice(req.params.id);
      if (!office) {
        return res.status(404).json({ error: "Office not found" });
      }
      res.json(office);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch office" });
    }
  });

  app.get("/api/virtual-offices", async (req, res) => {
    try {
      const ownerEmail = req.query.ownerEmail as string;
      if (!ownerEmail) {
        return res.status(400).json({ error: "ownerEmail is required" });
      }
      const offices = await storage.getVirtualOfficesByOwner(ownerEmail);
      res.json(offices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch offices" });
    }
  });

  app.patch("/api/virtual-offices/:id", async (req, res) => {
    try {
      const updated = await storage.updateVirtualOffice(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Office not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update office" });
    }
  });

  // Contract routes
  app.post("/api/contracts", async (req, res) => {
    try {
      const validated = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(validated);
      res.json(contract);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  app.get("/api/contracts", async (req, res) => {
    try {
      const ownerEmail = req.query.ownerEmail as string;
      if (!ownerEmail) {
        return res.status(400).json({ error: "ownerEmail is required" });
      }
      const contracts = await storage.getContractsByOwner(ownerEmail);
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
