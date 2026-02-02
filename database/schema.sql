-- ============================================
-- ReqGen Database Schema for XAMPP MySQL
-- Compatible with Node.js Backend
-- ============================================
--
-- INSTALLATION INSTRUCTIONS:
-- 
-- METHOD 1: phpMyAdmin (Easiest)
-- 1. Start XAMPP Control Panel
-- 2. Start MySQL service (green light)
-- 3. Open: http://localhost/phpmyadmin
-- 4. Click "New" to create database
-- 5. Database name: reqgen_db
-- 6. Collation: utf8mb4_unicode_ci
-- 7. Click "Create"
-- 8. Select "reqgen_db" from left sidebar
-- 9. Click "Import" tab
-- 10. Choose this file (schema.sql)
-- 11. Click "Go" button
-- 
-- METHOD 2: Command Line
-- 1. Open Command Prompt
-- 2. cd C:\xampp\mysql\bin
-- 3. mysql -u root -p < path\to\schema.sql
-- 4. Press Enter (no password for default XAMPP)
--
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS reqgen_db;
USE reqgen_db;

-- Drop existing tables (fresh start)
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    name TEXT NOT NULL,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    original_note TEXT NOT NULL,
    refined_note TEXT,
    company_name TEXT,
    project_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE settings (
    id VARCHAR(36) PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    api_key TEXT NOT NULL DEFAULT '',
    logo TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Demo Users (Plain text passwords for testing)
INSERT INTO users (id, username, email, password, role, name) VALUES
(UUID(), 'analyst', 'analyst@reqgen.com', 'analyst123', 'analyst', 'Business Analyst'),
(UUID(), 'admin', 'admin@reqgen.com', 'admin123', 'admin', 'System Administrator'),
(UUID(), 'client', 'client@reqgen.com', 'client123', 'client', 'Client User');

-- Default Settings
INSERT INTO settings (id, company_name, address, phone, email, api_key, logo)
VALUES (UUID(), '', '', '', '', '', '');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after import to verify:

-- Check users created
-- SELECT * FROM users;

-- Check settings created
-- SELECT * FROM settings;

-- Check all tables
-- SHOW TABLES;

-- ============================================
-- SUCCESS!
-- ============================================
-- Database ready! Now run your Node.js app:
-- npm run dev
--
-- Login with:
-- Email: analyst@reqgen.com
-- Password: analyst123
-- ============================================
