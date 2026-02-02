# 📋 Database Setup Instructions - ReqGen

## ℹ️ Important Note

**आप यह SQL file manually run कर सकते हैं, लेकिन ज़रूरी नहीं है!**

ReqGen application **automatically** tables create करती है जब आप पहली बार MySQL के साथ run करते हैं। यह SQL file सिर्फ reference के लिए है अगर आप manually database setup करना चाहते हैं।

**Recommended:** Simply run the application with `USE_MYSQL=true` in .env file and tables will be auto-created!

---

## 🚀 Manual Setup (Optional - phpMyAdmin में run करें)

### **Step 1: XAMPP Start करें**

1. **XAMPP Control Panel** खोलें
2. **MySQL** को **Start** करें
3. Green status दिखने का wait करें

---

### **Step 2: phpMyAdmin खोलें**

Browser में जाएं: **`http://localhost/phpmyadmin`**

---

### **Step 3: SQL Script Run करें**

1. phpMyAdmin में **SQL** tab पर click करें
2. `database/create_tables.sql` file खोलें (या नीचे दी गई script copy करें)
3. पूरी script को SQL editor में paste करें
4. **Go** button पर click करें

---

### **Step 4: Verify करें**

Script run होने के बाद आपको दिखेगा:

✅ **Database created:** `reqgen_db`

✅ **Tables created:**
- `users` (6 columns)
- `documents` (9 columns)  
- `settings` (8 columns)

✅ **Demo users created (DEVELOPMENT ONLY):**
- analyst@reqgen.com (password: analyst123)
- admin@reqgen.com (password: admin123)
- client@reqgen.com (password: client123)

⚠️ **SECURITY WARNING:** These passwords are in PLAINTEXT for development/testing only!
For production, implement proper password hashing (bcrypt, argon2, etc.)

✅ **Default settings entry inserted**

Left sidebar में `reqgen_db` database select करें और check करें कि सभी 3 tables दिख रही हैं।

---

## 📄 SQL Script Location

**File:** `database/create_tables.sql`

**या direct copy करें:**

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS reqgen_db;
USE reqgen_db;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  name TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  content LONGTEXT NOT NULL,
  original_note LONGTEXT NOT NULL,
  refined_note LONGTEXT,
  company_name TEXT,
  project_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Settings Table
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

-- Insert Demo Users
INSERT INTO users (id, username, email, password, role, name)
SELECT UUID(), 'analyst', 'analyst@reqgen.com', 'analyst123', 'analyst', 'Business Analyst'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'analyst@reqgen.com');

INSERT INTO users (id, username, email, password, role, name)
SELECT UUID(), 'admin', 'admin@reqgen.com', 'admin123', 'admin', 'System Administrator'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@reqgen.com');

INSERT INTO users (id, username, email, password, role, name)
SELECT UUID(), 'client', 'client@reqgen.com', 'client123', 'client', 'Client User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'client@reqgen.com');

-- Insert Default Settings
INSERT INTO settings (id, company_name, address, phone, email, api_key, logo)
SELECT UUID(), '', '', '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);
```

---

## ⚙️ Configure Application

Database बनने के बाद:

### **1. Create .env file**

```bash
cp .env.example .env
```

### **2. Edit .env file:**

```env
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=reqgen_db

DEEPGRAM_API_KEY=your_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

### **3. Run Application:**

```bash
npm install
npm run dev
```

---

## ✅ Success Check

Application start होने पर console में दिखेगा:

```
📦 Storage initialized: MySQL Database
✅ MySQL tables initialized successfully
11:40:44 AM [express] serving on port 5000
```

---

## 📊 Table Details

### **1. users**
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | UUID primary key |
| username | VARCHAR(255) | Unique username |
| email | VARCHAR(255) | Unique email |
| password | TEXT | User password |
| role | VARCHAR(50) | analyst/admin/client |
| name | TEXT | Full name |

### **2. documents**
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | UUID primary key |
| name | TEXT | Document name |
| type | TEXT | BRD/SRS/SDD/PO |
| content | TEXT | Final HTML |
| original_note | TEXT | User input |
| refined_note | TEXT | AI refined |
| company_name | TEXT | Company |
| project_name | TEXT | Project |
| created_at | TIMESTAMP | Created date |

### **3. settings**
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | UUID primary key |
| company_name | TEXT | Company name |
| address | TEXT | Address |
| phone | TEXT | Phone |
| email | TEXT | Email |
| api_key | TEXT | OpenAI key |
| logo | TEXT | Logo data |
| updated_at | TIMESTAMP | Last update |

---

## 🔍 Useful SQL Commands

**View all tables:**
```sql
SHOW TABLES;
```

**Check table structure:**
```sql
DESCRIBE users;
DESCRIBE documents;
DESCRIBE settings;
```

**View all documents:**
```sql
SELECT id, name, type, created_at FROM documents ORDER BY created_at DESC;
```

**View settings:**
```sql
SELECT * FROM settings;
```

**Count records:**
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM documents;
```

---

## 🆘 Troubleshooting

### **Error: Database already exists**
✅ Normal! Script uses `IF NOT EXISTS` - safe to run multiple times

### **Error: Table already exists**
✅ Normal! Tables won't be recreated if they exist

### **Error: Access denied**
❌ Check XAMPP MySQL is running and user is `root` with empty password

### **No tables showing**
1. Refresh phpMyAdmin page
2. Select `reqgen_db` from left sidebar
3. Click on "Structure" tab

---

**Ready to use! 🚀**
