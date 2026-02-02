import { type User, type InsertUser, type Document, type InsertDocument, type Settings, type InsertSettings, type Notification, type InsertNotification } from "@shared/schema";
import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

export class MySQLStorage {
  private pool: mysql.Pool;

  constructor() {
    // MySQL Connection Pool
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'reqgen_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    this.initializeTables();
  }

  private async initializeTables() {
    try {
      const connection = await this.pool.getConnection();
      
      // Create users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role VARCHAR(50) NOT NULL,
          name TEXT NOT NULL
        )
      `);

      // Create documents table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          original_note TEXT NOT NULL,
          refined_note TEXT,
          company_name TEXT,
          project_name TEXT,
          status TEXT DEFAULT 'pending',
          client_message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_updated_at TIMESTAMP NULL,
          updated_by TEXT,
          previous_content TEXT
        )
      `);

      // Create settings table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          company_name TEXT NOT NULL DEFAULT '',
          address TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          api_key TEXT NOT NULL DEFAULT '',
          logo MEDIUMTEXT NOT NULL DEFAULT '',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Upgrade logo column to MEDIUMTEXT if it's still TEXT (for existing databases)
      await connection.query(`
        ALTER TABLE settings MODIFY COLUMN logo MEDIUMTEXT NOT NULL DEFAULT ''
      `);

      // Insert default settings if not exists
      await connection.query(`
        INSERT INTO settings (id, company_name, address, phone, email, api_key, logo)
        SELECT UUID(), '', '', '', '', '', ''
        WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1)
      `);

      // Insert default demo users if not exists
      await connection.query(`
        INSERT INTO users (id, username, email, password, role, name)
        SELECT UUID(), 'analyst', 'analyst@reqgen.com', 'analyst123', 'analyst', 'Business Analyst'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'analyst@reqgen.com')
      `);

      await connection.query(`
        INSERT INTO users (id, username, email, password, role, name)
        SELECT UUID(), 'admin', 'admin@reqgen.com', 'admin123', 'admin', 'System Administrator'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@reqgen.com')
      `);

      await connection.query(`
        INSERT INTO users (id, username, email, password, role, name)
        SELECT UUID(), 'client', 'client@reqgen.com', 'client123', 'client', 'Client User'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'client@reqgen.com')
      `);

      connection.release();
      console.log('✅ MySQL tables initialized successfully');
      console.log('✅ Default demo users created (analyst, admin, client)');
    } catch (error) {
      console.error('❌ MySQL table initialization failed:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    await this.pool.query(
      'INSERT INTO users (id, username, email, password, role, name) VALUES (?, ?, ?, ?, ?, ?)',
      [id, user.username, user.email, user.password, user.role, user.name]
    );
    return { id, ...user };
  }

  async login(email: string, password: string, role: string): Promise<User | null> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT * FROM users WHERE email = ? AND password = ? AND role = ?',
      [email, password, role]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const createdAt = new Date();
    
    await this.pool.query(
      `INSERT INTO documents 
       (id, name, type, content, original_note, refined_note, company_name, project_name, status, client_message, created_at, last_updated_at, updated_by, previous_content) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        document.name,
        document.type,
        document.content,
        document.originalNote,
        document.refinedNote || null,
        document.companyName || null,
        document.projectName || null,
        document.status || 'pending',
        document.clientMessage || null,
        createdAt,
        null,
        null,
        null,
      ]
    );

    return {
      id,
      name: document.name,
      type: document.type,
      content: document.content,
      originalNote: document.originalNote,
      refinedNote: document.refinedNote || null,
      companyName: document.companyName || null,
      projectName: document.projectName || null,
      status: document.status || 'pending',
      clientMessage: document.clientMessage || null,
      createdAt,
      lastUpdatedAt: null,
      updatedBy: null,
      previousContent: null,
    };
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return undefined;
    
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      content: row.content,
      originalNote: row.original_note,
      refinedNote: row.refined_note,
      companyName: row.company_name,
      projectName: row.project_name,
      status: row.status || 'pending',
      clientMessage: row.client_message,
      createdAt: new Date(row.created_at),
      lastUpdatedAt: row.last_updated_at ? new Date(row.last_updated_at) : null,
      updatedBy: row.updated_by,
      previousContent: row.previous_content,
    };
  }

  async getAllDocuments(): Promise<Document[]> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT * FROM documents ORDER BY created_at DESC'
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      content: row.content,
      originalNote: row.original_note,
      refinedNote: row.refined_note,
      companyName: row.company_name,
      projectName: row.project_name,
      status: row.status || 'pending',
      clientMessage: row.client_message,
      createdAt: new Date(row.created_at),
      lastUpdatedAt: row.last_updated_at ? new Date(row.last_updated_at) : null,
      updatedBy: row.updated_by,
      previousContent: row.previous_content,
    }));
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>, updatedBy?: string, userRole?: string): Promise<Document | undefined> {
    // Get existing document to check if content is changing
    const existingDoc = await this.getDocument(id);
    if (!existingDoc) {
      return undefined;
    }
    
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.type !== undefined) {
      fields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    if (updates.originalNote !== undefined) {
      fields.push('original_note = ?');
      values.push(updates.originalNote);
    }
    if (updates.refinedNote !== undefined) {
      fields.push('refined_note = ?');
      values.push(updates.refinedNote);
    }
    if (updates.companyName !== undefined) {
      fields.push('company_name = ?');
      values.push(updates.companyName);
    }
    if (updates.projectName !== undefined) {
      fields.push('project_name = ?');
      values.push(updates.projectName);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.clientMessage !== undefined) {
      fields.push('client_message = ?');
      values.push(updates.clientMessage);
    }

    // Only store previous content if admin/analyst actually changes content for the first time
    // This tracks "has this document been edited via Edit button at least once?"
    const isAdminOrAnalyst = userRole === 'admin' || userRole === 'analyst';
    if (updates.content !== undefined && 
        updates.content !== existingDoc.content && 
        isAdminOrAnalyst && 
        existingDoc.previousContent === null) {
      fields.push('previous_content = ?');
      values.push(existingDoc.content);
    }
    
    // Always update lastUpdatedAt and updatedBy when any field changes
    fields.push('last_updated_at = ?');
    values.push(new Date());
    
    fields.push('updated_by = ?');
    values.push(updatedBy || null);

    if (fields.length === 0) {
      return this.getDocument(id);
    }

    values.push(id);
    await this.pool.query(
      `UPDATE documents SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.getDocument(id);
  }

  async deleteDocument(id: string): Promise<boolean> {
    const [result] = await this.pool.query<any>(
      'DELETE FROM documents WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  async getSettings(): Promise<Settings> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT * FROM settings LIMIT 1'
    );
    
    if (rows.length === 0) {
      // Create default settings if none exist
      const id = randomUUID();
      const updatedAt = new Date();
      await this.pool.query(
        `INSERT INTO settings (id, company_name, address, phone, email, api_key, logo, updated_at) 
         VALUES (?, '', '', '', '', '', '', ?)`,
        [id, updatedAt]
      );
      
      return {
        id,
        companyName: '',
        address: '',
        phone: '',
        email: '',
        apiKey: '',
        logo: '',
        updatedAt,
      };
    }
    
    const row = rows[0];
    return {
      id: row.id,
      companyName: row.company_name || '',
      address: row.address || '',
      phone: row.phone || '',
      email: row.email || '',
      apiKey: row.api_key || '',
      logo: row.logo || '',
      updatedAt: new Date(row.updated_at),
    };
  }

  async updateSettings(settings: InsertSettings): Promise<Settings> {
    const updatedAt = new Date();
    
    await this.pool.query(
      `UPDATE settings SET 
       company_name = ?,
       address = ?,
       phone = ?,
       email = ?,
       api_key = ?,
       logo = ?,
       updated_at = ?
       WHERE id = (SELECT id FROM settings LIMIT 1)`,
      [
        settings.companyName || '',
        settings.address || '',
        settings.phone || '',
        settings.email || '',
        settings.apiKey || '',
        settings.logo || '',
        updatedAt,
      ]
    );

    return this.getSettings();
  }

  async getAllUsers(): Promise<User[]> {
    throw new Error("getAllUsers not implemented in MySQLStorage");
  }

  async createNotification(_notification: InsertNotification): Promise<Notification> {
    throw new Error("createNotification not implemented in MySQLStorage");
  }

  async getNotificationsForUser(_userId: string, _userRole: string): Promise<Array<Notification & { isRead: string; readAt: Date | null }>> {
    throw new Error("getNotificationsForUser not implemented in MySQLStorage");
  }

  async markNotificationRead(_notificationId: string, _userId: string): Promise<boolean> {
    throw new Error("markNotificationRead not implemented in MySQLStorage");
  }

  async markAllNotificationsRead(_userId: string): Promise<boolean> {
    throw new Error("markAllNotificationsRead not implemented in MySQLStorage");
  }

  async close() {
    await this.pool.end();
  }
}
