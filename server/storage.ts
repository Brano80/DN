import { 
  type User, 
  type InsertUser, 
  type Contract, 
  type InsertContract,
  type VirtualOffice,
  type InsertVirtualOffice,
  type Company,
  type InsertCompany,
  type UserCompanyMandate,
  type InsertUserCompanyMandate,
  type AuditLog,
  type InsertAuditLog
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getContract(id: string): Promise<Contract | undefined>;
  getContractsByOwner(ownerEmail: string): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, updates: Partial<Contract>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;
  
  getVirtualOffice(id: string): Promise<VirtualOffice | undefined>;
  getVirtualOfficesByOwner(ownerEmail: string): Promise<VirtualOffice[]>;
  createVirtualOffice(office: InsertVirtualOffice): Promise<VirtualOffice>;
  updateVirtualOffice(id: string, updates: Partial<VirtualOffice>): Promise<VirtualOffice | undefined>;
  deleteVirtualOffice(id: string): Promise<boolean>;
  
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByIco(ico: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined>;
  updateCompanySecuritySettings(companyId: string, enforceTwoFactorAuth: boolean): Promise<Company | undefined>;
  
  getUserMandates(userId: string): Promise<Array<UserCompanyMandate & { company: Company }>>;
  getCompanyMandatesByIco(ico: string): Promise<Array<UserCompanyMandate & { user: User }>>;
  createUserMandate(mandate: InsertUserCompanyMandate): Promise<UserCompanyMandate>;
  updateUserMandate(id: string, updates: Partial<UserCompanyMandate>): Promise<UserCompanyMandate | undefined>;
  getUserMandate(id: string): Promise<UserCompanyMandate | undefined>;
  
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogsByCompany(companyId: string, limit?: number): Promise<Array<AuditLog & { user: User }>>;
  getAuditLogsByUser(userId: string, limit?: number): Promise<Array<AuditLog>>;
  
  // Reset all data to seed state (for testing purposes)
  resetToSeedData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contracts: Map<string, Contract>;
  private virtualOffices: Map<string, VirtualOffice>;
  private companies: Map<string, Company>;
  private userMandates: Map<string, UserCompanyMandate>;
  private auditLogs: Map<string, AuditLog>;

  constructor() {
    this.users = new Map();
    this.contracts = new Map();
    this.virtualOffices = new Map();
    this.companies = new Map();
    this.userMandates = new Map();
    this.auditLogs = new Map();
  }

  seedExampleData() {
    console.log('[SEED] Seeding example data for Škoda Octavia...');
    
    // Create mock user 1 - Ján Nováček (will have a company)
    const mockUserId = "mock123";
    const mockUser: User = {
      id: mockUserId,
      username: "jan.novacek@example.sk",
      password: "mock-password-hash"
    };
    this.users.set(mockUserId, mockUser);
    
    // Create mock user 2 - Petra Ambroz (can be invited to a company)
    const mockUser2Id = "mock456";
    const mockUser2: User = {
      id: mockUser2Id,
      username: "petra.ambroz@example.sk",
      password: "mock-password-hash-2"
    };
    this.users.set(mockUser2Id, mockUser2);
    
    console.log('[SEED] Created 2 mock users');
    
    // Create eGarant s.r.o. company (for Ján Nováček)
    const companyId = "company-egarant";
    const company: Company = {
      id: companyId,
      ico: "54321098",
      dic: "SK2054321098",
      icDph: null,
      nazov: "eGarant s.r.o.",
      sidloUlica: "Hlavná",
      sidloCislo: "25",
      sidloMesto: "Bratislava",
      sidloPsc: "81102",
      registracnySud: "Okresný súd Bratislava I",
      cisloVlozky: "654321/B",
      datumZapisu: "2020-01-15",
      pravnaForma: "Spoločnosť s ručením obmedzeným",
      stat: "SK",
      stav: "active",
      lastVerifiedAt: new Date(),
      enforceTwoFactorAuth: false,
      createdAt: new Date("2020-01-15"),
      updatedAt: new Date()
    };
    this.companies.set(companyId, company);
    
    // Create mandate for mock user
    const mandateId = "mandate-jan-novacek";
    const mandate: UserCompanyMandate = {
      id: mandateId,
      userId: mockUserId,
      companyId: companyId,
      rola: "Konateľ",
      rozsahOpravneni: "samostatne",
      platnyOd: "2020-01-15",
      platnyDo: null,
      zdrojOverenia: "OR SR Mock",
      stav: "active",
      isVerifiedByKep: false,
      createdAt: new Date("2020-01-15"),
      updatedAt: new Date()
    };
    this.userMandates.set(mandateId, mandate);
    
    console.log('[SEED] Created company and mandate for mock user');
    
    // Create second company - ARIAN s.r.o. (for Petra Ambroz)
    const company2Id = "company-arian";
    const company2: Company = {
      id: company2Id,
      ico: "12345678",
      dic: "SK2012345678",
      icDph: null,
      nazov: "ARIAN s.r.o.",
      sidloUlica: "Testovacia",
      sidloCislo: "10",
      sidloMesto: "Košice",
      sidloPsc: "04001",
      registracnySud: "Okresný súd Košice I",
      cisloVlozky: "789012/B",
      datumZapisu: "2021-05-10",
      pravnaForma: "Spoločnosť s ručením obmedzeným",
      stat: "SK",
      stav: "active",
      lastVerifiedAt: new Date(),
      enforceTwoFactorAuth: false,
      createdAt: new Date("2021-05-10"),
      updatedAt: new Date()
    };
    this.companies.set(company2Id, company2);
    
    // Create active mandate for Petra Ambroz as Konateľ of ARIAN
    const mandate2Id = "mandate-petra-ambroz";
    const mandate2: UserCompanyMandate = {
      id: mandate2Id,
      userId: mockUser2Id,
      companyId: company2Id,
      rola: "Konateľ",
      rozsahOpravneni: "samostatne",
      platnyOd: "2021-05-10",
      platnyDo: null,
      zdrojOverenia: "OR SR Mock",
      stav: "active",
      isVerifiedByKep: false,
      createdAt: new Date("2021-05-10"),
      updatedAt: new Date()
    };
    this.userMandates.set(mandate2Id, mandate2);
    
    console.log('[SEED] Created ARIAN s.r.o. with Petra Ambroz as Konateľ');
    
    // Create example contract for Škoda Octavia
    const contractId = "example-skoda-octavia";
    const exampleContract: Contract = {
      id: contractId,
      title: "Predaj vozidla - Škoda Octavia",
      type: "vehicle",
      ownerEmail: "jan.novacek@example.sk",
      status: "completed",
      content: JSON.stringify({
        seller: {
          name: "Ján Novák",
          birthNumber: "750101/1234",
          address: "Hlavná 15, Bratislava"
        },
        buyer: {
          name: "Tomáš Horváth",
          birthNumber: "850202/5678",
          address: "Športová 8, Košice"
        },
        vehicle: {
          brand: "Škoda",
          model: "Octavia",
          year: "2019",
          vin: "TMBJF7NE5K0123456",
          licensePlate: "BA123AB",
          mileage: "85000"
        },
        price: "18 500",
        paymentMethod: "bankový prevod",
        signingPlace: "Bratislava",
        signingDate: "22.12.2024"
      }),
      createdAt: new Date("2024-12-20")
    };
    this.contracts.set(contractId, exampleContract);

    // Create example virtual office for Škoda Octavia
    const officeId = "example-office-skoda-octavia";
    const exampleOffice: VirtualOffice = {
      id: officeId,
      name: "Predaj vozidla - Škoda Octavia",
      ownerEmail: "jan.novacek@example.sk",
      invitedEmail: "tomas.horvath@example.com",
      status: "completed",
      contractId: contractId,
      processType: null,
      createdAt: new Date("2024-12-22")
    };
    this.virtualOffices.set(officeId, exampleOffice);
    
    // Create sample audit logs for ARIAN
    const auditLog1: AuditLog = {
      id: "audit-log-1",
      timestamp: new Date("2021-05-10T10:00:00Z"),
      actionType: "COMPANY_CONNECTED",
      details: "Petra Ambroz pripojila firmu ARIAN s.r.o.",
      userId: mockUser2Id,
      companyId: company2Id,
    };
    this.auditLogs.set(auditLog1.id, auditLog1);
    
    const auditLog2: AuditLog = {
      id: "audit-log-2",
      timestamp: new Date("2021-06-15T14:30:00Z"),
      actionType: "MANDATE_CREATED",
      details: "Petra Ambroz pozval používateľa test@example.com ako Prokurist",
      userId: mockUser2Id,
      companyId: company2Id,
    };
    this.auditLogs.set(auditLog2.id, auditLog2);
    
    // Create sample audit logs for eGarant
    const auditLog3: AuditLog = {
      id: "audit-log-3",
      timestamp: new Date("2020-01-15T09:00:00Z"),
      actionType: "COMPANY_CONNECTED",
      details: "Ján Nováček pripojil firmu eGarant s.r.o.",
      userId: mockUserId,
      companyId: companyId,
    };
    this.auditLogs.set(auditLog3.id, auditLog3);
    
    console.log('[SEED] Created sample audit logs');
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getContract(id: string): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getContractsByOwner(ownerEmail: string): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.ownerEmail === ownerEmail,
    );
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = randomUUID();
    const contract: Contract = { 
      ...insertContract,
      status: insertContract.status ?? 'pending',
      id,
      createdAt: new Date()
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    
    const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
    const updated = { ...contract, ...safeUpdates };
    this.contracts.set(id, updated);
    return updated;
  }

  async deleteContract(id: string): Promise<boolean> {
    return this.contracts.delete(id);
  }

  async getVirtualOffice(id: string): Promise<VirtualOffice | undefined> {
    return this.virtualOffices.get(id);
  }

  async getVirtualOfficesByOwner(ownerEmail: string): Promise<VirtualOffice[]> {
    return Array.from(this.virtualOffices.values()).filter(
      (office) => office.ownerEmail === ownerEmail,
    );
  }

  async createVirtualOffice(insertOffice: InsertVirtualOffice): Promise<VirtualOffice> {
    const id = randomUUID();
    const office: VirtualOffice = { 
      ...insertOffice,
      status: insertOffice.status ?? 'active',
      contractId: insertOffice.contractId ?? null,
      processType: insertOffice.processType ?? null,
      id,
      createdAt: new Date()
    };
    this.virtualOffices.set(id, office);
    return office;
  }

  async updateVirtualOffice(id: string, updates: Partial<VirtualOffice>): Promise<VirtualOffice | undefined> {
    const office = this.virtualOffices.get(id);
    if (!office) return undefined;
    
    const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
    const updated = { ...office, ...safeUpdates };
    this.virtualOffices.set(id, updated);
    return updated;
  }

  async deleteVirtualOffice(id: string): Promise<boolean> {
    return this.virtualOffices.delete(id);
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyByIco(ico: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(
      (company) => company.ico === ico
    );
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const company: Company = {
      ...insertCompany,
      id,
      dic: insertCompany.dic ?? null,
      icDph: insertCompany.icDph ?? null,
      sidloUlica: insertCompany.sidloUlica ?? null,
      sidloCislo: insertCompany.sidloCislo ?? null,
      sidloMesto: insertCompany.sidloMesto ?? null,
      sidloPsc: insertCompany.sidloPsc ?? null,
      registracnySud: insertCompany.registracnySud ?? null,
      cisloVlozky: insertCompany.cisloVlozky ?? null,
      datumZapisu: insertCompany.datumZapisu ?? null,
      pravnaForma: insertCompany.pravnaForma ?? null,
      stav: insertCompany.stav ?? 'pending_verification',
      stat: insertCompany.stat ?? 'SK',
      lastVerifiedAt: null,
      enforceTwoFactorAuth: insertCompany.enforceTwoFactorAuth ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
    const updated = { ...company, ...safeUpdates, updatedAt: new Date() };
    this.companies.set(id, updated);
    return updated;
  }

  async updateCompanySecuritySettings(companyId: string, enforceTwoFactorAuth: boolean): Promise<Company | undefined> {
    const company = this.companies.get(companyId);
    if (!company) return undefined;
    
    const updated = { ...company, enforceTwoFactorAuth, updatedAt: new Date() };
    this.companies.set(companyId, updated);
    return updated;
  }

  async getUserMandates(userId: string): Promise<Array<UserCompanyMandate & { company: Company }>> {
    const mandates = Array.from(this.userMandates.values()).filter(
      (mandate) => mandate.userId === userId
    );
    
    return mandates.map((mandate) => {
      const company = this.companies.get(mandate.companyId);
      if (!company) throw new Error(`Company ${mandate.companyId} not found`);
      return { ...mandate, company };
    });
  }

  async getCompanyMandatesByIco(ico: string): Promise<Array<UserCompanyMandate & { user: User }>> {
    // First find the company by ICO
    const company = Array.from(this.companies.values()).find(c => c.ico === ico);
    if (!company) {
      return [];
    }
    
    // Find all mandates for this company
    const mandates = Array.from(this.userMandates.values()).filter(
      (mandate) => mandate.companyId === company.id
    );
    
    // Enrich with user data
    return mandates.map((mandate) => {
      const user = this.users.get(mandate.userId);
      if (!user) throw new Error(`User ${mandate.userId} not found`);
      return { ...mandate, user };
    });
  }

  async createUserMandate(insertMandate: InsertUserCompanyMandate): Promise<UserCompanyMandate> {
    const id = randomUUID();
    const mandate: UserCompanyMandate = {
      ...insertMandate,
      id,
      platnyDo: insertMandate.platnyDo ?? null,
      zdrojOverenia: insertMandate.zdrojOverenia ?? 'OR SR Mock',
      stav: insertMandate.stav ?? 'pending_confirmation',
      isVerifiedByKep: insertMandate.isVerifiedByKep ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userMandates.set(id, mandate);
    return mandate;
  }

  async updateUserMandate(id: string, updates: Partial<UserCompanyMandate>): Promise<UserCompanyMandate | undefined> {
    const mandate = this.userMandates.get(id);
    if (!mandate) return undefined;
    
    const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates;
    const updated = { ...mandate, ...safeUpdates, updatedAt: new Date() };
    this.userMandates.set(id, updated);
    return updated;
  }

  async getUserMandate(id: string): Promise<UserCompanyMandate | undefined> {
    return this.userMandates.get(id);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
      companyId: insertLog.companyId ?? null,
    };
    this.auditLogs.set(id, log);
    console.log(`[AUDIT] ${insertLog.actionType}: ${insertLog.details}`);
    return log;
  }

  async getAuditLogsByCompany(companyId: string, limit: number = 100): Promise<Array<AuditLog & { user: User }>> {
    const logs = Array.from(this.auditLogs.values())
      .filter((log) => log.companyId === companyId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return logs.map((log) => {
      const user = this.users.get(log.userId);
      if (!user) throw new Error(`User ${log.userId} not found`);
      return { ...log, user };
    });
  }

  async getAuditLogsByUser(userId: string, limit: number = 100): Promise<Array<AuditLog>> {
    return Array.from(this.auditLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async resetToSeedData(): Promise<void> {
    console.log('[RESET] Clearing all data and re-seeding...');
    
    // Clear all data
    this.contracts.clear();
    this.virtualOffices.clear();
    this.companies.clear();
    this.userMandates.clear();
    this.auditLogs.clear();
    this.users.clear();
    
    // Re-seed the example data
    this.seedExampleData();
    
    console.log('[RESET] Data reset complete');
  }
}

export const storage = new MemStorage();
