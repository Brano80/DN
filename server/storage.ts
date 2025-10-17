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
