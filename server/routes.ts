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

  app.get("/api/current-user", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = req.user as User;
      
      // Get user mandates from storage
      const userMandates = await storage.getUserMandates(user.id);
      
      // Transform mandates to frontend format
      const mandates = userMandates.map((mandate) => ({
        ico: mandate.company.ico,
        companyName: mandate.company.nazov,
        role: mandate.rola
      }));
      
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        mandates,
        activeContext: req.session.activeContext || null
      });
    } catch (error) {
      console.error('[API] Error fetching user mandates:', error);
      // If no mandates, return empty array
      res.json({
        user: {
          id: (req.user as User).id,
          name: (req.user as User).name,
          email: (req.user as User).email,
        },
        mandates: [],
        activeContext: req.session.activeContext || null
      });
    }
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
      
      // Enrich offices with contract titles
      const enrichedOffices = await Promise.all(
        offices.map(async (office) => {
          if (office.contractId) {
            const contract = await storage.getContract(office.contractId);
            if (contract) {
              return {
                ...office,
                name: contract.title, // Use contract title as office name
              };
            }
          }
          return office;
        })
      );
      
      res.json(enrichedOffices);
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
      
      // If virtual office is marked as completed, update the contract status to completed
      if (validated.status === 'completed' && updated.contractId) {
        await storage.updateContract(updated.contractId, { status: 'completed' });
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

  // Mock ORSR (Obchodný register SR) API endpoint
  app.post("/api/mock-orsr-search", async (req, res) => {
    try {
      const { ico } = req.body;
      
      if (!ico) {
        return res.status(400).json({ error: "IČO je povinné" });
      }

      // Mock data for DIGITAL NOTARY s.r.o.
      if (ico === "36723246") {
        return res.json({
          ico: "36723246",
          dic: "SK2022323246",
          icDph: null,
          nazov: "DIGITAL NOTARY s.r.o.",
          sidloUlica: "Digitalna",
          sidloCislo: "1",
          sidloMesto: "Bratislava",
          sidloPsc: "81102",
          registracnySud: "Okresný súd Bratislava I",
          cisloVlozky: "123456/B",
          datumZapisu: "2020-01-15",
          pravnaForma: "Spoločnosť s ručením obmedzeným",
          stat: "SK",
          statutari: [
            {
              meno: "Ján",
              priezvisko: "Nováček",
              rola: "Konateľ",
              rozsahOpravneni: "samostatne",
              platnostOd: "2020-01-15"
            }
          ]
        });
      }

      // Mock data for EXAMPLE CORP s.r.o.
      if (ico === "12345678") {
        return res.json({
          ico: "12345678",
          dic: "SK2012345678",
          icDph: "SK2012345678",
          nazov: "EXAMPLE CORP s.r.o.",
          sidloUlica: "Príkladová",
          sidloCislo: "10",
          sidloMesto: "Košice",
          sidloPsc: "04001",
          registracnySud: "Okresný súd Košice I",
          cisloVlozky: "98765/K",
          datumZapisu: "2018-05-20",
          pravnaForma: "Spoločnosť s ručením obmedzeným",
          stat: "SK",
          statutari: [
            {
              meno: "Petra",
              priezvisko: "Veselá",
              rola: "Konateľ",
              rozsahOpravneni: "samostatne",
              platnostOd: "2018-05-20"
            },
            {
              meno: "Tomáš",
              priezvisko: "Smutný",
              rola: "Konateľ",
              rozsahOpravneni: "spolocne_s_inym",
              platnostOd: "2018-05-20"
            }
          ]
        });
      }

      // Company not found
      return res.status(404).json({ 
        message: "Firma s týmto IČO nebola nájdená v Mock registri." 
      });

    } catch (error) {
      console.error("[MOCK ORSR] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Company management endpoint
  app.post("/api/companies", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as User;
      const companyData = req.body;
      
      // Check if company already exists
      let company = await storage.getCompanyByIco(companyData.ico);
      
      if (!company) {
        // Create new company
        company = await storage.createCompany({
          ico: companyData.ico,
          dic: companyData.dic,
          icDph: companyData.icDph,
          nazov: companyData.nazov,
          sidloUlica: companyData.sidloUlica,
          sidloCislo: companyData.sidloCislo,
          sidloMesto: companyData.sidloMesto,
          sidloPsc: companyData.sidloPsc,
          registracnySud: companyData.registracnySud,
          cisloVlozky: companyData.cisloVlozky,
          datumZapisu: companyData.datumZapisu,
          pravnaForma: companyData.pravnaForma,
          stat: companyData.stat || 'SK',
          stav: 'active',
          lastVerifiedAt: new Date()
        });
      }

      // Create mandate for the user
      // Use the first statutar from the company data as the mandate
      const firstStatutar = companyData.statutari?.[0];
      const mandate = await storage.createUserMandate({
        userId: user.id,
        companyId: company.id,
        rola: firstStatutar?.rola || 'Konateľ',
        rozsahOpravneni: firstStatutar?.rozsahOpravneni || 'samostatne',
        platnyOd: firstStatutar?.platnostOd || new Date().toISOString().split('T')[0],
        platnyDo: null,
        zdrojOverenia: 'OR SR Mock',
        stav: 'active',
        isVerifiedByKep: false
      });

      res.json({ 
        success: true, 
        company,
        mandate 
      });
    } catch (error) {
      console.error("[API] Error creating company:", error);
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
