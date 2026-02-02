# 🗄️ MySQL Database Setup - Step by Step

**Ye guide follow karo XAMPP database setup karne ke liye**

---

## 📋 Prerequisites

✅ **XAMPP installed hai?**
- Agar nahi: Download from https://www.apachefriends.org/

✅ **MySQL running hai?**
- XAMPP Control Panel kholo
- MySQL ke samne **Start** button click karo
- **Green light** dikhe = Ready!

---

## 🚀 Method 1: phpMyAdmin (Recommended - Easy!)

### Step 1: phpMyAdmin Open Karo
1. Browser mein jao: **http://localhost/phpmyadmin**
2. Khul gaya? Aage badho! ✅

### Step 2: Database Create Karo
1. Left sidebar mein **"New"** button click karo
2. Database name type karo: **`reqgen_db`**
3. Collation select karo: **`utf8mb4_unicode_ci`**
4. **"Create"** button click karo
5. Success message dikha? Great! ✅

### Step 3: SQL File Import Karo
1. Left sidebar se **`reqgen_db`** select karo (click karo)
2. Top menu mein **"Import"** tab click karo
3. **"Choose File"** button click karo
4. Navigate karo: `database/schema.sql` (ye wali file)
5. **"Go"** button click karo (bottom-right corner)
6. Wait karo... ⏳

### Step 4: Success Confirm Karo
Success message dikhega:
```
Import has been successfully finished, 3 queries executed.
```

**Tables check karo:**
- Left sidebar mein `reqgen_db` expand karo
- 3 tables dikhenge:
  - ✅ `documents`
  - ✅ `settings`
  - ✅ `users`

**Users check karo:**
1. `users` table click karo
2. Top menu mein **"Browse"** tab click karo
3. 3 users dikhenge:
   - analyst@reqgen.com
   - admin@reqgen.com
   - client@reqgen.com

---

## 🖥️ Method 2: Command Line (Advanced)

**Only agar phpMyAdmin se nahi hua!**

### Windows:
```cmd
cd C:\xampp\mysql\bin
mysql -u root -p
```

Password puche toh **Enter** press karo (default mein khali hai)

Phir ye commands run karo:
```sql
source C:\path\to\your\project\database\schema.sql
exit
```

### Mac/Linux:
```bash
mysql -u root -p < database/schema.sql
```

---

## ✅ Verification - Sahi Se Setup Hua?

### Test Query Run Karo:

phpMyAdmin mein:
1. `reqgen_db` select karo
2. **"SQL"** tab click karo
3. Ye paste karo:
```sql
SELECT username, email, role FROM users;
```
4. **"Go"** click karo

**Output dikhega:**
```
username | email                  | role
---------|------------------------|--------
analyst  | analyst@reqgen.com    | analyst
admin    | admin@reqgen.com      | admin
client   | client@reqgen.com     | client
```

Ye dikha? **Perfect!** Database ready hai! 🎉

---

## 🔧 Troubleshooting

### Error: "Table already exists"
**Problem:** Purani tables padi hui hain

**Solution:**
```sql
-- phpMyAdmin SQL tab mein ye run karo:
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;
```
Phir schema.sql dobara import karo

### Error: "Access denied for user 'root'"
**Problem:** Password galat hai

**Solution:**
- Default XAMPP: password **khali** hai
- Agar aapne change kiya: apna password use karo

### Error: "Unknown database 'reqgen_db'"
**Problem:** Database create nahi hua

**Solution:**
```sql
-- phpMyAdmin SQL tab mein ye run karo:
CREATE DATABASE reqgen_db;
USE reqgen_db;
```
Phir schema.sql import karo

---

## 📝 Database Credentials Summary

Ye details `.env` file mein use karo:

```env
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=reqgen_db
```

**Login Credentials (Test Users):**

| Role | Email | Password |
|------|-------|----------|
| Business Analyst | analyst@reqgen.com | analyst123 |
| System Admin | admin@reqgen.com | admin123 |
| Client | client@reqgen.com | client123 |

---

## 🎯 Next Steps

1. ✅ Database setup complete
2. ✅ Tables created
3. ✅ Demo users ready

**Ab kya kare?**

1. Project folder mein `.env` file check karo
2. Database credentials confirm karo
3. Application run karo: `npm run dev`
4. Browser mein open: http://localhost:5000
5. Login karo: analyst@reqgen.com / analyst123

**Done! Enjoy your app!** 🚀

---

## ❓ Still Having Issues?

Check these:
- [ ] XAMPP MySQL green light hai?
- [ ] phpMyAdmin khul raha hai?
- [ ] Database `reqgen_db` create hua?
- [ ] 3 tables dikhayi de rahe hain?
- [ ] Users table mein 3 entries hain?

Sab yes hai? Toh ready ho! 😊
