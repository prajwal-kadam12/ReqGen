-- ============================================
-- ReqGen - Test Users for Login
-- ============================================
-- Run this in phpMyAdmin after creating tables
-- These are test users with plain passwords
-- ============================================

USE reqgen_db;

-- ============================================
-- Insert Test Users
-- ============================================

-- User 1: Business Analyst
INSERT INTO users (id, username, email, password, role, name) 
VALUES (UUID(), 'analyst', 'analyst@reqgen.com', 'analyst123', 'analyst', 'Business Analyst');

-- User 2: System Administrator  
INSERT INTO users (id, username, email, password, role, name) 
VALUES (UUID(), 'admin', 'admin@reqgen.com', 'admin123', 'admin', 'System Administrator');

-- User 3: Client User
INSERT INTO users (id, username, email, password, role, name) 
VALUES (UUID(), 'client', 'client@reqgen.com', 'client123', 'client', 'Client User');

-- ============================================
-- Verify Users Created
-- ============================================
SELECT * FROM users;

-- ============================================
-- LOGIN CREDENTIALS
-- ============================================
-- Username: analyst  | Password: analyst123
-- Username: admin    | Password: admin123
-- Username: client   | Password: client123
-- ============================================
