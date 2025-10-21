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

  app.get("/auth/mock-login-petra", (req: Request, res: Response) => {
    const mockUser: User = {
      id: "mock456",
      name: "Petra Ambroz",
      email: "petra.ambroz@example.sk",
      givenName: "Petra",
      familyName: "Ambroz",
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

  app.get("/auth/logout", async (req: Request, res: Response) => {
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

  // Reset all data to seed state (for testing purposes)
  app.post("/api/reset-data", async (req: Request, res: Response) => {
    try {
      console.log("[RESET] Manual data reset requested");
      await storage.resetToSeedData();
      res.json({ success: true, message: "Dáta boli vymazané a obnovené na základný stav." });
    } catch (error) {
      console.error("[RESET] Error resetting data:", error);
      res.status(500).json({ error: "Nepodarilo sa vymazať dáta." });
    }
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
        mandateId: mandate.id,
        ico: mandate.company.ico,
        companyName: mandate.company.nazov,
        role: mandate.rola,
        status: mandate.stav
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

      // Mock data for ARIAN s.r.o.
      if (ico === "12345678") {
        return res.json({
          ico: "12345678",
          dic: "SK2012345678",
          icDph: "SK2012345678",
          nazov: "ARIAN s.r.o.",
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
              priezvisko: "Ambroz",
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

  // Get company profile - returns detailed information about a company
  app.get("/api/companies/:ico/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as User;
      const { ico } = req.params;

      console.log(`[API] User ${user.name} requesting profile for company ${ico}`);

      // Security check: Verify user has an active mandate for this company
      const userMandates = await storage.getUserMandates(user.id);
      const userActiveMandate = userMandates.find(
        (m) => m.company.ico === ico && m.stav === 'active'
      );

      if (!userActiveMandate) {
        console.log(`[API] User ${user.name} attempted to access company profile without active mandate for ${ico}`);
        return res.status(403).json({ 
          error: "Prístup zamietnutý",
          message: "Nemáte oprávnenie zobraziť profil tejto firmy."
        });
      }

      // Fetch company by ICO
      const company = await storage.getCompanyByIco(ico);
      
      if (!company) {
        console.log(`[API] Company with ICO ${ico} not found`);
        return res.status(404).json({ 
          error: "Firma nenájdená",
          message: "Firma s týmto IČO neexistuje."
        });
      }

      console.log(`[API] User ${user.name} successfully retrieved profile for company ${company.nazov}`);
      res.status(200).json(company);
    } catch (error) {
      console.error("[API] Error fetching company profile:", error);
      res.status(500).json({ error: "Nepodarilo sa načítať profil firmy." });
    }
  });

  // Get company activity/audit logs
  app.get("/api/companies/:ico/activity", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as User;
      const { ico } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

      console.log(`[API] User ${user.name} requesting activity logs for company ${ico}`);

      // Security check: Verify user has an active mandate for this company
      const userMandates = await storage.getUserMandates(user.id);
      const userActiveMandate = userMandates.find(
        (m) => m.company.ico === ico && m.stav === 'active'
      );

      if (!userActiveMandate) {
        console.log(`[API] User ${user.name} attempted to access activity logs without active mandate for ${ico}`);
        return res.status(403).json({ 
          error: "Prístup zamietnutý",
          message: "Nemáte oprávnenie zobraziť aktivity tejto firmy."
        });
      }

      // Get the company to get its ID
      const company = await storage.getCompanyByIco(ico);
      if (!company) {
        return res.status(404).json({ 
          error: "Firma nenájdená",
          message: "Firma s týmto IČO neexistuje."
        });
      }

      // Fetch audit logs for the company
      const logs = await storage.getAuditLogsByCompany(company.id, limit);

      console.log(`[API] User ${user.name} retrieved ${logs.length} activity logs for company ${company.nazov}`);
      res.status(200).json(logs);
    } catch (error) {
      console.error("[API] Error fetching company activity logs:", error);
      res.status(500).json({ error: "Nepodarilo sa načítať aktivity firmy." });
    }
  });

  // Get company audit logs (new endpoint with take: 50)
  app.get("/api/companies/:ico/audit-log", async (req, res) => {
    try {
      // Middleware: Check authentication
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as User;
      const { ico } = req.params;

      console.log(`[API] User ${user.name} requesting audit logs for company ${ico}`);

      // Security check: Verify user has an active mandate for this company
      const userMandates = await storage.getUserMandates(user.id);
      const userActiveMandate = userMandates.find(
        (m) => m.company.ico === ico && m.stav === 'active'
      );

      if (!userActiveMandate) {
        console.log(`[API] User ${user.name} attempted to access audit logs without active mandate for ${ico}`);
        return res.status(403).json({ 
          error: "Prístup zamietnutý",
          message: "Nemáte oprávnenie zobraziť audit log tejto firmy."
        });
      }

      // Find company by ICO to get companyId
      const company = await storage.getCompanyByIco(ico);
      if (!company) {
        return res.status(404).json({ 
          error: "Firma nenájdená",
          message: "Firma s týmto IČO neexistuje."
        });
      }

      // Fetch audit logs (take: 50, orderBy: timestamp desc, include user.name)
      const logs = await storage.getAuditLogsByCompany(company.id, 50);

      console.log(`[API] User ${user.name} retrieved ${logs.length} audit logs for company ${company.nazov}`);
      res.status(200).json(logs);
    } catch (error) {
      console.error("[API] Error fetching audit logs:", error);
      res.status(500).json({ error: "Nepodarilo sa načítať audit log." });
    }
  });

  // Get company mandates - returns all users who have mandate for a specific company
  app.get("/api/companies/:ico/mandates", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as User;
      const { ico } = req.params;

      // Security check: Verify user has an active mandate for this company
      const userMandates = await storage.getUserMandates(user.id);
      const userHasMandate = userMandates.some(
        (m) => m.company.ico === ico && m.stav === 'active'
      );

      if (!userHasMandate) {
        console.log(`[API] User ${user.name} attempted to access mandates for company ${ico} without authorization`);
        return res.status(403).json({ 
          error: "Prístup zamietnutý",
          message: "Nemáte oprávnenie zobraziť mandáty tejto firmy."
        });
      }

      // Fetch all mandates for the company
      const companyMandates = await storage.getCompanyMandatesByIco(ico);

      console.log(`[API] User ${user.name} fetched ${companyMandates.length} mandates for company ${ico}`);
      res.json(companyMandates);
    } catch (error) {
      console.error("[API] Error fetching company mandates:", error);
      res.status(500).json({ error: "Nepodarilo sa načítať mandáty." });
    }
  });

  // Create new mandate (invite user to company)
  app.post("/api/companies/:ico/mandates", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as User;
      const { ico } = req.params;
      const { email, rola, rozsahOpravneni } = req.body;

      console.log(`[API] User ${user.name} attempting to invite ${email} to company ${ico}`);

      // Validate input
      if (!email || !rola || !rozsahOpravneni) {
        return res.status(400).json({ 
          error: "Chybajúce údaje",
          message: "E-mail, rola a rozsah oprávnení sú povinné."
        });
      }

      // Security check: Verify user has an active mandate for this company
      const userMandates = await storage.getUserMandates(user.id);
      const userActiveMandate = userMandates.find(
        (m) => m.company.ico === ico && m.stav === 'active'
      );

      if (!userActiveMandate) {
        console.log(`[API] User ${user.name} attempted to invite users without authorization for company ${ico}`);
        return res.status(403).json({ 
          error: "Prístup zamietnutý",
          message: "Nemáte oprávnenie pozývať používateľov pre túto firmu."
        });
      }

      // Additional check: Only "Konateľ" or admin roles can invite users
      const authorizedRoles = ['Konateľ', 'Prokurista'];
      if (!authorizedRoles.includes(userActiveMandate.rola)) {
        console.log(`[API] User ${user.name} with role ${userActiveMandate.rola} attempted to invite users`);
        return res.status(403).json({ 
          error: "Nedostatočné oprávnenia",
          message: "Len konatelia a prokuristi môžu pozývať nových používateľov."
        });
      }

      // Find company by ICO
      const company = await storage.getCompanyByIco(ico);
      if (!company) {
        return res.status(404).json({ 
          error: "Firma nenájdená",
          message: "Firma s týmto IČO neexistuje."
        });
      }

      // Check if invited user exists (username is used as email in our system)
      const invitedUser = await storage.getUserByUsername(email);
      
      if (!invitedUser) {
        // MVP Simplification: User must already be registered
        console.log(`[API] Attempted to invite non-existent user: ${email}`);
        return res.status(404).json({ 
          error: "Používateľ nenájdený",
          message: "Používateľ s týmto e-mailom zatiaľ nie je v systéme Digital Notary. Používateľ sa musí najprv zaregistrovať."
        });
      }

      // Check if user already has a mandate for this company
      const existingMandates = await storage.getUserMandates(invitedUser.id);
      const existingMandate = existingMandates.find(m => m.companyId === company.id);

      if (existingMandate) {
        console.log(`[API] User ${email} already has mandate for company ${company.nazov}`);
        return res.status(409).json({ 
          error: "Mandát už existuje",
          message: "Používateľ už má pridelený mandát pre túto firmu."
        });
      }

      // Create new mandate with pending_confirmation status
      const newMandate = await storage.createUserMandate({
        userId: invitedUser.id,
        companyId: company.id,
        rola: rola,
        rozsahOpravneni: rozsahOpravneni,
        platnyOd: new Date().toISOString().split('T')[0],
        platnyDo: null,
        zdrojOverenia: `Pozvánka od ${user.name}`,
        stav: 'pending_confirmation',
        isVerifiedByKep: false
      });

      // Create audit log
      await storage.createAuditLog({
        actionType: "MANDATE_CREATED",
        details: `${user.name} pozval používateľa ${email} ako ${rola}`,
        userId: user.id,
        companyId: company.id,
      });

      // TODO: Send notification email to invited user
      console.log(`[TODO] Poslať notifikačný e-mail používateľovi ${email} o novom mandáte.`);

      console.log(`[API] Successfully created pending mandate for ${email} at company ${company.nazov}`);
      res.status(201).json({ 
        success: true,
        message: "Pozvánka bola úspešne odoslaná.",
        mandate: newMandate
      });
    } catch (error) {
      console.error("[API] Error creating mandate:", error);
      res.status(500).json({ error: "Nepodarilo sa vytvoriť mandát. Skúste to znova." });
    }
  });

  // Update mandate status (accept/reject invitation)
  app.patch("/api/mandates/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as User;
      const { id } = req.params;
      const { stav } = req.body;

      // Validate status
      const validStatuses = ['active', 'rejected'];
      if (!validStatuses.includes(stav)) {
        return res.status(400).json({ 
          error: "Neplatný stav",
          message: "Stav musí byť 'active' alebo 'rejected'."
        });
      }

      // Get the mandate
      const mandate = await storage.getUserMandate(id);
      if (!mandate) {
        return res.status(404).json({ 
          error: "Mandát nenájdený",
          message: "Mandát s týmto ID neexistuje."
        });
      }

      // Check if the mandate belongs to the current user
      if (mandate.userId !== user.id) {
        console.log(`[API] User ${user.name} attempted to update mandate that doesn't belong to them`);
        return res.status(403).json({ 
          error: "Nedostatočné oprávnenia",
          message: "Nemôžete upraviť mandát, ktorý vám nepatrí."
        });
      }

      // Check if mandate is in pending_confirmation status
      if (mandate.stav !== 'pending_confirmation') {
        return res.status(400).json({ 
          error: "Neplatná operácia",
          message: "Môžete aktualizovať len mandáty so stavom 'pending_confirmation'."
        });
      }

      // Update mandate status
      const updated = await storage.updateUserMandate(id, { stav });
      
      if (!updated) {
        return res.status(500).json({ error: "Nepodarilo sa aktualizovať mandát." });
      }

      // Create audit log
      await storage.createAuditLog({
        actionType: stav === 'active' ? "MANDATE_ACCEPTED" : "MANDATE_REJECTED",
        details: `${user.name} ${stav === 'active' ? 'prijal' : 'odmietol'} mandát`,
        userId: user.id,
        companyId: mandate.companyId,
      });

      console.log(`[API] User ${user.name} ${stav === 'active' ? 'accepted' : 'rejected'} mandate ${id}`);
      res.status(200).json({ 
        success: true,
        message: stav === 'active' ? "Mandát bol prijatý." : "Mandát bol odmietnutý.",
        mandate: updated
      });
    } catch (error) {
      console.error("[API] Error updating mandate:", error);
      res.status(500).json({ error: "Nepodarilo sa aktualizovať mandát. Skúste to znova." });
    }
  });

  // Company management endpoint - Connect/Add company with verification
  app.post("/api/companies", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as User;
      const companyData = req.body;
      
      // Verify that the user is a statutory representative
      const userGivenName = user.givenName || user.name.split(' ')[0];
      const userFamilyName = user.familyName || user.name.split(' ').slice(1).join(' ');
      
      const statutari = companyData.statutari || [];
      const userStatutar = statutari.find((stat: any) => {
        const menoMatch = stat.meno.toLowerCase() === userGivenName.toLowerCase();
        const priezviskoMatch = stat.priezvisko.toLowerCase() === userFamilyName.toLowerCase();
        return menoMatch && priezviskoMatch;
      });

      if (!userStatutar) {
        console.log(`[API] User ${user.name} is not a statutory representative of company ${companyData.nazov}`);
        return res.status(403).json({ 
          error: "Nemáte oprávnenie pripojiť túto firmu.",
          message: "Nie ste uvedený ako štatutárny zástupca tejto firmy."
        });
      }

      console.log(`[API] User ${user.name} verified as statutory representative (${userStatutar.rola})`);
      
      // Check if company already exists
      let company = await storage.getCompanyByIco(companyData.ico);
      
      if (!company) {
        // Create new company
        console.log(`[API] Creating new company: ${companyData.nazov} (IČO: ${companyData.ico})`);
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
      } else {
        // Company exists - update it
        console.log(`[API] Updating existing company: ${companyData.nazov} (IČO: ${companyData.ico})`);
        await storage.updateCompany(company.id, {
          nazov: companyData.nazov,
          dic: companyData.dic,
          icDph: companyData.icDph,
          sidloUlica: companyData.sidloUlica,
          sidloCislo: companyData.sidloCislo,
          sidloMesto: companyData.sidloMesto,
          sidloPsc: companyData.sidloPsc,
          registracnySud: companyData.registracnySud,
          cisloVlozky: companyData.cisloVlozky,
          datumZapisu: companyData.datumZapisu,
          pravnaForma: companyData.pravnaForma,
          stav: 'active',
          lastVerifiedAt: new Date()
        });
      }

      // Check if mandate already exists
      const existingMandates = await storage.getUserMandates(user.id);
      const existingMandate = existingMandates.find(m => m.companyId === company.id);

      if (existingMandate) {
        console.log(`[API] Mandate already exists for user ${user.name} and company ${company.nazov}`);
        return res.json({ 
          success: true, 
          message: "Firma je už pripojená.",
          company,
          mandate: existingMandate
        });
      }

      // Create mandate for the user using verified statutory data
      const mandate = await storage.createUserMandate({
        userId: user.id,
        companyId: company.id,
        rola: userStatutar.rola,
        rozsahOpravneni: userStatutar.rozsahOpravneni || 'samostatne',
        platnyOd: userStatutar.platnostOd || new Date().toISOString().split('T')[0],
        platnyDo: null,
        zdrojOverenia: 'OR SR Mock',
        stav: 'active',
        isVerifiedByKep: false
      });

      // Create audit log for company connection
      await storage.createAuditLog({
        actionType: "COMPANY_CONNECTED",
        details: `Firma ${company.nazov} bola pripojená používateľom ${user.name} (overený ako ${userStatutar.rola})`,
        userId: user.id,
        companyId: company.id,
      });

      console.log(`[API] Company ${company.nazov} successfully connected for user ${user.name}`);
      res.status(201).json({ 
        success: true, 
        message: "Firma bola úspešne pripojená.",
        company,
        mandate 
      });
    } catch (error) {
      console.error("[API] Error connecting company:", error);
      res.status(500).json({ error: "Nepodarilo sa pripojiť firmu. Skúste to znova." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
