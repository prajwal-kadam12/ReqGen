# ReqGen - Quick Start Guide (PHP + MySQL Backend)

## Prerequisites Checklist

- [ ] XAMPP installed with Apache + MySQL
- [ ] Project copied to `C:\xampp\htdocs\reqgen` (or `/Applications/XAMPP/htdocs/reqgen` on Mac)
- [ ] Node.js installed (for running Vite frontend)
- [ ] PHPMailer library downloaded

---

## 5-Minute Setup

### Step 1: Install XAMPP (If Not Already Installed)

1. Download from: https://www.apachefriends.org/
2. Install with default settings
3. Open XAMPP Control Panel
4. Start **Apache** and **MySQL** services

### Step 2: Setup Database

**Option A: Using phpMyAdmin (Easiest)**
1. Open `http://localhost/phpmyadmin`
2. Click "New" → Create database `reqgen_db`
3. Select database → Click "Import"
4. Import file: `api/database/schema.sql`

**Option B: Command Line**
```bash
cd C:\xampp\mysql\bin
mysql -u root -p
# Press Enter (no password)
CREATE DATABASE reqgen_db;
USE reqgen_db;
source C:/xampp/htdocs/reqgen/api/database/schema.sql;
exit;
```

### Step 3: Copy Project to XAMPP

```bash
# Copy your project folder to XAMPP htdocs
# Windows:
C:\xampp\htdocs\reqgen\

# Mac:
/Applications/XAMPP/htdocs/reqgen/
```

### Step 4: Install PHPMailer

**Option A: Download Manually**
1. Download from: https://github.com/PHPMailer/PHPMailer/releases
2. Extract and copy these files to `api/vendor/phpmailer/`:
   - `src/PHPMailer.php`
   - `src/SMTP.php`
   - `src/Exception.php`

**Option B: Use Composer**
```bash
cd C:\xampp\htdocs\reqgen\api
composer require phpmailer/phpmailer
```

### Step 5: Configure SMTP (Optional - for email feature)

Create `.env` file in project root:

```env
# Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# Get Gmail App Password:
# 1. Google Account → Security
# 2. Enable 2-Step Verification
# 3. Generate "App Password"
```

### Step 6: Configure API Keys (Optional)

Add to `.env` file:

```env
# For voice transcription (optional)
DEEPGRAM_API_KEY=your-deepgram-api-key

# For AI document refinement (optional)
OPENAI_API_KEY=your-openai-api-key
```

### Step 7: Update Frontend Configuration

Open `client/src/config/api.ts`:

```typescript
// Make sure this matches your XAMPP htdocs folder name
export const PHP_API_BASE_URL = 'http://localhost/reqgen/api';

// Ensure PHP backend is enabled
export const USE_PHP_BACKEND = true;
```

### Step 8: Start the Application

```bash
# In project root
npm install
npm run dev
```

This starts Vite dev server at: `http://localhost:5173`

---

## ✅ Test the Application

1. **Open**: `http://localhost:5173`
2. **Login with**:
   - Email: `analyst@reqgen.com`
   - Password: `password`
   - Role: Select "Business Analyst"
3. **Click Login**

### Expected Behavior:
- ✅ Login successful
- ✅ Redirected to Dashboard
- ✅ Can create documents
- ✅ Can update settings

---

## Default Users

| Email | Password | Role |
|-------|----------|------|
| analyst@reqgen.com | password | Analyst |
| admin@reqgen.com | password | Admin |
| client@reqgen.com | password | Client |

---

## Troubleshooting

### ❌ "Database connection failed"
**Solution**: 
1. Open XAMPP Control Panel
2. Make sure MySQL is running (green)
3. Check database `reqgen_db` exists in phpMyAdmin

### ❌ "CORS error" in browser console
**Solution**:
1. Make sure frontend is on `http://localhost:5173`
2. Check `api/config/database.php` allows this origin
3. Clear browser cache and reload

### ❌ "Login failed" or "401 Unauthorized"
**Solution**:
1. Check database has default users (run schema.sql again if needed)
2. Clear browser cookies
3. Check PHP sessions are working (test in phpMyAdmin → User accounts)

### ❌ "PHPMailer class not found"
**Solution**:
1. Download PHPMailer files
2. Place in `api/vendor/phpmailer/` folder
3. Files needed: `PHPMailer.php`, `SMTP.php`, `Exception.php`

### ❌ Email sending fails
**Solution**:
1. Create `.env` file with SMTP credentials
2. For Gmail: Use "App Password" not regular password
3. Check SMTP settings are correct in `.env`

### ❌ Can't see changes in browser
**Solution**:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Restart Vite server: `Ctrl+C` then `npm run dev`

---

## File Locations

```
C:\xampp\htdocs\reqgen\           (Your project)
├── api/                          (PHP backend - runs via Apache)
├── client/                       (React frontend - runs via Vite)
├── .env                          (Environment variables)
└── XAMPP_SETUP_GUIDE.md         (Detailed setup guide)

C:\xampp\htdocs\                  (XAMPP web root)
└── reqgen\                       (Your project here)

http://localhost/reqgen/api/      (PHP API endpoint base)
http://localhost:5173/            (React frontend)
http://localhost/phpmyadmin/      (Database management)
```

---

## Next Steps

### 1. Change Default Passwords
```sql
-- In phpMyAdmin, run:
UPDATE users 
SET password = '$2y$10$yournewhashhere' 
WHERE username = 'analyst';
```

Or use online bcrypt generator: https://bcrypt-generator.com/

### 2. Configure Email Settings
- Edit `.env` with your SMTP credentials
- Test email by sending a document

### 3. Add API Keys (Optional)
- Get Deepgram API key: https://deepgram.com/
- Get OpenAI API key: https://platform.openai.com/

### 4. Customize Company Info
- Login as `admin@reqgen.com`
- Go to Settings
- Update company name, address, logo, etc.

---

## Features Available

✅ User authentication (login/logout)  
✅ Document creation (BRD, SRS, SDD, PO)  
✅ Document editing and management  
✅ Company settings and branding  
✅ Email sending with HTML attachments  
✅ Voice transcription (requires Deepgram API key)  
✅ AI document refinement (requires OpenAI API key)  
✅ Real-time notifications  
✅ Role-based access control  

---

## Need More Help?

📖 **Detailed Guide**: See `XAMPP_SETUP_GUIDE.md`  
📖 **Backend Details**: See `NODEJS_BACKEND_DISABLED.md`  
🌐 **XAMPP Docs**: https://www.apachefriends.org/faq.html  
🌐 **PHP Manual**: https://www.php.net/manual/  

---

**🎉 You're all set! Start building your documents with ReqGen.**
