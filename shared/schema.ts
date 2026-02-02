import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  name: text("name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  name: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  originalNote: text("original_note").notNull(),
  refinedNote: text("refined_note"),
  companyName: text("company_name"),
  projectName: text("project_name"),
  status: text("status").notNull().default("pending"),
  clientMessage: text("client_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUpdatedAt: timestamp("last_updated_at"),
  updatedBy: text("updated_by"),
  previousContent: text("previous_content"),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  lastUpdatedAt: true,
  updatedBy: true,
  previousContent: true,
}).extend({
  refinedNote: z.string().nullable(),
  companyName: z.string().nullable(),
  projectName: z.string().nullable(),
  status: z.enum(["pending", "approved", "needs_changes"]).default("pending"),
  clientMessage: z.string().nullable(),
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull().default(""),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  apiKey: text("api_key").notNull().default(""),
  logo: text("logo").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
}).extend({
  companyName: z.string().default(""),
  address: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  apiKey: z.string().default(""),
  logo: z.string().default(""),
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetRole: text("target_role").notNull(), // "admin", "analyst", or "all"
  documentId: varchar("document_id"),
  documentName: text("document_name"),
  creatorRole: text("creator_role"), // Role of user who triggered the notification
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  notificationId: varchar("notification_id").notNull(),
  userId: varchar("user_id").notNull(),
  isRead: text("is_read").notNull().default("false"), // "false" or "true"
  readAt: timestamp("read_at"),
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).omit({
  id: true,
});

export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;
