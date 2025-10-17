import { 
  type User, 
  type InsertUser, 
  type Contract, 
  type InsertContract,
  type VirtualOffice,
  type InsertVirtualOffice
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contracts: Map<string, Contract>;
  private virtualOffices: Map<string, VirtualOffice>;

  constructor() {
    this.users = new Map();
    this.contracts = new Map();
    this.virtualOffices = new Map();
  }

  seedExampleData() {
    console.log('[SEED] Seeding example data for Škoda Octavia...');
    // Create example contract for Škoda Octavia
    const contractId = "example-skoda-octavia";
    const exampleContract: Contract = {
      id: contractId,
      title: "Predaj vozidla - Škoda Octavia",
      type: "vehicle",
      ownerEmail: "jan.novak@example.com",
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
      ownerEmail: "jan.novak@example.com",
      invitedEmail: "tomas.horvath@example.com",
      status: "completed",
      contractId: contractId,
      processType: null,
      createdAt: new Date("2024-12-22")
    };
    this.virtualOffices.set(officeId, exampleOffice);
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
}

export const storage = new MemStorage();
