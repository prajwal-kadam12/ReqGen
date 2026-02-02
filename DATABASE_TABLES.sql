-- ============================================
-- ReqGen Database Tables - Complete SQL
-- ============================================
-- 
-- कैसे Use करें:
-- 1. XAMPP में MySQL start करें
-- 2. phpMyAdmin खोलें (http://localhost/phpmyadmin)
-- 3. नया database बनाएं: reqgen_db
-- 4. इस SQL file को import करें
-- 
-- या Command Line से:
-- mysql -u root -p < DATABASE_TABLES.sql
-- ============================================

-- Database बनाएं
CREATE DATABASE IF NOT EXISTS reqgen_db;
USE reqgen_db;

-- ============================================
-- Table 1: USERS (यूजर की जानकारी)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('analyst', 'admin', 'client') NOT NULL DEFAULT 'analyst',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table 2: DOCUMENTS (सभी documents की जानकारी)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) DEFAULT NULL,
    document_name VARCHAR(255) DEFAULT NULL,
    type ENUM('brd', 'srs', 'sdd', 'po') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key - user के साथ link
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes - fast searching के लिए
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table 3: SETTINGS (Company settings)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(255) DEFAULT NULL,
    company_logo TEXT DEFAULT NULL,
    company_address TEXT DEFAULT NULL,
    company_phone VARCHAR(50) DEFAULT NULL,
    company_email VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key - user के साथ link
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- हर user की सिर्फ एक setting entry
    UNIQUE KEY unique_user_settings (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Default Data Insert करें
-- ============================================

-- 3 Default Users (Password: "password" सभी के लिए)
INSERT INTO users (username, email, password, role) VALUES
('analyst', 'analyst@reqgen.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'analyst'),
('admin', 'admin@reqgen.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('client', 'client@reqgen.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client')
ON DUPLICATE KEY UPDATE id=id;

-- Admin के लिए default company settings
INSERT INTO settings (user_id, company_name, company_address, company_phone, company_email)
SELECT id, 'ReqGen Solutions', '123 Business Street, Tech City, TC 12345', '+1 (555) 123-4567', 'contact@reqgen.com'
FROM users WHERE username = 'admin'
ON DUPLICATE KEY UPDATE user_id=user_id;

-- ============================================
-- Tables Successfully Created! ✅
-- ============================================
-- 
-- Default Login Credentials:
-- 
-- Analyst:
--   Email: analyst@reqgen.com
--   Password: password
-- 
-- Admin:
--   Email: admin@reqgen.com
--   Password: password
-- 
-- Client:
--   Email: client@reqgen.com
--   Password: password
-- 
-- ⚠️ Production में ये passwords जरूर change करें!
-- ============================================
