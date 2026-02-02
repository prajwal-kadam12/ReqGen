# 🚀 ReqGen - XAMPP MySQL Setup Guide (हिंदी में)

## 📋 आपके पास क्या होना चाहिए:
- ✅ XAMPP installed (Apache + MySQL)
- ✅ phpMyAdmin access
- ✅ `XAMPP_MYSQL_SETUP.sql` file (यही folder में है)

---

## 🔧 Step-by-Step Setup Instructions

### **Step 1: XAMPP Start करें**
1. XAMPP Control Panel खोलें
2. **Apache** को Start करें (green button)
3. **MySQL** को Start करें (green button)
4. दोनों running होने चाहिए (green color में)

---

### **Step 2: phpMyAdmin खोलें**
1. Browser में जाएं: `http://localhost/phpmyadmin`
2. या XAMPP Control Panel में MySQL के सामने "Admin" button click करें

---

### **Step 3: Database Create करें**

#### **विकल्प A: SQL File Import करें (आसान तरीका)**
1. phpMyAdmin में ऊपर **"Import"** tab पर click करें
2. **"Choose File"** button click करें
3. `XAMPP_MYSQL_SETUP.sql` file select करें
4. नीचे scroll करें और **"Import"** button click करें
5. ✅ Success message आएगा - Database ready है!

#### **विकल्प B: Manual SQL Run करें**
1. phpMyAdmin में ऊपर **"SQL"** tab पर click करें
2. `XAMPP_MYSQL_SETUP.sql` file को text editor में खोलें
3. सारा SQL code copy करें
4. phpMyAdmin के SQL box में paste करें
5. **"Go"** button click करें
6. ✅ Success message आएगा

---

### **Step 4: Verify करें कि सब कुछ Create हुआ है**

1. Left sidebar में **"reqgen_db"** database दिखेगा - उस पर click करें
2. आपको 5 tables दिखेंगे:
   - ✅ `users` (3 demo users के साथ)
   - ✅ `documents` (खाली)
   - ✅ `settings` (1 default row के साथ)
   - ✅ `notifications` (खाली)
   - ✅ `user_notifications` (खाली)

3. **Users table check करें:**
   - `users` table पर click करें
   - ऊपर **"Browse"** tab click करें
   - 3 users दिखेंगे:
     - analyst@reqgen.com (password: analyst123)
     - admin@reqgen.com (password: admin123)
     - client@reqgen.com (password: client123)

---

## 🔗 ReqGen Application को MySQL से Connect करें

### **अगर आप XAMPP पर locally run कर रहे हैं:**

1. अपने project में `.env` file बनाएं (या edit करें)

2. इन variables को add करें:

```env
# MySQL Database Configuration (XAMPP)
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=reqgen_db

# SMTP Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# API Keys (Optional - voice transcription के लिए)
DEEPGRAM_API_KEY=your-deepgram-key
```

3. **ध्यान दें:**
   - XAMPP में default MySQL password **खाली** होता है
   - अगर आपने password set किया है तो `MYSQL_PASSWORD=your-password` लिखें

4. Application restart करें:
```bash
npm run dev
```

5. ✅ Console में दिखेगा: `📦 Storage initialized: MySQL Database`

---

## 📊 Useful MySQL Queries (Testing के लिए)

### **सभी Users देखें:**
```sql
SELECT * FROM users;
```

### **सभी Documents देखें:**
```sql
SELECT * FROM documents ORDER BY created_at DESC;
```

### **Company Settings देखें:**
```sql
SELECT * FROM settings;
```

### **सभी Notifications देखें:**
```sql
SELECT * FROM notifications ORDER BY created_at DESC;
```

### **User के सभी Notifications देखें (Details के साथ):**
```sql
SELECT 
  un.id,
  u.name AS user_name,
  u.role AS user_role,
  n.title,
  n.message,
  un.is_read,
  un.read_at,
  n.created_at
FROM user_notifications un
JOIN users u ON un.user_id = u.id
JOIN notifications n ON un.notification_id = n.id
ORDER BY n.created_at DESC;
```

### **नया User Add करें:**
```sql
INSERT INTO users (id, username, email, password, role, name) VALUES
(UUID(), 'myuser', 'myuser@example.com', 'mypassword', 'analyst', 'My Full Name');
```

### **User का Password Change करें:**
```sql
UPDATE users SET password = 'newpassword' WHERE email = 'analyst@reqgen.com';
```

---

## ⚠️ Important Notes

### **Security (Production के लिए):**
- Demo passwords (`analyst123`, `admin123`, `client123`) को change करें
- Production में passwords को **hash** करें (bcrypt या similar)
- `.env` file को `.gitignore` में add करें

### **Backup लेना:**
1. phpMyAdmin में `reqgen_db` database select करें
2. ऊपर **"Export"** tab click करें
3. **"Go"** button click करें
4. SQL file download हो जाएगी

### **Database Reset करना (सब data delete):**
```sql
DROP DATABASE reqgen_db;
-- फिर से XAMPP_MYSQL_SETUP.sql file import करें
```

---

## 🆘 Common Issues & Solutions

### **Problem 1: "Table already exists" Error**
**Solution:** 
- Tables already create हो चुके हैं
- या DROP करके फिर से create करें

### **Problem 2: "Connection refused" या "Can't connect to MySQL"**
**Solution:**
- XAMPP में MySQL running है check करें
- `.env` file में `MYSQL_HOST=localhost` है verify करें
- Port 3306 free है check करें

### **Problem 3: "Access denied for user 'root'"**
**Solution:**
- XAMPP में default password खाली होता है
- `.env` में `MYSQL_PASSWORD=` (blank) रखें
- या phpMyAdmin में password set करें

### **Problem 4: Unicode/Hindi characters नहीं दिख रहे**
**Solution:**
- सभी tables `utf8mb4` charset use कर रहे हैं (already setup है)
- Browser में UTF-8 encoding check करें

---

## ✅ Success Checklist

- [x] XAMPP Apache + MySQL running
- [x] Database `reqgen_db` created
- [x] 5 tables created successfully
- [x] 3 demo users inserted
- [x] Default settings row inserted
- [x] `.env` file configured (if local)
- [x] Application connects to MySQL

---

## 📞 Need Help?

अगर कोई problem है तो:
1. phpMyAdmin में error messages check करें
2. XAMPP Control Panel में MySQL logs देखें
3. Application console में error messages देखें

**Happy Coding! 🎉**
