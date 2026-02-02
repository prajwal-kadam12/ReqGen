-- ============================================
-- ReqGen Database - Complete Setup Script
-- ============================================
-- Run this script in phpMyAdmin SQL tab
-- This will create database and all required tables
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS reqgen_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

USE reqgen_db;

-- ============================================
-- Table 1: Users
-- Purpose: User authentication (Analyst, Admin, Client)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  name TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Table 2: Documents
-- Purpose: Store all generated documents (BRD, SRS, SDD, PO)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  original_note TEXT NOT NULL,
  refined_note TEXT,
  company_name TEXT,
  project_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Table 3: Settings
-- Purpose: Application settings and company information
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Insert Default Settings Entry
-- ============================================
INSERT INTO settings (id, company_name, address, phone, email, api_key, logo)
SELECT UUID(), '', '', '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);

-- ============================================
-- Verify Tables Created Successfully
-- ============================================
SHOW TABLES;

-- ============================================
-- Display Table Structures
-- ============================================
DESCRIBE users;
DESCRIBE documents;
DESCRIBE settings;

-- ============================================
-- Show Settings Entry
-- ============================================
SELECT * FROM settings;

-- ============================================
-- SUCCESS! ✅
-- All tables created successfully
-- You can now configure .env and run the application
-- ============================================
