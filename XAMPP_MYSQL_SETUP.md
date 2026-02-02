# 🚀 XAMPP MySQL Setup Guide - ReqGen
## एक ही Database Localhost और Replit दोनों पर Use करें

---

## 📋 **Table of Contents**

1. [Localhost Setup (XAMPP)](#1-localhost-setup-xampp)
2. [Replit Setup (ngrok Tunnel)](#2-replit-setup-ngrok-tunnel)
3. [Database Tables](#3-database-tables)
4. [Troubleshooting](#4-troubleshooting)

---

## 1️⃣ **Localhost Setup (XAMPP)**

### **Step 1: Start XAMPP**

1. **XAMPP Control Panel** खोलें
2. **Apache** और **MySQL** दोनों **Start** करें
3. Check करें कि दोनों **Running** status में हैं

### **Step 2: Create Database in phpMyAdmin**

1. Browser में जाएं: `http://localhost/phpmyadmin`
2. Left sidebar में **"New"** पर click करें
3. Database का नाम डालें: **`reqgen_db`**
4. Collation select करें: **`utf8mb4_general_ci`**
5. **"Create"** button पर click करें

✅ **Database बन गया!** Tables automatically create होंगी जब आप application चलाएंगे।

### **Step 3: Configure Environment Variables**

प्रोजेक्ट के **root folder** में `.env` file बनाएं:

```bash
# Copy .env.example to .env
cp .env.example .env
```

`.env` file खोलें और ये values set करें:

```env
# Database Configuration
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=reqgen_db

# Deepgram API (Voice Transcription)
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
SMTP_FROM_EMAIL=your_email@gmail.com
```

### **Step 4: Install Dependencies and Run**

```bash
# Install packages
npm install

# Run the application
npm run dev
```

**✅ Success!** Application `http://localhost:5000` पर चल रहा है।

**Log में दिखेगा:**
```
📦 Storage initialized: MySQL Database
✅ MySQL tables initialized successfully
11:40:44 AM [express] serving on port 5000
```

---

## 2️⃣ **Replit Setup (ngrok Tunnel)**

**Replit से आपके laptop के XAMPP MySQL को connect करने के लिए ngrok tunnel use करें:**

### **Step 1: Install ngrok on Your Laptop**

1. Download ngrok: **https://ngrok.com/download**
2. Extract करें और signup करें (free account)
3. Authtoken प्राप्त करें: https://dashboard.ngrok.com/get-started/your-authtoken
4. Authenticate करें:
   ```bash
   ngrok authtoken YOUR_AUTH_TOKEN_HERE
   ```

### **Step 2: Configure MySQL for Remote Access**

**XAMPP MySQL को remote connections के लिए configure करें:**

1. **phpMyAdmin** खोलें: `http://localhost/phpmyadmin`
2. **SQL** tab पर जाएं और ये query run करें:

```sql
-- Create remote user
CREATE USER 'root'@'%' IDENTIFIED BY '';

-- Grant privileges (replace 'reqgen_db' with your database name)
GRANT ALL PRIVILEGES ON reqgen_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

3. **MySQL Config File** edit करें:
   - Windows: `C:\xampp\mysql\bin\my.ini`
   - Mac/Linux: `/Applications/XAMPP/etc/my.cnf`

4. इस line को find करें और comment out करें:
   ```ini
   # bind-address = 127.0.0.1
   ```
   
   या बदल दें:
   ```ini
   bind-address = 0.0.0.0
   ```

5. **MySQL Restart** करें XAMPP Control Panel से

### **Step 3: Start ngrok Tunnel**

Terminal/Command Prompt खोलें और run करें:

```bash
ngrok tcp 3306
```

**Output कुछ ऐसा दिखेगा:**

```
Session Status                online
Account                       your_account (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Forwarding                    tcp://0.tcp.ngrok.io:18447 -> localhost:3306
```

**Important:** Note करें:
- **Host:** `0.tcp.ngrok.io`
- **Port:** `18447` (हर बार different हो सकता है)

### **Step 4: Configure Replit Secrets**

Replit में जाएं और **Secrets (🔒 lock icon)** में ये add करें:

```
USE_MYSQL=true
MYSQL_HOST=0.tcp.ngrok.io
MYSQL_PORT=18447
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=reqgen_db

DEEPGRAM_API_KEY=your_deepgram_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

### **Step 5: Restart Replit Workflow**

Replit पर **workflow restart** करें। Ab Replit आपके laptop के XAMPP MySQL से connected है! 🎉

---

## 3️⃣ **Database Tables**

Tables **automatically create** होंगी। आपको manually कुछ नहीं करना है।

### **✅ Tables List:**

#### **1. `users` Table**
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL
);
```

**Purpose:** User authentication (Analyst, Admin, Client)

---

#### **2. `documents` Table**
```sql
CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  original_note TEXT NOT NULL,
  refined_note TEXT,
  company_name TEXT,
  project_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Store all generated documents (BRD, SRS, SDD, PO)

**Fields:**
- `name`: Document name
- `type`: Document type (BRD, SRS, SDD, PO)
- `content`: Final document HTML content
- `original_note`: User's original input
- `refined_note`: AI-refined version
- `company_name`: Company name
- `project_name`: Project/Document name
- `created_at`: Creation timestamp

---

#### **3. `settings` Table**
```sql
CREATE TABLE settings (
  id VARCHAR(36) PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Purpose:** Application settings and company information

**Fields:**
- `company_name`: Company name for documents
- `address`: Company address
- `phone`: Contact phone
- `email`: Contact email
- `api_key`: OpenAI API key for AI refinement
- `logo`: Company logo (base64 or URL)
- `updated_at`: Last update timestamp

---

## 4️⃣ **Troubleshooting**

### **❌ Error: "Database connection failed"**

**Solution:**
1. Check XAMPP MySQL is **running**
2. Verify database name `reqgen_db` exists in phpMyAdmin
3. Check `.env` file credentials are correct
4. For Replit: Verify ngrok tunnel is running

---

### **❌ Error: "Table doesn't exist"**

**Solution:**
Tables auto-create होती हैं। If not:
1. Restart application
2. Check logs में `✅ MySQL tables initialized successfully` message
3. Manually check in phpMyAdmin → `reqgen_db` → Tables

---

### **❌ ngrok Tunnel Disconnects**

**Limitations:**
- Free ngrok URL हर restart पर change होता है
- Laptop sleep/shutdown होने पर tunnel बंद हो जाता है

**Solution:**
1. ngrok को running रखें
2. Replit Secrets में new URL update करें हर restart पर
3. **Production के लिए:** Cloud MySQL use करें (PlanetScale, Railway, Aiven)

---

### **❌ Can't Connect from Replit**

**Check:**
1. ngrok tunnel चल रहा है?
   ```bash
   ngrok tcp 3306
   ```
2. MySQL में remote access enabled है?
   ```sql
   SELECT user, host FROM mysql.user;
   ```
   `root@%` दिखना चाहिए

3. Firewall blocking तो नहीं कर रहा?
   - Windows Firewall में port 3306 allow करें

---

## 🎯 **Quick Reference Commands**

### **Localhost:**
```bash
# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Run application
npm run dev

# Check if MySQL is running
netstat -an | grep 3306
```

### **ngrok Tunnel:**
```bash
# Start tunnel
ngrok tcp 3306

# Check running tunnels
curl http://localhost:4040/api/tunnels
```

### **Database:**
```bash
# Access MySQL CLI
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE reqgen_db;

# Show tables
SHOW TABLES;

# Check table structure
DESCRIBE users;
DESCRIBE documents;
DESCRIBE settings;
```

---

## ✅ **Summary**

### **Localhost:**
1. ✅ XAMPP MySQL start करो
2. ✅ `reqgen_db` database बनाओ
3. ✅ `.env` file configure करो
4. ✅ `npm run dev` चलाओ
5. ✅ Tables automatically create होंगी!

### **Replit:**
1. ✅ ngrok install करो
2. ✅ MySQL remote access enable करो
3. ✅ `ngrok tcp 3306` चलाओ
4. ✅ Replit Secrets में ngrok URL add करो
5. ✅ Workflow restart करो
6. ✅ Same database दोनों जगह use हो रहा है! 🎉

---

## 📞 **Need Help?**

- **ngrok Documentation:** https://ngrok.com/docs
- **XAMPP Documentation:** https://www.apachefriends.org/docs/
- **MySQL Documentation:** https://dev.mysql.com/doc/

---

**Happy Coding! 🚀**
