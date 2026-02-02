import { eq, and } from "drizzle-orm";
import { db } from "./index";
import * as schema from "../shared/schema";
import type { IStorage } from "../server/storage";
import type {
  User,
  InsertUser,
  Document,
  InsertDocument,
  Settings,
  InsertSettings,
  Notification,
  InsertNotification,
  UserNotification,
} from "../shared/schema";
import bcrypt from "bcryptjs";

export class DatabaseStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return result[0];
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db
      .insert(schema.users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return result[0];
  }

  async login(email: string, password: string, role: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || user.role !== role) {
      return null;
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return null;
    }
    
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const result = await db
      .insert(schema.documents)
      .values(insertDocument)
      .returning();
    return result[0];
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const result = await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id))
      .limit(1);
    return result[0];
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db
      .select()
      .from(schema.documents)
      .orderBy(schema.documents.createdAt);
  }

  async updateDocument(
    id: string,
    updates: Partial<InsertDocument>,
    updatedBy?: string,
    userRole?: string
  ): Promise<Document | undefined> {
    const existingDoc = await this.getDocument(id);
    if (!existingDoc) {
      return undefined;
    }

    const result = await db
      .update(schema.documents)
      .set({
        ...updates,
        lastUpdatedAt: new Date(),
        updatedBy: updatedBy || null,
        previousContent: existingDoc.content,
      })
      .where(eq(schema.documents.id, id))
      .returning();

    return result[0];
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.documents)
      .where(eq(schema.documents.id, id));
    return true;
  }

  async getSettings(): Promise<Settings> {
    const result = await db.select().from(schema.settings).limit(1);
    
    if (result.length === 0) {
      const defaultSettings: InsertSettings = {
        companyName: "",
        address: "",
        phone: "",
        email: "",
        apiKey: "",
        logo: "",
      };
      const newSettings = await db
        .insert(schema.settings)
        .values(defaultSettings)
        .returning();
      return newSettings[0];
    }
    
    return result[0];
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existingSettings = await this.getSettings();
    
    const result = await db
      .update(schema.settings)
      .set({
        ...insertSettings,
        updatedAt: new Date(),
      })
      .where(eq(schema.settings.id, existingSettings.id))
      .returning();
    
    return result[0];
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db
      .insert(schema.notifications)
      .values(insertNotification)
      .returning();
    return result[0];
  }

  async getNotificationsForUser(
    userId: string,
    userRole: string
  ): Promise<Array<Notification & { isRead: string; readAt: Date | null }>> {
    const notifications = await db
      .select()
      .from(schema.notifications)
      .where(
        eq(schema.notifications.targetRole, userRole)
      )
      .orderBy(schema.notifications.createdAt);

    const notificationsWithReadStatus = await Promise.all(
      notifications.map(async (notif) => {
        const userNotif = await db
          .select()
          .from(schema.userNotifications)
          .where(
            and(
              eq(schema.userNotifications.notificationId, notif.id),
              eq(schema.userNotifications.userId, userId)
            )
          )
          .limit(1);

        return {
          ...notif,
          isRead: userNotif[0]?.isRead || "false",
          readAt: userNotif[0]?.readAt || null,
        };
      })
    );

    return notificationsWithReadStatus;
  }

  async markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(schema.userNotifications)
      .where(
        and(
          eq(schema.userNotifications.notificationId, notificationId),
          eq(schema.userNotifications.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(schema.userNotifications)
        .set({
          isRead: "true",
          readAt: new Date(),
        })
        .where(eq(schema.userNotifications.id, existing[0].id));
    } else {
      await db.insert(schema.userNotifications).values({
        notificationId,
        userId,
        isRead: "true",
        readAt: new Date(),
      });
    }

    return true;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    const notifications = await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.targetRole, user.role));

    for (const notif of notifications) {
      await this.markNotificationRead(notif.id, userId);
    }

    return true;
  }
}
