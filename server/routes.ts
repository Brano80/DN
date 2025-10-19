import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { insertVirtualOfficeSchema, insertContractSchema } from "@shared/schema";
import type { User } from "./auth";

declare module "express-session" {
  interface SessionData {
    activeContext?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/auth/login", (req: Request, res: Response, next) => {
    const oidcIssuer = process.env.OIDC_ISSUER_URL;
    if (!oidcIssuer || oidcIssuer === "test") {
      return res.status(400).json({
        error: "OIDC not configured",
        message: "OIDC authentication is not configured. Please use mock login or configure OIDC credentials.",
      });
    }
    passport.authenticate("oidc")(req, res, next);
  });

  app.get(
    "/auth/callback",
    passport.authenticate("oidc", {
      failureRedirect: "/login-failed",
      successRedirect: "/",
    })
  );

  app.get("/auth/mock-login", (req: Request, res: Response) => {
    const mockUser: User = {
      id: "mock123",
      name: "Ján Nováček",
      email: "jan.novacek@example.sk",
      givenName: "Ján",
      familyName: "Nováček",
    };

    req.login(mockUser, (err) => {
      if (err) {
        console.error("[AUTH] Mock login error:", err);
        return res.status(500).json({ error: "Login failed" });
      }
      console.log("[AUTH] Mock user logged in:", mockUser.email);
      res.redirect("/select-profile");
    });
  });

  app.get("/auth/logout", (req: Request, res: Response) => {
    const userEmail = (req.user as User)?.email || "unknown";
    req.logout((err) => {
      if (err) {
        console.error("[AUTH] Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      console.log("[AUTH] User logged out:", userEmail);
      req.session.destroy((err) => {
        if (err) {
          console.error("[AUTH] Session destroy error:", err);
        }
        res.redirect("/");
      });
    });
  });

  app.get("/api/current-user", (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Return user with mock mandates
    const user = req.user as User;
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      mandates: [
        {
          ico: "12345678",
          companyName: "TechRiešenia, s.r.o.",
          role: "Konateľ"
        },
        {
          ico: "87654321",
          companyName: "Novák Development, a.s.",
          role: "Predseda predstavenstva"
        },
        {
          ico: "11223344",
          companyName: "Gastro-Inovácie, v.o.s.",
          role: "Spoločník"
        }
      ],
      activeContext: req.session.activeContext || null
    });
  });

  app.post("/api/set-context", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const { contextId } = req.body;
    if (!contextId) {
      return res.status(400).json({ error: "contextId is required" });
    }
    
    // Store context in session
    req.session.activeContext = contextId;
    
    res.json({ success: true, contextId });
  });

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
      // Validate request body - allow partial updates
      const updateSchema = insertVirtualOfficeSchema.partial();
      const validated = updateSchema.parse(req.body);
      
      const updated = await storage.updateVirtualOffice(req.params.id, validated);
      if (!updated) {
        return res.status(404).json({ error: "Office not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
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
