-- ============================================
-- ReqGen - MySQL Database Setup
-- ============================================
-- Run this file in phpMyAdmin or MySQL command line
-- Database name: reqgen_db
-- ============================================

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS reqgen_db;
USE reqgen_db;

-- ============================================
-- TABLE 1: users
-- ============================================
-- Stores user accounts with role-based access
-- Roles: analyst, admin, client
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  name TEXT NOT NULL,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 2: documents
-- ============================================
-- Stores all generated documents (BRD, SRS, SDD, PO)
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  content LONGTEXT NOT NULL,
  original_note LONGTEXT NOT NULL,
  refined_note LONGTEXT,
  company_name TEXT,
  project_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 3: settings
-- ============================================
-- Stores application settings and company info
-- Only one row is maintained (singleton pattern)
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  logo LONGTEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================
-- ⚠️ SECURITY WARNING:
-- These demo users have PLAINTEXT passwords for development/testing only!
-- DO NOT use these in production!
-- In production, implement proper password hashing (bcrypt, argon2, etc.)
-- ============================================

-- Insert default demo users (if not exists)
INSERT INTO users (id, username, email, password, role, name)
SELECT UUID(), 'analyst', 'analyst@reqgen.com', 'analyst123', 'analyst', 'Business Analyst'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'analyst@reqgen.com');

INSERT INTO users (id, username, email, password, role, name)
SELECT UUID(), 'admin', 'admin@reqgen.com', 'admin123', 'admin', 'System Administrator'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@reqgen.com');

INSERT INTO users (id, username, email, password, role, name)
SELECT UUID(), 'client', 'client@reqgen.com', 'client123', 'client', 'Client User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'client@reqgen.com');

-- Insert default settings (if not exists)
INSERT INTO settings (id, company_name, address, phone, email, api_key, logo)
SELECT UUID(), '', '', '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify setup

-- Check all tables exist
SHOW TABLES;

-- Verify users created
SELECT id, username, email, role, name FROM users;

-- Verify settings initialized
SELECT id, company_name, updated_at FROM settings;

-- Check documents table structure
DESCRIBE documents;

-- ============================================
-- USEFUL QUERIES FOR DEVELOPMENT
-- ============================================

-- View all documents
-- SELECT id, name, type, company_name, created_at FROM documents ORDER BY created_at DESC;

-- Count documents by type
-- SELECT type, COUNT(*) as count FROM documents GROUP BY type;

-- Delete all documents (CAUTION!)
-- DELETE FROM documents;

-- Reset demo users passwords
-- UPDATE users SET password = 'analyst123' WHERE email = 'analyst@reqgen.com';
-- UPDATE users SET password = 'admin123' WHERE email = 'admin@reqgen.com';
-- UPDATE users SET password = 'client123' WHERE email = 'client@reqgen.com';

-- Update company settings
-- UPDATE settings SET 
--   company_name = 'Your Company Name',
--   address = 'Your Address',
--   phone = '+91 1234567890',
--   email = 'contact@yourcompany.com';

-- ============================================
-- BACKUP COMMAND
-- ============================================
-- Run this in command line to backup database:
-- mysqldump -u root -p reqgen_db > reqgen_backup.sql

-- Restore from backup:
-- mysql -u root -p reqgen_db < reqgen_backup.sql

-- ============================================
-- DROP TABLES (CAUTION - DELETES ALL DATA!)
-- ============================================
-- Uncomment only if you want to completely reset

-- DROP TABLE IF EXISTS documents;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS settings;

-- ============================================
-- END OF SQL SCRIPT
-- ============================================
