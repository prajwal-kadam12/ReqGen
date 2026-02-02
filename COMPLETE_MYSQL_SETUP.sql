-- ============================================
-- ReqGen Application - Complete MySQL Database
-- Node.js Backend के लिए Complete Schema
-- ============================================

-- Database बनाएं
CREATE DATABASE IF NOT EXISTS reqgen_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE reqgen_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
DROP TABLE IF EXISTS user_notifications;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
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
CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'BRD, SRS, SDD, PO',
  content LONGTEXT NOT NULL COMMENT 'Final HTML content',
  original_note LONGTEXT NOT NULL COMMENT 'Original user notes',
  refined_note LONGTEXT COMMENT 'AI refined notes',
  company_name VARCHAR(255) COMMENT 'Company name for document',
  project_name VARCHAR(255) COMMENT 'Project/Document name',
  status VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, approved, needs_changes',
  client_message TEXT COMMENT 'Feedback from client',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP NULL DEFAULT NULL,
  updated_by VARCHAR(255) COMMENT 'Username of person who updated',
  previous_content LONGTEXT COMMENT 'Content before first edit',
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. SETTINGS TABLE
-- ============================================
CREATE TABLE settings (
  id VARCHAR(36) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  api_key VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'For future features',
  logo TEXT NOT NULL DEFAULT '' COMMENT 'Base64 or URL',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_role VARCHAR(50) NOT NULL COMMENT 'admin, analyst, client, or all',
  document_id VARCHAR(36) COMMENT 'Related document ID',
  document_name VARCHAR(255) COMMENT 'Related document name',
  creator_role VARCHAR(50) COMMENT 'Role of user who created notification',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_target_role (target_role),
  INDEX idx_document_id (document_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. USER_NOTIFICATIONS TABLE (Junction)
-- ============================================
CREATE TABLE user_notifications (
  id VARCHAR(36) PRIMARY KEY,
  notification_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  is_read VARCHAR(10) NOT NULL DEFAULT 'false' COMMENT 'false or true (string)',
  read_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_notification_id (notification_id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DEMO USERS
-- ============================================

-- UUID generation function (if not using triggers)
SET @analyst_id = UUID();
SET @admin_id = UUID();
SET @client_id = UUID();

INSERT INTO users (id, username, email, password, role, name) VALUES
(@analyst_id, 'analyst', 'analyst@reqgen.com', 'analyst123', 'analyst', 'Business Analyst'),
(@admin_id, 'admin', 'admin@reqgen.com', 'admin123', 'admin', 'System Administrator'),
(@client_id, 'client', 'client@reqgen.com', 'client123', 'client', 'Client User');

-- ============================================
-- INSERT DEFAULT SETTINGS
-- ============================================

INSERT INTO settings (id, company_name, address, phone, email, api_key, logo, updated_at) VALUES
(UUID(), '', '', '', '', '', '', CURRENT_TIMESTAMP);

-- ============================================
-- SAMPLE DATA (Optional - Comment करें अगर नहीं चाहिए)
-- ============================================

/*
-- Sample Document
SET @doc_id = UUID();
INSERT INTO documents (
  id, name, type, content, original_note, refined_note, 
  company_name, project_name, status, created_at
) VALUES (
  @doc_id,
  'E-Commerce Platform Requirements',
  'BRD',
  '<h1>Business Requirements Document</h1><h2>E-Commerce Platform</h2><p>Complete requirements for the new e-commerce platform...</p>',
  'We need an online shopping platform with cart, payment gateway, and order tracking.',
  'Business Requirements Document for E-Commerce Platform with detailed features including shopping cart, secure payment integration, order management system, and real-time order tracking.',
  'TechCorp Solutions',
  'E-Commerce Platform BRD',
  'pending',
  CURRENT_TIMESTAMP
);

-- Sample Notification
INSERT INTO notifications (
  id, title, message, target_role, document_id, 
  document_name, creator_role, created_at
) VALUES (
  UUID(),
  'New Document Created',
  'A new BRD document has been created: E-Commerce Platform Requirements',
  'all',
  @doc_id,
  'E-Commerce Platform Requirements',
  'analyst',
  CURRENT_TIMESTAMP
);

-- Create user_notifications for all users
INSERT INTO user_notifications (id, notification_id, user_id, is_read, read_at)
SELECT 
  UUID(),
  (SELECT id FROM notifications ORDER BY created_at DESC LIMIT 1),
  users.id,
  'false',
  NULL
FROM users;
*/

-- ============================================
-- USEFUL QUERIES (Testing के लिए)
-- ============================================

-- सभी Users देखें
SELECT id, username, email, role, name FROM users;

-- सभी Documents देखें (latest first)
SELECT 
  id,
  name,
  type,
  company_name,
  project_name,
  status,
  created_at,
  SUBSTRING(content, 1, 100) AS content_preview
FROM documents 
ORDER BY created_at DESC;

-- Settings देखें
SELECT * FROM settings;

-- सभी Notifications देखें
SELECT 
  id,
  title,
  message,
  target_role,
  document_name,
  creator_role,
  created_at
FROM notifications 
ORDER BY created_at DESC;

-- User के Unread Notifications देखें
SELECT 
  n.id,
  n.title,
  n.message,
  n.document_name,
  n.created_at,
  un.is_read,
  un.read_at
FROM user_notifications un
JOIN notifications n ON un.notification_id = n.id
JOIN users u ON un.user_id = u.id
WHERE u.email = 'analyst@reqgen.com'
  AND un.is_read = 'false'
ORDER BY n.created_at DESC;

-- Document count by type
SELECT 
  type,
  COUNT(*) as count
FROM documents
GROUP BY type;

-- Document count by status
SELECT 
  status,
  COUNT(*) as count
FROM documents
GROUP BY status;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Clear all documents (DANGEROUS!)
-- TRUNCATE TABLE documents;

-- Clear all notifications
-- TRUNCATE TABLE user_notifications;
-- TRUNCATE TABLE notifications;

-- Reset a user's password
-- UPDATE users SET password = 'newpassword' WHERE email = 'analyst@reqgen.com';

-- Mark all notifications as read for a user
-- UPDATE user_notifications 
-- SET is_read = 'true', read_at = CURRENT_TIMESTAMP
-- WHERE user_id = (SELECT id FROM users WHERE email = 'analyst@reqgen.com');

-- Delete old notifications (older than 30 days)
-- DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT '✅ ReqGen Database Setup Complete!' AS Status;
SELECT 'Database: reqgen_db' AS Info;
SELECT '5 Tables Created Successfully' AS Info;
SELECT 'Demo Users: 3 (analyst, admin, client)' AS Info;
SELECT 'Default Settings: 1 row' AS Info;
SELECT '' AS '';
SELECT '🔐 Login Credentials:' AS '';
SELECT 'analyst@reqgen.com / analyst123' AS Analyst;
SELECT 'admin@reqgen.com / admin123' AS Admin;
SELECT 'client@reqgen.com / client123' AS Client;
SELECT '' AS '';
SELECT '⚠️  Production में passwords change करें!' AS Warning;
