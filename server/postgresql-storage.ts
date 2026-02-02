import { type User, type InsertUser, type Document, type InsertDocument, type Settings, type InsertSettings, type Notification, type InsertNotification, type UserNotification, type InsertUserNotification } from "@shared/schema";
import { db } from "../db";
import { users, documents, settings, notifications, userNotifications } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export class PostgreSQLStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if settings exist, if not create default
      const existingSettings = await db.select().from(settings).limit(1);
      
      if (existingSettings.length === 0) {
        await db.insert(settings).values({
          companyName: "",
          address: "",
          phone: "",
          email: "",
          apiKey: "",
          logo: "",
        });
      }

      // Create default demo users if not exist
      const existingUsers = await db.select().from(users);
      
      if (existingUsers.length === 0) {
        await db.insert(users).values([
          {
            username: "analyst",
            email: "analyst@reqgen.com",
            password: "analyst123",
            role: "analyst",
            name: "Business Analyst",
          },
          {
            username: "admin",
            email: "admin@reqgen.com",
            password: "admin123",
            role: "admin",
            name: "System Administrator",
          },
          {
            username: "client",
            email: "client@reqgen.com",
            password: "client123",
            role: "client",
            name: "Client User",
          },
        ]);
        console.log('✅ Default demo users created (analyst, admin, client)');
      }

      console.log('✅ PostgreSQL database initialized successfully');
    } catch (error) {
      console.error('❌ PostgreSQL database initialization failed:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async login(email: string, password: string, role: string): Promise<User | null> {
    const result = await db.select().from(users)
      .where(and(
        eq(users.email, email),
        eq(users.password, password),
        eq(users.role, role)
      ))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const result = await db.insert(documents).values(document).returning();
    return result[0];
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>, updatedBy?: string, userRole?: string): Promise<Document | undefined> {
    const existingDoc = await this.getDocument(id);
    if (!existingDoc) {
      return undefined;
    }

    // Build update object with proper fields
    const updateData: any = {
      ...updates,
      lastUpdatedAt: new Date(),
    };

    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }

    // If content is being updated, store previous content
    if (updates.content && updates.content !== existingDoc.content) {
      updateData.previousContent = existingDoc.content;
    }

    const result = await db.update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();

    return result[0];
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }

  async getSettings(): Promise<Settings> {
    const result = await db.select().from(settings).limit(1);
    
    if (result.length === 0) {
      // Create default settings if not exist
      const newSettings = await db.insert(settings).values({
        companyName: "",
        address: "",
        phone: "",
        email: "",
        apiKey: "",
        logo: "",
      }).returning();
      return newSettings[0];
    }
    
    return result[0];
  }

  async updateSettings(newSettings: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings();
    
    const result = await db.update(settings)
      .set({
        ...newSettings,
        updatedAt: new Date(),
      })
      .where(eq(settings.id, existing.id))
      .returning();

    return result[0];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async getNotificationsForUser(userId: string, userRole: string): Promise<Array<Notification & { isRead: string; readAt: Date | null }>> {
    // Get all notifications for user's role or "all"
    const allNotifications = await db.select().from(notifications)
      .where(eq(notifications.targetRole, userRole))
      .orderBy(notifications.createdAt);

    const globalNotifications = await db.select().from(notifications)
      .where(eq(notifications.targetRole, "all"))
      .orderBy(notifications.createdAt);

    const combinedNotifications = [...allNotifications, ...globalNotifications];

    // Get user notification status
    const userNotifs = await db.select().from(userNotifications)
      .where(eq(userNotifications.userId, userId));

    // Merge notification data with read status
    return combinedNotifications.map(notif => {
      const userNotif = userNotifs.find(un => un.notificationId === notif.id);
      return {
        ...notif,
        isRead: userNotif?.isRead || "false",
        readAt: userNotif?.readAt || null,
      };
    });
  }

  async markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      // Check if user notification exists
      const existing = await db.select().from(userNotifications)
        .where(and(
          eq(userNotifications.notificationId, notificationId),
          eq(userNotifications.userId, userId)
        ))
        .limit(1);

      if (existing.length === 0) {
        // Create new user notification entry
        await db.insert(userNotifications).values({
          notificationId,
          userId,
          isRead: "true",
          readAt: new Date(),
        });
      } else {
        // Update existing
        await db.update(userNotifications)
          .set({
            isRead: "true",
            readAt: new Date(),
          })
          .where(and(
            eq(userNotifications.notificationId, notificationId),
            eq(userNotifications.userId, userId)
          ));
      }

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    try {
      // Get all notifications for this user's role
      const user = await this.getUser(userId);
      if (!user) return false;

      const allNotifs = await this.getNotificationsForUser(userId, user.role);

      // Mark each notification as read
      for (const notif of allNotifs) {
        await this.markNotificationRead(notif.id, userId);
      }

      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }
}
