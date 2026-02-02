# 🔧 XAMPP Setup Guide - ReqGen Project

**Complete step-by-step guide for setting up ReqGen on XAMPP**

---

## 📥 Part 1: Install XAMPP

### Step 1: Download XAMPP

1. Visit: **https://www.apachefriends.org/**
2. Click **"Download"** button
3. Select your operating system:
   - Windows (64-bit or 32-bit)
   - Mac OS X
   - Linux

### Step 2: Install XAMPP

#### Windows Installation:
1. Run downloaded file (e.g., `xampp-windows-x64-8.2.4-installer.exe`)
2. Click **"Next"** through installation wizard
3. Select components (keep all default selections):
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin
4. Choose installation folder (default: `C:\xampp`)
5. Click **"Next"** → **"Install"**
6. Wait for installation to complete
7. Click **"Finish"**

#### Mac Installation:
1. Open downloaded DMG file
2. Drag XAMPP icon to Applications folder
3. Right-click XAMPP → Open
4. Click **"Open"** when security warning appears

#### Linux Installation:
```bash
chmod +x xampp-linux-x64-8.2.4-installer.run
sudo ./xampp-linux-x64-8.2.4-installer.run
```

---

## ▶️ Part 2: Start XAMPP Services

### Step 1: Open XAMPP Control Panel

#### Windows:
- Start Menu → **XAMPP Control Panel**
- Or run: `C:\xampp\xampp-control.exe`

#### Mac:
- Applications → **XAMPP** → **manager-osx**

#### Linux:
```bash
sudo /opt/lampp/manager-linux-x64.run
```

### Step 2: Start Services

1. Click **"Start"** button next to **Apache**
2. Click **"Start"** button next to **MySQL**
3. Wait for green indicators/text:
   - Apache → **Port 80, 443** (green)
   - MySQL → **Port 3306** (green)

### Step 3: Verify Installation

1. Open browser
2. Go to: **http://localhost/**
3. You should see XAMPP welcome page ✅

---

## 🗄️ Part 3: Setup MySQL Database

### Method 1: Using phpMyAdmin (Easiest)

#### Step 1: Open phpMyAdmin
1. Open browser
2. Go to: **http://localhost/phpmyadmin**
3. phpMyAdmin interface will load

#### Step 2: Create Database
1. Click **"New"** in left sidebar
2. Database name: **`reqgen_db`**
3. Collation: **`utf8mb4_unicode_ci`**
4. Click **"Create"** button
5. Success message appears ✅

#### Step 3: Import Schema
1. Click **`reqgen_db`** in left sidebar (to select it)
2. Click **"Import"** tab (top menu)
3. Click **"Choose File"** button
4. Navigate to: `C:\xampp\htdocs\reqgen\database\schema.sql`
5. Select the file
6. Scroll down and click **"Go"** button (bottom-right)
7. Wait for import to complete
8. Success message: "Import has been successfully finished, X queries executed" ✅

#### Step 4: Verify Tables
1. Click **`reqgen_db`** in left sidebar
2. Expand to see tables:
   - ✅ `documents`
   - ✅ `settings`
   - ✅ `users`
3. Click **`users`** table
4. Click **"Browse"** tab
5. You should see 3 demo users ✅

### Method 2: Using MySQL Command Line

```bash
# Windows - Command Prompt
cd C:\xampp\mysql\bin
mysql -u root -p
# Press Enter (no password for default XAMPP)

# Then run these commands:
CREATE DATABASE reqgen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reqgen_db;
source C:/xampp/htdocs/reqgen/database/schema.sql;
exit;
```

---

## 📁 Part 4: Install ReqGen Project

### Step 1: Copy Project Files

1. Copy your **`php-project`** folder
2. Paste it into XAMPP's `htdocs` directory:

**Windows:**
```
C:\xampp\htdocs\reqgen\
```

**Mac:**
```
/Applications/XAMPP/htdocs/reqgen/
```

**Linux:**
```
/opt/lampp/htdocs/reqgen/
```

### Step 2: Verify Folder Structure

After copying, structure should be:
```
C:\xampp\htdocs\reqgen\
├── api/
├── assets/
├── config/
├── database/
├── includes/
├── uploads/
├── login.php
├── dashboard.php
└── ...
```

### Step 3: Set Permissions (Linux/Mac only)

```bash
sudo chmod -R 755 /opt/lampp/htdocs/reqgen/
sudo chmod -R 777 /opt/lampp/htdocs/reqgen/uploads/
```

---

## ⚙️ Part 5: Configure Application

### Step 1: Database Configuration

File already configured! But if needed, edit `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');  // Empty for default XAMPP
define('DB_NAME', 'reqgen_db');
```

### Step 2: Email Configuration (Optional)

Edit `config/config.php`:

```php
// For Gmail
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');
define('SMTP_FROM_EMAIL', 'your-email@gmail.com');
```

**Gmail App Password Setup:**
1. Go to: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not enabled)
3. Security → App Passwords
4. Select **"Mail"** and **"Other"** (Custom name: ReqGen)
5. Click **"Generate"**
6. Copy 16-character password
7. Use this in `SMTP_PASSWORD` (not your regular password!)

---

## 🚀 Part 6: Launch Application

### Step 1: Open in Browser

1. Make sure Apache and MySQL are running (green in XAMPP Control Panel)
2. Open browser
3. Go to: **http://localhost/reqgen/**
4. You'll be redirected to login page

### Step 2: Login

Use demo credentials:

| Role | Email | Password |
|------|-------|----------|
| Analyst | analyst@reqgen.com | analyst123 |
| Admin | admin@reqgen.com | admin123 |
| Client | client@reqgen.com | client123 |

### Step 3: Test Features

1. **Dashboard** - Should load successfully ✅
2. **Create Document** - Try creating a BRD ✅
3. **View Documents** - See your created document ✅
4. **Download PDF** - Test PDF generation ✅
5. **Send Email** - (if SMTP configured) Test email ✅

---

## ✅ Success Checklist

Before considering setup complete, verify:

- [ ] XAMPP Control Panel shows Apache **green**
- [ ] XAMPP Control Panel shows MySQL **green**
- [ ] phpMyAdmin opens at `http://localhost/phpmyadmin`
- [ ] Database `reqgen_db` exists with 3 tables
- [ ] Users table has 3 demo users
- [ ] Application opens at `http://localhost/reqgen/`
- [ ] Can login with demo credentials
- [ ] Dashboard loads without errors
- [ ] Can create new document
- [ ] Can view document list
- [ ] Can download PDF

---

## 🔧 Common Issues & Solutions

### Issue: "Apache not starting"

**Cause:** Port 80 already in use (Skype, IIS, or other software)

**Solution 1:** Change Apache port
1. XAMPP Control Panel → Apache → **Config** → **httpd.conf**
2. Find line: `Listen 80`
3. Change to: `Listen 8080`
4. Find line: `ServerName localhost:80`
5. Change to: `ServerName localhost:8080`
6. Save and restart Apache
7. Access via: `http://localhost:8080/reqgen/`

**Solution 2:** Stop conflicting software
- Close Skype
- Stop IIS (if installed)

### Issue: "MySQL not starting"

**Cause:** Port 3306 already in use

**Solution:**
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find `mysqld.exe` process
3. End task
4. Restart MySQL in XAMPP

### Issue: "Database connection failed"

**Solutions:**
1. Verify MySQL is running (green in XAMPP)
2. Check database name is exactly: `reqgen_db`
3. Verify `config/database.php` has correct credentials
4. Test connection in phpMyAdmin

### Issue: "Page not found (404)"

**Solutions:**
1. Verify project folder name is `reqgen`
2. Check folder is in `C:\xampp\htdocs\` (not subfolders)
3. Use correct URL: `http://localhost/reqgen/` (with trailing slash)
4. Verify Apache is running

### Issue: "Login not working - Invalid credentials"

**Solutions:**
1. Open phpMyAdmin
2. Click `reqgen_db` → `users` table → Browse
3. Verify 3 users exist
4. If empty, re-import `database/schema.sql`
5. Clear browser cache and try again

### Issue: "PDF not downloading"

**Solutions:**
1. Allow pop-ups for localhost in browser
2. Try different browser (Chrome recommended)
3. Check browser's download settings
4. Check folder permissions (uploads folder must be writable)

---

## 📚 Additional Resources

### XAMPP Official Docs
- Windows: https://www.apachefriends.org/docs/windows/
- Mac: https://www.apachefriends.org/docs/osx/
- Linux: https://www.apachefriends.org/docs/linux/

### PHP Documentation
- https://www.php.net/manual/en/

### MySQL Documentation
- https://dev.mysql.com/doc/

---

## 🎉 You're All Set!

If you've completed all steps successfully, you should have:

✅ XAMPP installed and running  
✅ MySQL database created and populated  
✅ ReqGen application accessible  
✅ Can login and use all features  

**Happy Documenting!** 🚀

---

## 📞 Need Help?

1. Check **Troubleshooting** section above
2. Review `database/SETUP_INSTRUCTIONS.md`
3. Check XAMPP logs:
   - Apache: `C:\xampp\apache\logs\error.log`
   - MySQL: `C:\xampp\mysql\data\mysql_error.log`
4. Verify PHP errors in browser (error messages help debugging)
