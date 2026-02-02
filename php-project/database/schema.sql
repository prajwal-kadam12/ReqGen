-- ============================================
-- ReqGen Application - Complete MySQL Schema
-- For PHP Backend
-- ============================================

DROP DATABASE IF EXISTS reqgen_db;
CREATE DATABASE reqgen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reqgen_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
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
CREATE TABLE settings (
  id VARCHAR(36) PRIMARY KEY,
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
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
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
-- 5. USER_NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE user_notifications (
  id VARCHAR(36) PRIMARY KEY,
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
-- INSERT DEMO DATA
-- ============================================

-- Demo Users (Passwords: analyst123, admin123, client123)
INSERT INTO users (id, username, email, password, role, name) VALUES
(UUID(), 'analyst', 'analyst@reqgen.com', 'analyst123', 'analyst', 'Business Analyst'),
(UUID(), 'admin', 'admin@reqgen.com', 'admin123', 'admin', 'System Administrator'),
(UUID(), 'client', 'client@reqgen.com', 'client123', 'client', 'Client User');

-- Default Settings
INSERT INTO settings (id, company_name, address, phone, email, api_key, logo, updated_at) VALUES
(UUID(), '', '', '', '', '', '', CURRENT_TIMESTAMP);

-- ============================================
-- SUCCESS
-- ============================================
SELECT '✅ Database setup complete!' AS Status;
SELECT 'Database: reqgen_db' AS Info;
SELECT '5 Tables created' AS Info;
SELECT '3 Demo users inserted' AS Info;
