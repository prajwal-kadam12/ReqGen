# 🚀 ReqGen - Complete MySQL Setup Guide (हिंदी में)

## 📋 यह Setup किसके लिए है?

यह setup आपके **currently running Node.js backend** के लिए है। यह सभी features support करता है:
- ✅ User Authentication (3 roles: Analyst, Admin, Client)
- ✅ Document Management (BRD, SRS, SDD, PO)
- ✅ AI Document Refinement (OpenAI)
- ✅ Voice Transcription (Deepgram - Multi-language)
- ✅ Email with PDF Attachments (SMTP)
- ✅ Real-time Notifications System
- ✅ Company Settings Management
- ✅ Document Version Control

---

## 🗄️ Database Schema Overview

### 5 Tables बनेंगे:

| Table Name | Purpose | Records |
|------------|---------|---------|
| `users` | User accounts (analyst, admin, client) | 3 demo users |
| `documents` | सभी generated documents | Empty initially |
| `settings` | Company information & logo | 1 default row |
| `notifications` | System notifications | Empty initially |
| `user_notifications` | User-specific notification tracking | Empty initially |

---

## 🔧 Step-by-Step Setup

### **Step 1: XAMPP Start करें**

1. **XAMPP Control Panel** खोलें
2. **Apache** को Start करें (green button)
3. **MySQL** को Start करें (green button)
4. दोनों **running** (green color) होने चाहिए

---

### **Step 2: phpMyAdmin खोलें**

दो तरीके हैं:

**विकल्प A:**
- Browser में जाएं: `http://localhost/phpmyadmin`

**विकल्प B:**
- XAMPP Control Panel में MySQL के सामने **"Admin"** button click करें

---

### **Step 3: Database Setup (आसान तरीका)**

#### **Method 1: SQL File Import (Recommended) ⭐**

1. phpMyAdmin में left sidebar में **"New"** button click करें
2. Database name: `reqgen_db` टाइप करें
3. Collation: `utf8mb4_unicode_ci` select करें
4. **"Create"** button click करें
5. Left sidebar में `reqgen_db` पर click करें
6. ऊपर **"Import"** tab click करें
7. **"Choose File"** button click करें
8. `COMPLETE_MYSQL_SETUP.sql` file select करें
9. नीचे scroll करें और **"Import"** button click करें
10. ✅ **Success!** - "Import has been successfully finished" message दिखेगा

#### **Method 2: Manual SQL Run**

1. phpMyAdmin में ऊपर **"SQL"** tab click करें
2. `COMPLETE_MYSQL_SETUP.sql` file को notepad में खोलें
3. सारा SQL code copy करें (Ctrl+A फिर Ctrl+C)
4. phpMyAdmin के SQL box में paste करें (Ctrl+V)
5. नीचे **"Go"** button click करें
6. ✅ **Success!**

---

### **Step 4: Verify Database Setup**

1. **Left sidebar** में `reqgen_db` database दिखेगा
2. उस पर click करें
3. **5 tables** दिखने चाहिए:
   - ✅ `users` (3 rows)
   - ✅ `documents` (0 rows - यह normal है)
   - ✅ `settings` (1 row)
   - ✅ `notifications` (0 rows - यह normal है)
   - ✅ `user_notifications` (0 rows - यह normal है)

#### **Users Table Verify करें:**

1. `users` table पर click करें
2. ऊपर **"Browse"** tab click करें
3. **3 users** दिखने चाहिए:

| ID | Username | Email | Password | Role | Name |
|----|----------|-------|----------|------|------|
| (UUID) | analyst | analyst@reqgen.com | analyst123 | analyst | Business Analyst |
| (UUID) | admin | admin@reqgen.com | admin123 | admin | System Administrator |
| (UUID) | client | client@reqgen.com | client123 | client | Client User |

#### **Settings Table Verify करें:**

1. `settings` table पर click करें
2. **"Browse"** tab click करें
3. **1 empty row** होनी चाहिए (सभी fields blank)

---

## 🔗 Node.js Backend को MySQL से Connect करें

### **Local Development के लिए:**

आपका Node.js backend currently **in-memory storage** use कर रहा है। MySQL use करने के लिए:

#### **Step 1: `.env` file बनाएं/Edit करें**

Project के root folder में `.env` file बनाएं या edit करें:

```env
# Enable MySQL (बहुत important!)
USE_MYSQL=true

# MySQL Configuration (XAMPP)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=reqgen_db

# SMTP Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# API Keys (Voice & AI Features)
DEEPGRAM_API_KEY=your-deepgram-api-key
OPENAI_API_KEY=your-openai-api-key
```

#### **Step 2: MySQL Storage Check करें**

File `server/mysql-storage.ts` exist करती है check करें। यह file MySQL connection handle करती है।

#### **Step 3: Application Restart करें**

```bash
# Terminal में:
npm run dev
```

#### **Step 4: Verify Connection**

Console में यह message दिखना चाहिए:
```
📦 Storage initialized: MySQL Database
```

अगर यह दिखता है:
```
📦 Storage initialized: In-Memory (Temporary)
```

तो `.env` file में `USE_MYSQL=true` properly set नहीं है।

---

## 🔐 Default Login Credentials

Application में login करने के लिए:

### **Analyst Login:**
```
Email: analyst@reqgen.com
Password: analyst123
Role: Analyst (select from dropdown)
```

### **Admin Login:**
```
Email: admin@reqgen.com
Password: admin123
Role: Admin (select from dropdown)
```

### **Client Login:**
```
Email: client@reqgen.com
Password: client123
Role: Client (select from dropdown)
```

⚠️ **Important:** Production में ये passwords **जरूर change** करें!

---

## 📊 Useful MySQL Queries (Testing के लिए)

### **सभी Users देखें:**
```sql
SELECT id, username, email, role, name FROM users;
```

### **सभी Documents देखें:**
```sql
SELECT 
  id,
  name,
  type,
  company_name,
  project_name,
  status,
  created_at
FROM documents 
ORDER BY created_at DESC;
```

### **Company Settings देखें:**
```sql
SELECT * FROM settings;
```

### **सभी Notifications देखें:**
```sql
SELECT * FROM notifications ORDER BY created_at DESC;
```

### **Specific User के Unread Notifications:**
```sql
SELECT 
  n.title,
  n.message,
  n.document_name,
  n.created_at
FROM user_notifications un
JOIN notifications n ON un.notification_id = n.id
JOIN users u ON un.user_id = u.id
WHERE u.email = 'analyst@reqgen.com'
  AND un.is_read = 'false'
ORDER BY n.created_at DESC;
```

### **Document Type Summary:**
```sql
SELECT type, COUNT(*) as total 
FROM documents 
GROUP BY type;
```

### **Document Status Summary:**
```sql
SELECT status, COUNT(*) as total 
FROM documents 
GROUP BY status;
```

---

## 🛠️ Data Management Queries

### **नया User Add करें:**
```sql
INSERT INTO users (id, username, email, password, role, name) VALUES
(UUID(), 'newuser', 'newuser@example.com', 'password123', 'analyst', 'New User Name');
```

### **User Password Change करें:**
```sql
UPDATE users 
SET password = 'newpassword123' 
WHERE email = 'analyst@reqgen.com';
```

### **Company Settings Update करें:**
```sql
UPDATE settings SET 
  company_name = 'Your Company Name',
  address = 'Your Company Address',
  phone = '+91 1234567890',
  email = 'company@example.com'
WHERE id = (SELECT id FROM settings LIMIT 1);
```

### **Specific Document Delete करें:**
```sql
DELETE FROM documents WHERE id = 'document-uuid-here';
```

### **सभी Documents Clear करें (DANGEROUS!):**
```sql
TRUNCATE TABLE documents;
```

### **सभी Notifications Clear करें:**
```sql
TRUNCATE TABLE user_notifications;
TRUNCATE TABLE notifications;
```

---

## ⚠️ Common Issues & Solutions

### **Problem 1: "Database connection failed"**

**Symptoms:**
- Application में error आता है
- Console में connection error दिखता है

**Solutions:**
1. ✅ XAMPP में MySQL running है check करें (green light)
2. ✅ Database name `reqgen_db` exactly match करता है verify करें
3. ✅ `.env` file में credentials correct हैं check करें:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=          ← blank for XAMPP default
   MYSQL_DATABASE=reqgen_db
   ```
4. ✅ Port 3306 free है verify करें (Task Manager → Services → MySQL)

### **Problem 2: "USE_MYSQL not working - still using in-memory"**

**Symptoms:**
- Console shows: `📦 Storage initialized: In-Memory (Temporary)`
- Data delete हो जाता है restart के बाद

**Solutions:**
1. ✅ `.env` file में exact line: `USE_MYSQL=true` (no spaces!)
2. ✅ `.env` file project के **root folder** में है (not in subdirectory)
3. ✅ `dotenv` package installed है check करें: `npm install dotenv`
4. ✅ Application restart करें: Stop (Ctrl+C) फिर `npm run dev`

### **Problem 3: "Table doesn't exist" Error**

**Symptoms:**
- SQL queries में error: "Table 'reqgen_db.users' doesn't exist"

**Solutions:**
1. ✅ phpMyAdmin में verify करें कि tables exist करती हैं
2. ✅ Left sidebar में `reqgen_db` select है check करें
3. ✅ SQL file फिर से import करें (Method 1 follow करें)
4. ✅ Database name exactly `reqgen_db` है confirm करें

### **Problem 4: "Access denied for user 'root'"**

**Symptoms:**
- MySQL connection error
- Password related error message

**Solutions:**
1. ✅ XAMPP में MySQL का default password **blank** होता है
2. ✅ `.env` में: `MYSQL_PASSWORD=` (कुछ नहीं लिखें, blank छोड़ें)
3. ✅ अगर आपने password set किया है तो वही password use करें
4. ✅ phpMyAdmin में login हो पा रहा है check करें

### **Problem 5: "Foreign key constraint fails"**

**Symptoms:**
- Data insert करते समय error

**Solutions:**
1. ✅ Parent table में record exist करता है check करें
2. ✅ Example: notification insert करने से पहले user exist होना चाहिए
3. ✅ सही order में data insert करें (पहले users, फिर notifications)

### **Problem 6: "Hindi/Marathi text not displaying correctly"**

**Symptoms:**
- ??? या boxes दिख रहे हैं Hindi text की जगह

**Solutions:**
1. ✅ Tables `utf8mb4` charset use कर रहे हैं verify करें
2. ✅ Connection में charset set है: `SET NAMES utf8mb4;`
3. ✅ Database collation `utf8mb4_unicode_ci` है check करें
4. ✅ Browser encoding UTF-8 है verify करें

---

## 🔄 Database Backup & Restore

### **Backup लेना (Important!):**

#### **Method 1: phpMyAdmin से**
1. phpMyAdmin में `reqgen_db` select करें
2. ऊपर **"Export"** tab click करें
3. Format: **"SQL"** select करें
4. नीचे **"Go"** button click करें
5. `.sql` file download हो जाएगी
6. इसे safe जगह save करें

#### **Method 2: Command Line से**
```bash
# XAMPP MySQL bin folder में जाएं
cd C:\xampp\mysql\bin

# Backup create करें
mysqldump -u root -p reqgen_db > reqgen_backup_2024_11_13.sql

# Password blank है तो सिर्फ Enter press करें
```

### **Backup Restore करना:**

#### **Method 1: phpMyAdmin से**
1. Database drop करें (optional): `DROP DATABASE reqgen_db;`
2. नया database बनाएं: `reqgen_db`
3. **"Import"** tab click करें
4. Backup `.sql` file choose करें
5. **"Go"** click करें

#### **Method 2: Command Line से**
```bash
cd C:\xampp\mysql\bin
mysql -u root -p reqgen_db < reqgen_backup_2024_11_13.sql
```

---

## 🔐 Security Best Practices

### **Production में ये जरूर करें:**

1. **Passwords Hash करें:**
```sql
-- Plain text passwords NEVER use करें production में
-- PHP में: password_hash('password', PASSWORD_BCRYPT)
-- Node.js में: bcrypt.hash('password', 10)
```

2. **Strong Passwords Use करें:**
```sql
UPDATE users SET password = 'StrongP@ssw0rd!123' WHERE email = 'admin@reqgen.com';
```

3. **Unused Accounts Delete करें:**
```sql
DELETE FROM users WHERE email = 'client@reqgen.com'; -- अगर use नहीं हो रहा
```

4. **Regular Backups:**
- Daily backup schedule बनाएं
- Multiple locations में store करें
- Backup restore test करें

5. **Database User Permissions:**
```sql
-- Root user सिर्फ development में use करें
-- Production में limited permissions वाला user बनाएं
CREATE USER 'reqgen_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON reqgen_db.* TO 'reqgen_user'@'localhost';
```

---

## 📈 Performance Optimization

### **Indexes Already Applied:**
- ✅ `users.email` - Fast login lookups
- ✅ `users.username` - Fast username searches
- ✅ `documents.type` - Filter by document type
- ✅ `documents.status` - Filter by status
- ✅ `notifications.target_role` - User-specific notifications
- ✅ `user_notifications.user_id` - User notification queries

### **Additional Optimization Tips:**

1. **Regular Maintenance:**
```sql
-- Tables optimize करें
OPTIMIZE TABLE users;
OPTIMIZE TABLE documents;
OPTIMIZE TABLE notifications;
```

2. **Old Data Cleanup:**
```sql
-- 90 दिन पुराने notifications delete करें
DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

3. **Query Performance Check:**
```sql
-- Slow queries identify करें
EXPLAIN SELECT * FROM documents WHERE type = 'BRD' ORDER BY created_at DESC;
```

---

## ✅ Success Checklist

Setup complete होने के बाद verify करें:

- [x] XAMPP Apache & MySQL running
- [x] Database `reqgen_db` created
- [x] 5 tables successfully created
- [x] 3 demo users inserted
- [x] 1 settings row inserted
- [x] `.env` file properly configured
- [x] Application connects to MySQL (not in-memory)
- [x] Login works with demo credentials
- [x] Documents can be created
- [x] Notifications system working

---

## 🎯 Next Steps

1. ✅ Login करें demo credentials के साथ
2. ✅ Document create करें (BRD/SRS/SDD/PO)
3. ✅ Settings में company info update करें
4. ✅ Email feature test करें (SMTP configure करने के बाद)
5. ✅ Voice recording test करें (Deepgram key के साथ)
6. ✅ AI refinement test करें (OpenAI key के साथ)
7. ✅ Production passwords change करें
8. ✅ Regular backups schedule करें

---

## 📞 Need Help?

**Common Resources:**
- 📖 XAMPP Documentation: https://www.apachefriends.org/faq.html
- 📖 MySQL Manual: https://dev.mysql.com/doc/
- 📖 phpMyAdmin Wiki: https://docs.phpmyadmin.net/

**Troubleshooting:**
- ✅ XAMPP logs देखें: `C:\xampp\mysql\data\mysql_error.log`
- ✅ Application console logs check करें
- ✅ Browser developer tools (F12) में errors देखें

---

## 🎉 Congratulations!

अगर आप यहाँ तक पहुंच गए हैं, तो आपका **ReqGen MySQL database successfully setup** हो गया है! 

**Happy Coding! 🚀**

---

## 📝 Important Notes

1. **Data Persistence**: MySQL use करने पर data permanently save होगा (in-memory storage की तरह delete नहीं होगा)
2. **Backup Important**: Regular backups लेते रहें
3. **Security First**: Production में strong passwords use करें
4. **Performance**: बड़े projects के लिए indexes add करें
5. **UTF-8 Support**: Hindi/Marathi text के लिए `utf8mb4` already configured है

---

**अब आपका database ready है! Application में login करें और enjoy करें! 🎊**
