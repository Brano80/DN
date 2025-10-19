import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  ownerEmail: text("owner_email").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
});

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export const virtualOffices = pgTable("virtual_offices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ownerEmail: text("owner_email").notNull(),
  invitedEmail: text("invited_email").notNull(),
  contractId: varchar("contract_id"),
  status: text("status").notNull().default("active"),
  processType: text("process_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVirtualOfficeSchema = createInsertSchema(virtualOffices).omit({
  id: true,
  createdAt: true,
});

export type InsertVirtualOffice = z.infer<typeof insertVirtualOfficeSchema>;
export type VirtualOffice = typeof virtualOffices.$inferSelect;
