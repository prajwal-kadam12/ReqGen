# 🔐 Login Credentials - ReqGen

## 📋 Test Users

Application में login करने के लिए ये **3 test users** बनाए गए हैं:

---

## 👥 **Available Users**

### **1. Business Analyst 📊**
```
Username: analyst
Password: analyst123
Role: Analyst
```
**Access:** Full document creation and editing rights

---

### **2. System Administrator ⚙️**
```
Username: admin
Password: admin123  
Role: Admin
```
**Access:** All features + settings management

---

### **3. Client User 👤**
```
Username: client
Password: client123
Role: Client
```
**Access:** View documents and basic features

---

## 🚀 **How to Insert Users in Database**

### **Method 1: Using phpMyAdmin (Recommended)**

1. **Open phpMyAdmin:** `http://localhost/phpmyadmin`
2. **Select Database:** Click on `reqgen_db` from left sidebar
3. **Go to SQL tab**
4. **Paste this query:**

```sql
USE reqgen_db;

-- Insert Test Users
INSERT INTO users (id, username, password) 
VALUES (UUID(), 'analyst', 'analyst123');

INSERT INTO users (id, username, password) 
VALUES (UUID(), 'admin', 'admin123');

INSERT INTO users (id, username, password) 
VALUES (UUID(), 'client', 'client123');
```

5. **Click Go button**
6. ✅ Users created!

---

### **Method 2: Run SQL File**

Project में `database/insert_test_users.sql` file है:

```bash
# phpMyAdmin में SQL tab खोलें
# database/insert_test_users.sql file खोलें
# पूरी content copy करें
# phpMyAdmin में paste करें और Go दबाएं
```

---

## ✅ **Verify Users Created**

phpMyAdmin में run करें:

```sql
SELECT * FROM users;
```

**आपको 3 users दिखने चाहिए:**

| id | username | password |
|----|----------|----------|
| UUID | analyst | analyst123 |
| UUID | admin | admin123 |
| UUID | client | client123 |

---

## 🔑 **How to Login**

### **Step 1: Run Application**

```bash
npm run dev
```

### **Step 2: Open in Browser**

```
http://localhost:5000/login
```

### **Step 3: Enter Credentials**

**Example - Login as Analyst:**
1. Username: `analyst`
2. Password: `analyst123`
3. Role: Select **"Analyst"**
4. Click **Login**

---

## 🎯 **Login Test Cases**

### ✅ **Valid Login:**
```
Username: analyst
Password: analyst123
Role: Analyst
Expected: Login successful → Redirect to dashboard
```

### ❌ **Invalid Password:**
```
Username: analyst
Password: wrong123
Role: Analyst
Expected: Error message "Invalid credentials"
```

### ❌ **Wrong Role:**
```
Username: analyst
Password: analyst123
Role: Admin
Expected: Error message "Invalid credentials"
```

---

## 🔧 **Add Your Own Users**

**SQL Query Template:**

```sql
INSERT INTO users (id, username, password) 
VALUES (UUID(), 'your_username', 'your_password');
```

**Example - Add new user:**

```sql
INSERT INTO users (id, username, password) 
VALUES (UUID(), 'john', 'john123');
```

---

## 📊 **User Management Queries**

### **View All Users:**
```sql
SELECT * FROM users;
```

### **Count Total Users:**
```sql
SELECT COUNT(*) as total_users FROM users;
```

### **Find Specific User:**
```sql
SELECT * FROM users WHERE username = 'analyst';
```

### **Update Password:**
```sql
UPDATE users 
SET password = 'newpassword123' 
WHERE username = 'analyst';
```

### **Delete User:**
```sql
DELETE FROM users WHERE username = 'analyst';
```

---

## ⚠️ **Security Note**

**⚠️ IMPORTANT:** These are **test credentials** for development only!

**For Production:**
1. Change all passwords to strong values
2. Implement password hashing (bcrypt/argon2)
3. Use environment variables for admin credentials
4. Enable HTTPS
5. Add rate limiting on login endpoint

---

## 🆘 **Troubleshooting**

### **Error: Invalid credentials**
✅ Check:
1. Username spelling is correct
2. Password is exact (case-sensitive)
3. Correct role is selected
4. Users exist in database: `SELECT * FROM users;`

### **Error: Database connection failed**
✅ Check:
1. XAMPP MySQL is running
2. `.env` file has correct credentials
3. Database `reqgen_db` exists

### **Login page not loading**
✅ Check:
1. Application is running: `npm run dev`
2. No errors in console
3. Browser URL is correct: `http://localhost:5000/login`

---

## 📞 **Quick Reference**

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| analyst | analyst123 | Analyst | Full document access |
| admin | admin123 | Admin | All features |
| client | client123 | Client | View only |

---

**✅ Ready to Login! 🚀**

**Next Steps:**
1. Insert test users in database (SQL query above)
2. Run application: `npm run dev`
3. Open: `http://localhost:5000/login`
4. Login with any test user
5. Start creating documents! 📝
