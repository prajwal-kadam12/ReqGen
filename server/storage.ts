import { type User, type InsertUser, type Document, type InsertDocument, type Settings, type InsertSettings, type Notification, type InsertNotification, type UserNotification, type InsertUserNotification } from "@shared/schema";
import { randomUUID } from "crypto";
import { MySQLStorage } from "./mysql-storage";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const STORAGE_FILE = join(process.cwd(), ".storage-data.json");

interface StorageData {
  settings?: Settings;
  users?: Array<User>;
  documents?: Array<Document>;
  notifications?: Array<Notification>;
  userNotifications?: Array<UserNotification>;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  login(email: string, password: string, role: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<InsertDocument>, updatedBy?: string, userRole?: string): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;

  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsForUser(userId: string, userRole: string): Promise<Array<Notification & { isRead: string; readAt: Date | null }>>;
  markNotificationRead(notificationId: string, userId: string): Promise<boolean>;
  markAllNotificationsRead(userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private documents: Map<string, Document>;
  private settings: Settings;
  private notifications: Map<string, Notification>;
  private userNotifications: Map<string, UserNotification>;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.notifications = new Map();
    this.userNotifications = new Map();
    this.settings = {
      id: randomUUID(),
      companyName: "",
      address: "",
      phone: "",
      email: "",
      apiKey: "",
      logo: "",
      updatedAt: new Date(),
    };
    
    // Load data from file if exists
    this.loadFromFile();
    
    // Create default demo users
    this.initializeDefaultUsers();
  }

  private loadFromFile() {
    try {
      if (existsSync(STORAGE_FILE)) {
        const data: StorageData = JSON.parse(readFileSync(STORAGE_FILE, "utf-8"));
        
        if (data.settings) {
          this.settings = {
            ...data.settings,
            updatedAt: new Date(data.settings.updatedAt),
          };
        }
        
        if (data.documents) {
          data.documents.forEach(doc => {
            this.documents.set(doc.id, {
              ...doc,
              createdAt: new Date(doc.createdAt),
              lastUpdatedAt: doc.lastUpdatedAt ? new Date(doc.lastUpdatedAt) : null,
            });
          });
        }
        
        console.log("✅ Loaded saved data from file (.storage-data.json)");
      }
    } catch (error) {
      console.error("⚠️  Failed to load from file:", error);
    }
  }

  private saveToFile() {
    try {
      const data: StorageData = {
        settings: this.settings,
        users: Array.from(this.users.values()),
        documents: Array.from(this.documents.values()),
        notifications: Array.from(this.notifications.values()),
        userNotifications: Array.from(this.userNotifications.values()),
      };
      
      writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("⚠️  Failed to save to file:", error);
    }
  }

  private initializeDefaultUsers() {
    // Create Analyst user
    const analyst: User = {
      id: randomUUID(),
      username: "analyst",
      email: "analyst@reqgen.com",
      password: "analyst123",
      role: "analyst",
      name: "Business Analyst"
    };
    this.users.set(analyst.id, analyst);

    // Create Admin user
    const admin: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@reqgen.com",
      password: "admin123",
      role: "admin",
      name: "System Administrator"
    };
    this.users.set(admin.id, admin);

    // Create Client user
    const client: User = {
      id: randomUUID(),
      username: "client",
      email: "client@reqgen.com",
      password: "client123",
      role: "client",
      name: "Client User"
    };
    this.users.set(client.id, client);

    console.log('✅ Default demo users created (analyst, admin, client)');
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async login(email: string, password: string, role: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(
      (u) => u.email === email && u.password === password && u.role === role,
    );
    return user || null;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      refinedNote: insertDocument.refinedNote ?? null,
      companyName: insertDocument.companyName ?? null,
      projectName: insertDocument.projectName ?? null,
      status: insertDocument.status ?? "pending",
      clientMessage: insertDocument.clientMessage ?? null,
      id,
      createdAt: new Date(),
      lastUpdatedAt: null,
      updatedBy: null,
      previousContent: null,
    };
    this.documents.set(id, document);
    this.saveToFile();
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>, updatedBy?: string, userRole?: string): Promise<Document | undefined> {
    const existingDoc = this.documents.get(id);
    if (!existingDoc) {
      return undefined;
    }
    
    // Only store previous content if admin/analyst actually changes content for the first time
    // This tracks "has this document been edited via Edit button at least once?"
    let previousContent = existingDoc.previousContent;
    const isAdminOrAnalyst = userRole === 'admin' || userRole === 'analyst';
    if (updates.content !== undefined && 
        updates.content !== existingDoc.content && 
        isAdminOrAnalyst && 
        existingDoc.previousContent === null) {
      previousContent = existingDoc.content;
    }
    
    const updatedDoc: Document = {
      ...existingDoc,
      ...updates,
      id: existingDoc.id,
      createdAt: existingDoc.createdAt,
      lastUpdatedAt: new Date(),
      updatedBy: updatedBy || null,
      previousContent: previousContent,
    };
    
    this.documents.set(id, updatedDoc);
    return updatedDoc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    this.settings = {
      ...this.settings,
      ...insertSettings,
      updatedAt: new Date(),
    };
    this.saveToFile();
    return this.settings;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      documentId: insertNotification.documentId ?? null,
      documentName: insertNotification.documentName ?? null,
      creatorRole: insertNotification.creatorRole ?? null,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);

    // Create user_notifications entries for all users with target role
    const users = Array.from(this.users.values());
    const targetRole = insertNotification.targetRole;
    
    const targetUsers = users.filter(user => 
      targetRole === "all" || user.role === targetRole
    );

    for (const user of targetUsers) {
      const userNotificationId = randomUUID();
      const userNotification: UserNotification = {
        id: userNotificationId,
        notificationId: id,
        userId: user.id,
        isRead: "false",
        readAt: null,
      };
      this.userNotifications.set(userNotificationId, userNotification);
    }

    return notification;
  }

  async getNotificationsForUser(userId: string, userRole: string): Promise<Array<Notification & { isRead: string; readAt: Date | null }>> {
    // Get all user_notifications for this user
    const userNotifs = Array.from(this.userNotifications.values())
      .filter(un => un.userId === userId);
    
    // Join with notifications and return
    const result: Array<Notification & { isRead: string; readAt: Date | null }> = [];
    
    for (const userNotif of userNotifs) {
      const notification = this.notifications.get(userNotif.notificationId);
      if (notification) {
        result.push({
          ...notification,
          isRead: userNotif.isRead,
          readAt: userNotif.readAt,
        });
      }
    }
    
    // Sort by creation date, newest first
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
    const userNotif = Array.from(this.userNotifications.values())
      .find(un => un.notificationId === notificationId && un.userId === userId);
    
    if (!userNotif) {
      return false;
    }

    const updated: UserNotification = {
      ...userNotif,
      isRead: "true",
      readAt: new Date(),
    };
    
    this.userNotifications.set(userNotif.id, updated);
    return true;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const userNotifs = Array.from(this.userNotifications.values())
      .filter(un => un.userId === userId);
    
    for (const userNotif of userNotifs) {
      const updated: UserNotification = {
        ...userNotif,
        isRead: "true",
        readAt: new Date(),
      };
      this.userNotifications.set(userNotif.id, updated);
    }
    
    return true;
  }
}

// Choose storage based on environment variable
// Set USE_MYSQL=true in .env file to use MySQL with XAMPP
// Set USE_MYSQL=false (or leave empty) to use in-memory storage
const USE_MYSQL = process.env.USE_MYSQL === 'true';

export const storage: IStorage = USE_MYSQL 
  ? new MySQLStorage() 
  : new MemStorage();

console.log(`📦 Storage initialized: ${USE_MYSQL ? 'MySQL Database' : 'In-Memory (Temporary)'}`);
if (!USE_MYSQL) {
  console.log(`✅ Default demo users created (analyst, admin, client)`);
}
