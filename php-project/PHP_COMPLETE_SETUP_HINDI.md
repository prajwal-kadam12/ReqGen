# 🚀 ReqGen - Complete PHP Backend Setup Guide (हिंदी में)

## 📋 यह क्या है?

यह **Complete PHP Backend** है ReqGen application के लिए। सभी features Node.js backend की तरह काम करते हैं:

✅ **All Features Available:**
- User Authentication (Analyst, Admin, Client)
- Document Management (Create, Edit, Delete, List)
- AI Document Refinement (OpenAI)
- Voice Transcription (Deepgram - Multi-language)
- Email with PDF (SMTP)
- Real-time Notifications
- Company Settings Management

---

## 🗂️ Complete Backend Structure

```
php-project/
├── api/                          # सभी API endpoints
│   ├── auth/                     # Authentication
│   │   ├── login.php            ✅ User login
│   │   ├── logout.php           ✅ User logout
│   │   └── check.php            ✅ Check auth status
│   ├── documents/               # Document Management
│   │   ├── create.php           ✅ Create document
│   │   ├── list.php             ✅ Get all documents
│   │   ├── update.php           ✅ Update document
│   │   └── delete.php           ✅ Delete document
│   ├── settings/                # Settings Management
│   │   ├── get.php              ✅ Get settings
│   │   └── update.php           ✅ Update settings
│   ├── email/                   # Email Service
│   │   └── send.php             ✅ Send email with PDF
│   ├── transcribe/              # Voice Transcription
│   │   └── transcribe.php       ✅ Deepgram integration
│   ├── refine/                  # AI Refinement
│   │   └── refine.php           ✅ OpenAI integration
│   ├── notifications/           # Notifications System
│   │   ├── create.php           ✅ Create notification
│   │   ├── list.php             ✅ Get notifications
│   │   ├── mark-read.php        ✅ Mark as read
│   │   └── clear-all.php        ✅ Clear all
│   ├── helpers/                 # Utility Functions
│   │   ├── response.php         ✅ JSON responses
│   │   ├── cors.php             ✅ CORS headers
│   │   └── auth.php             ✅ Auth middleware
│   └── .htaccess                ✅ Apache routing
├── config/
│   ├── database.php             ✅ MySQL PDO connection
│   └── config.php               ✅ App configuration
├── database/
│   └── schema.sql               ✅ Complete database schema
└── .htaccess                    ✅ Root routing
```

---

## 🔧 Installation Steps

### **Step 1: XAMPP Install & Start करें**

1. **XAMPP Download:**
   - जाएं: https://www.apachefriends.org/
   - Windows version download करें
   - Install करें (Default: `C:\xampp`)

2. **XAMPP Start:**
   - XAMPP Control Panel खोलें
   - **Apache** Start करें (green)
   - **MySQL** Start करें (green)

---

### **Step 2: Project Files Setup**

1. **Project को Copy करें:**
```bash
# php-project folder को copy करें
C:\xampp\htdocs\reqgen\
```

2. **Folder Structure Verify करें:**
```
C:\xampp\htdocs\reqgen\
├── api/
├── config/
├── database/
├── assets/
├── includes/
└── All PHP files...
```

---

### **Step 3: Database Setup**

#### **Method 1: phpMyAdmin (Recommended) ⭐**

1. Browser में जाएं: `http://localhost/phpmyadmin`
2. Left sidebar में **"New"** click करें
3. Database name: `reqgen_db`
4. Collation: `utf8mb4_unicode_ci`
5. **"Create"** button click करें
6. Left sidebar में `reqgen_db` select करें
7. Top में **"Import"** tab click करें
8. **"Choose File"** → `database/schema.sql` select करें
9. **"Go"** click करें
10. ✅ Success message आएगा!

#### **Method 2: Command Line**

```bash
cd C:\xampp\mysql\bin
mysql -u root -p

# MySQL prompt में:
source C:\xampp\htdocs\reqgen\database\schema.sql
exit
```

---

### **Step 4: Database Configuration**

File खोलें: `config/database.php`

```php
<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'reqgen_db';
    private $username = 'root';
    private $password = '';    // XAMPP default: blank
    // ...
}
```

**अगर MySQL password है:**
```php
private $password = 'your_mysql_password';
```

---

### **Step 5: API Keys Configuration (Optional)**

#### **For Email Feature (Gmail Example):**

File खोलें: `config/config.php`

```php
// SMTP Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-gmail-app-password');  // Not regular password!
define('SMTP_FROM_EMAIL', 'your-email@gmail.com');
```

**Gmail App Password कैसे बनाएं:**
1. Google Account Settings → Security
2. 2-Step Verification enable करें
3. App Passwords → Select "Mail"
4. Generate → Copy password
5. यह password `config.php` में use करें

#### **For Voice Transcription:**

```php
define('DEEPGRAM_API_KEY', 'your-deepgram-api-key');
```

Get key: https://deepgram.com (Free $200 credits)

#### **For AI Document Refinement:**

```php
define('OPENAI_API_KEY', 'your-openai-api-key');
```

Get key: https://platform.openai.com/api-keys

---

### **Step 6: Test PHP Backend**

#### **Test 1: API Index**
Browser में: `http://localhost/reqgen/api/`

**Expected Output:**
```json
{
  "status": "success",
  "message": "ReqGen PHP API v1.0",
  "endpoints": {...}
}
```

#### **Test 2: Database Connection**
Browser में: `http://localhost/reqgen/api/auth/check.php`

**Expected Output:**
```json
{
  "error": "Not authenticated"
}
```
✅ यह normal है (authenticated नहीं हैं अभी)

---

### **Step 7: Frontend Setup (React)**

1. **Check Frontend Config:**

File: `client/src/lib/queryClient.ts` में check करें:

```typescript
const BASE_URL = 'http://localhost/reqgen/api';
```

2. **Start Frontend:**
```bash
npm run dev
```

Browser: `http://localhost:5173`

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Analyst** | analyst@reqgen.com | analyst123 |
| **Admin** | admin@reqgen.com | admin123 |
| **Client** | client@reqgen.com | client123 |

---

## 📊 API Endpoints Reference

### **Authentication:**
```
POST   /api/auth/login.php          - Login
POST   /api/auth/logout.php         - Logout
GET    /api/auth/check.php          - Check auth
```

### **Documents:**
```
POST   /api/documents/create.php    - Create document
GET    /api/documents/list.php      - List documents
PATCH  /api/documents/update.php?id={id} - Update
DELETE /api/documents/delete.php?id={id} - Delete
```

### **Settings:**
```
GET    /api/settings/get.php        - Get settings
POST   /api/settings/update.php     - Update settings
```

### **Notifications:**
```
POST   /api/notifications/create.php    - Create
GET    /api/notifications/list.php      - List
POST   /api/notifications/mark-read.php?id={id} - Mark read
POST   /api/notifications/clear-all.php - Clear all
```

### **Email:**
```
POST   /api/email/send.php          - Send email with PDF
```

### **Voice Transcription:**
```
POST   /api/transcribe/transcribe.php - Transcribe audio
```

### **AI Refinement:**
```
POST   /api/refine/refine.php       - Refine document
```

---

## ⚠️ Troubleshooting

### **Problem 1: "Database connection failed"**

**Solutions:**
1. ✅ XAMPP MySQL running है check करें
2. ✅ Database `reqgen_db` exist करता है verify करें
3. ✅ `config/database.php` में credentials check करें
4. ✅ phpMyAdmin में login हो रहा है test करें

### **Problem 2: "CORS error" in Frontend**

**Solutions:**
1. ✅ Check `api/helpers/cors.php`:
```php
header('Access-Control-Allow-Origin: http://localhost:5173');
```
2. ✅ Frontend exactly `http://localhost:5173` पर चल रहा है
3. ✅ Browser cache clear करें

### **Problem 3: "404 Not Found" for API calls**

**Solutions:**
1. ✅ Apache running है verify करें
2. ✅ Project `C:\xampp\htdocs\reqgen\` में है check करें
3. ✅ `.htaccess` files exist करती हैं verify करें
4. ✅ Apache में `mod_rewrite` enabled है:
   - File खोलें: `C:\xampp\apache\conf\httpd.conf`
   - ढूंढें: `#LoadModule rewrite_module modules/mod_rewrite.so`
   - Remove `#` to uncomment
   - Apache restart करें

### **Problem 4: "Session not working"**

**Solutions:**
1. ✅ PHP sessions enabled हैं check करें
2. ✅ Browser cookies accept कर रहा है verify करें
3. ✅ Clear browser cookies और फिर से try करें

### **Problem 5: "Email not sending"**

**Solutions:**
1. ✅ SMTP credentials correct हैं check करें
2. ✅ Gmail App Password use कर रहे हैं (not regular password)
3. ✅ Internet connection working है
4. ✅ Port 587 blocked नहीं है (firewall check करें)

### **Problem 6: "Voice transcription failing"**

**Solutions:**
1. ✅ Deepgram API key valid है check करें
2. ✅ Free credits remaining हैं verify करें (https://console.deepgram.com)
3. ✅ Audio file valid format में है (mp3, wav, webm, etc.)

### **Problem 7: "AI refinement not working"**

**Solutions:**
1. ✅ OpenAI API key valid है check करें
2. ✅ OpenAI account में credits हैं verify करें
3. ✅ API rate limits exceed नहीं हुए

---

## 🔐 Security Best Practices

### **Production Deployment के लिए:**

1. **Password Hashing:**
```php
// Plain text की जगह:
$password = password_hash($input['password'], PASSWORD_BCRYPT);

// Verification:
if (!password_verify($input['password'], $user['password'])) {
    sendError(401, 'Invalid credentials');
}
```

2. **Environment Variables:**
- API keys को `.env` file में move करें
- `.env` को `.gitignore` में add करें

3. **HTTPS Enable करें:**
```php
// config/config.php में:
ini_set('session.cookie_secure', 1);  // Requires HTTPS
```

4. **SQL Injection Protection:**
- सभी endpoints already PDO prepared statements use करते हैं ✅

5. **XSS Protection:**
- Input sanitization add करें:
```php
$input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
```

---

## 📈 Performance Tips

### **Database Optimization:**

1. **Indexes Already Added ✅**
   - users.email
   - documents.type, documents.status
   - notifications.target_role

2. **Query Optimization:**
```sql
-- Regular maintenance
OPTIMIZE TABLE users;
OPTIMIZE TABLE documents;
OPTIMIZE TABLE notifications;
```

### **PHP Performance:**

1. **Enable OPcache:**
```ini
; php.ini में:
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
```

2. **Increase Memory:**
```ini
memory_limit = 256M
max_execution_time = 60
```

---

## ✅ Success Checklist

Setup complete होने पर verify करें:

- [x] XAMPP Apache & MySQL running
- [x] Database `reqgen_db` created with 5 tables
- [x] 3 demo users inserted
- [x] 1 settings row inserted
- [x] API index page accessible
- [x] Frontend connects to PHP backend
- [x] Login works with demo credentials
- [x] Documents can be created
- [x] Notifications system working
- [x] (Optional) Email configured
- [x] (Optional) Voice transcription configured
- [x] (Optional) AI refinement configured

---

## 🎯 Testing Workflow

### **1. Test Authentication:**
```bash
# Login
curl -X POST http://localhost/reqgen/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@reqgen.com","password":"analyst123","role":"analyst"}'

# Expected: {"user": {...}, "message": "Login successful"}
```

### **2. Test Document Creation:**
```bash
curl -X POST http://localhost/reqgen/api/documents/create.php \
  -H "Content-Type: application/json" \
  -H "Cookie: PHPSESSID=..." \
  -d '{"name":"Test Doc","type":"BRD","content":"<h1>Test</h1>","originalNote":"Test"}'
```

### **3. Test Document List:**
```bash
curl http://localhost/reqgen/api/documents/list.php \
  -H "Cookie: PHPSESSID=..."
```

---

## 📝 Important Notes

1. **Data Persistence:** MySQL में data permanently save होता है
2. **Backup:** Regular database backups लें
3. **Security:** Production में strong passwords use करें
4. **API Keys:** Free tier limits के अंदर रहें
5. **Error Logs:** `C:\xampp\apache\logs\error.log` देखें

---

## 🎉 Congratulations!

अगर सब कुछ काम कर रहा है तो आपका **Complete PHP Backend successfully setup** हो गया है!

**सभी features available:**
- ✅ User Authentication
- ✅ Document Management
- ✅ AI Refinement
- ✅ Voice Transcription
- ✅ Email Sending
- ✅ Notifications
- ✅ Settings Management

**Happy Coding! 🚀**

---

## 📞 Need More Help?

**Resources:**
- XAMPP Docs: https://www.apachefriends.org/faq.html
- PHP Manual: https://www.php.net/manual/
- MySQL Docs: https://dev.mysql.com/doc/

**Check Logs:**
- Apache: `C:\xampp\apache\logs\error.log`
- MySQL: `C:\xampp\mysql\data\mysql_error.log`
- PHP: Check error_log in `config/config.php`
