-- ============================================
-- ReqGen Application - MySQL Database Setup
-- For XAMPP / phpMyAdmin
-- ============================================

-- Create Database (अगर already नहीं है)
CREATE DATABASE IF NOT EXISTS reqgen_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use Database
USE reqgen_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content LONGTEXT NOT NULL,
  original_note LONGTEXT NOT NULL,
  refined_note LONGTEXT,
  company_name VARCHAR(255),
  project_name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  client_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP NULL,
  updated_by VARCHAR(255),
  previous_content LONGTEXT,
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_name VARCHAR(255) NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  api_key VARCHAR(255) NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_role VARCHAR(50) NOT NULL,
  document_id VARCHAR(36),
  document_name VARCHAR(255),
  creator_role VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_target_role (target_role),
  INDEX idx_document_id (document_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. USER_NOTIFICATIONS TABLE (Junction Table)
-- ============================================
CREATE TABLE IF NOT EXISTS user_notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  notification_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  is_read VARCHAR(10) NOT NULL DEFAULT 'false',
  read_at TIMESTAMP NULL,
  INDEX idx_notification_id (notification_id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DEMO USERS
-- ============================================

-- Clear existing users (optional - comment out अगर existing data रखना है)
-- TRUNCATE TABLE users;

-- Insert Demo Users (Passwords are plain text for demo - production में hash करें!)
INSERT INTO users (id, username, email, password, role, name) VALUES
(UUID(), 'analyst', 'analyst@reqgen.com', 'analyst123', 'analyst', 'Business Analyst'),
(UUID(), 'admin', 'admin@reqgen.com', 'admin123', 'admin', 'System Administrator'),
(UUID(), 'client', 'client@reqgen.com', 'client123', 'client', 'Client User')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================
-- INSERT DEFAULT SETTINGS
-- ============================================

-- Insert default settings row (केवल एक row होनी चाहिए)
INSERT INTO settings (id, company_name, address, phone, email, api_key, logo, updated_at) VALUES
(UUID(), '', '', '', '', '', '', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE company_name=company_name;

-- ============================================
-- HELPFUL QUERIES FOR TESTING
-- ============================================

-- Check all users
-- SELECT * FROM users;

-- Check all documents
-- SELECT * FROM documents ORDER BY created_at DESC;

-- Check settings
-- SELECT * FROM settings;

-- Check notifications
-- SELECT * FROM notifications ORDER BY created_at DESC;

-- Check user notifications with details
-- SELECT 
--   un.id,
--   u.name AS user_name,
--   u.role AS user_role,
--   n.title,
--   n.message,
--   un.is_read,
--   un.read_at,
--   n.created_at
-- FROM user_notifications un
-- JOIN users u ON un.user_id = u.id
-- JOIN notifications n ON un.notification_id = n.id
-- ORDER BY n.created_at DESC;

-- ============================================
-- SAMPLE DOCUMENT INSERT (Optional)
-- ============================================

/*
INSERT INTO documents (
  id, 
  name, 
  type, 
  content, 
  original_note, 
  refined_note, 
  company_name, 
  project_name, 
  status, 
  created_at
) VALUES (
  UUID(),
  'Sample BRD Document',
  'BRD',
  '<h1>Business Requirements Document</h1><p>This is a sample document...</p>',
  'Sample original notes from client',
  'Refined and structured requirements',
  'ABC Technologies',
  'E-commerce Platform',
  'pending',
  CURRENT_TIMESTAMP
);
*/

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ ReqGen Database Setup Complete!' AS Status;
SELECT 'Database Name: reqgen_db' AS Info;
SELECT 'Tables Created: 5 (users, documents, settings, notifications, user_notifications)' AS Info;
SELECT 'Demo Users: analyst@reqgen.com, admin@reqgen.com, client@reqgen.com' AS Info;
SELECT 'All Passwords: [username]123 (e.g., analyst123, admin123, client123)' AS Info;
