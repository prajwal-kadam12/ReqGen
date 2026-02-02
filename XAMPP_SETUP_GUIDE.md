# ReqGen - XAMPP MySQL & PHP Backend Setup Guide

## Prerequisites
1. **XAMPP** installed on your computer
   - Download from: https://www.apachefriends.org/
   - Install with Apache, MySQL, and PHP enabled

2. **Required PHP Extensions** (usually included in XAMPP):
   - PDO
   - PDO_MySQL
   - cURL
   - OpenSSL
   - Fileinfo

---

## Step 1: Install XAMPP

1. Download and install XAMPP
2. Open XAMPP Control Panel
3. Start **Apache** and **MySQL** services

---

## Step 2: Setup MySQL Database

### Option A: Using phpMyAdmin (Recommended)

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click on "New" in the left sidebar to create a new database
3. Database name: `reqgen_db`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"
6. Select the `reqgen_db` database
7. Click on "Import" tab
8. Choose file: `api/database/schema.sql`
9. Click "Go" to import

### Option B: Using Command Line

```bash
# Navigate to XAMPP MySQL bin directory
cd C:\xampp\mysql\bin

# Login to MySQL (default password is empty)
mysql -u root -p

# Press Enter when prompted for password (leave blank)

# Create database and import schema
CREATE DATABASE reqgen_db;
USE reqgen_db;
source C:/path/to/your/project/api/database/schema.sql;
exit;
```

---

## Step 3: Copy Project to XAMPP Directory

1. Copy your entire project folder to XAMPP's `htdocs` directory:
   - Windows: `C:\xampp\htdocs\reqgen`
   - Mac/Linux: `/Applications/XAMPP/htdocs/reqgen`

2. Your folder structure should look like:
```
C:\xampp\htdocs\reqgen\
├── api/
│   ├── auth/
│   ├── config/
│   ├── database/
│   ├── documents/
│   ├── email/
│   ├── refine/
│   ├── settings/
│   └── transcribe/
├── client/
├── server/ (Node.js - will be disabled)
└── XAMPP_SETUP_GUIDE.md
```

---

## Step 4: Install PHPMailer

1. Download PHPMailer from: https://github.com/PHPMailer/PHPMailer
2. Extract and create folder: `api/vendor/phpmailer/`
3. Copy these files:
   - `PHPMailer.php`
   - `SMTP.php`
   - `Exception.php`

OR use Composer (if installed):
```bash
cd C:\xampp\htdocs\reqgen\api
composer require phpmailer/phpmailer
```

---

## Step 5: Configure Environment Variables

### Create `.env` file in project root:

```env
# Database Configuration (XAMPP MySQL)
DB_HOST=localhost
DB_NAME=reqgen_db
DB_USER=root
DB_PASS=

# SMTP Email Configuration (Use Gmail, Outlook, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# API Keys
DEEPGRAM_API_KEY=your-deepgram-api-key
OPENAI_API_KEY=your-openai-api-key
```

### For Gmail SMTP:
1. Go to Google Account settings
2. Enable 2-Step Verification
3. Generate an "App Password"
4. Use that app password in SMTP_PASSWORD

---

## Step 6: Test PHP Backend

1. Open browser and go to: `http://localhost/reqgen/api/auth/login.php`
2. You should see a JSON response (might be error - that's okay)
3. This confirms PHP is working

---

## Step 7: Update Frontend API URLs

The frontend needs to call PHP APIs instead of Node.js. Update the base URL:

In `client/src/lib/queryClient.ts`, change the API base URL:

```typescript
// Change from Node.js URL to PHP URL
const API_BASE_URL = 'http://localhost/reqgen/api';
```

---

## Step 8: Run Frontend with Vite

Since we're only using PHP for backend, run the React frontend separately:

```bash
# In project root
npm run dev
```

This will start Vite dev server on `http://localhost:5173`

---

## Step 9: Test the Application

1. **Frontend**: Open `http://localhost:5173`
2. **Login** with default credentials:
   - Username: `analyst` / `admin` / `client`
   - Password: `password`

3. **Test Features**:
   - ✅ Login/Logout
   - ✅ Document creation
   - ✅ Document editing
   - ✅ Settings management
   - ✅ Email sending (requires SMTP config)
   - ✅ Voice transcription (requires Deepgram API key)
   - ✅ AI refinement (requires OpenAI API key)

---

## Troubleshooting

### Issue: "Database connection failed"
- **Solution**: Check XAMPP MySQL is running
- Verify database name is `reqgen_db`
- Verify username is `root` and password is empty

### Issue: "CORS error" in browser console
- **Solution**: CORS headers are set in `api/config/database.php`
- Make sure you're accessing via `http://localhost` (not `127.0.0.1`)

### Issue: "PHPMailer class not found"
- **Solution**: Install PHPMailer in `api/vendor/phpmailer/`
- Or use Composer: `composer require phpmailer/phpmailer`

### Issue: "SMTP credentials not configured"
- **Solution**: Create `.env` file with SMTP settings
- Or set environment variables in Apache config

### Issue: Session not working
- **Solution**: Check PHP sessions are enabled
- Verify `session.save_path` is writable in `php.ini`

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login.php` - Login
- `POST /api/auth/logout.php` - Logout
- `GET /api/auth/check.php` - Check auth status

### Documents
- `GET /api/documents/list.php` - Get all documents
- `POST /api/documents/create.php` - Create document
- `PATCH /api/documents/update.php/{id}` - Update document
- `DELETE /api/documents/delete.php/{id}` - Delete document

### Settings
- `GET /api/settings/get.php` - Get settings
- `POST /api/settings/update.php` - Update settings

### Email
- `POST /api/email/send.php` - Send email with attachment

### AI Features
- `POST /api/transcribe/transcribe.php` - Transcribe audio
- `POST /api/refine/refine.php` - Refine document with AI

---

## Default Login Credentials

| Username | Password | Role   |
|----------|----------|--------|
| analyst  | password | Analyst|
| admin    | password | Admin  |
| client   | password | Client |

**⚠️ IMPORTANT**: Change these passwords in production!

To create new users or change passwords, use phpMyAdmin or run SQL:

```sql
-- Change password (password will be 'newpassword')
UPDATE users 
SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE username = 'analyst';
```

---

## Production Deployment

1. Change database credentials in `api/config/database.php`
2. Use strong passwords for all users
3. Enable HTTPS for security
4. Restrict database access
5. Configure proper SMTP credentials
6. Set proper file permissions (755 for directories, 644 for files)

---

## Need Help?

- XAMPP Documentation: https://www.apachefriends.org/faq.html
- PHP Manual: https://www.php.net/manual/
- MySQL Documentation: https://dev.mysql.com/doc/

---

**🎉 Setup Complete! Your ReqGen application is now running on XAMPP with PHP + MySQL backend.**
