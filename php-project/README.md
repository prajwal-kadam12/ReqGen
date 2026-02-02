# 📄 ReqGen - Requirement Document Generator (PHP Version)

**Professional Business Document Generator** - Generate BRD, SRS, SDD, and Purchase Orders with PDF export and email functionality.

---

## ✨ Features

✅ **User Authentication** - Secure login system with role-based access (Analyst, Admin, Client)  
✅ **Document Generation** - Create professional business documents (BRD, SRS, SDD, PO)  
✅ **PDF Export** - Download documents as PDF files  
✅ **Email Sending** - Send documents via email with attachments  
✅ **Dashboard** - Clean, modern interface with Bootstrap 5  
✅ **Document Management** - View, edit, and delete documents  

---

## 🖥️ Technologies Used

- **Backend:** PHP 7.4+
- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript
- **Database:** MySQL (XAMPP)
- **Libraries:** TCPDF (PDF), PHPMailer (Email)
- **Icons:** Font Awesome 6

---

## 📋 Prerequisites

Before installation, make sure you have:

- ✅ **XAMPP** (Apache + MySQL + PHP) - Download from [apachefriends.org](https://www.apachefriends.org/)
- ✅ **Web Browser** (Chrome, Firefox, Edge, etc.)
- ✅ **Text Editor** (VS Code, Sublime, Notepad++, etc.)

---

## 🚀 Installation Guide

### Step 1: Install XAMPP

1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Install XAMPP (Default: `C:\xampp` on Windows)
3. Open **XAMPP Control Panel**
4. Start **Apache** and **MySQL** services (green indicators)

### Step 2: Setup Project Files

1. Copy the `php-project` folder to XAMPP's web directory:
   - Windows: `C:\xampp\htdocs\reqgen\`
   - Mac/Linux: `/opt/lampp/htdocs/reqgen/`

2. Folder structure should look like:
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

### Step 3: Create Database

#### Method 1: Using phpMyAdmin (Recommended)

1. Open browser and go to: **http://localhost/phpmyadmin**
2. Click **"New"** in left sidebar
3. Database name: `reqgen_db`
4. Collation: `utf8mb4_unicode_ci`
5. Click **"Create"**
6. Select `reqgen_db` from left sidebar
7. Click **"Import"** tab
8. Choose file: `database/schema.sql`
9. Click **"Go"** button
10. Wait for success message ✅

#### Method 2: Using Command Line

```bash
# Windows
cd C:\xampp\mysql\bin
mysql -u root -p

# Then run:
source C:\xampp\htdocs\reqgen\database\schema.sql
exit
```

### Step 4: Configure Application

1. Open `config/config.php`
2. Update email settings (if you want to use email feature):
   ```php
   define('SMTP_HOST', 'smtp.gmail.com');
   define('SMTP_PORT', 587);
   define('SMTP_USERNAME', 'your-email@gmail.com');
   define('SMTP_PASSWORD', 'your-app-password');
   define('SMTP_FROM_EMAIL', 'your-email@gmail.com');
   ```

3. For Gmail: Generate App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
   - Use this password (not your regular Gmail password)

### Step 5: Access Application

1. Open browser
2. Go to: **http://localhost/reqgen/**
3. You'll be redirected to login page

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Business Analyst** | analyst@reqgen.com | analyst123 |
| **System Admin** | admin@reqgen.com | admin123 |
| **Client** | client@reqgen.com | client123 |

---

## 📝 How to Use

### 1. Login
- Open `http://localhost/reqgen/`
- Select your role (Analyst/Admin/Client)
- Enter email and password
- Click "Login"

### 2. Create Document
- Click "Create New Document" from dashboard
- Select document type (BRD/SRS/SDD/PO)
- Fill in required details:
  - Document name
  - Company name (optional)
  - Project name (optional)
  - Requirements/Notes
- Click "Generate Document"

### 3. View Documents
- Go to "Documents" from navigation
- See list of all created documents
- Click "View" icon to see full document

### 4. Download PDF
- Open any document
- Click "Download PDF" button
- PDF will be generated and downloaded

### 5. Send Email
- Go to "Documents" page
- Click email icon next to document
- Enter recipient email
- Add subject and message
- Click "Send Email"

---

## 🗂️ Project Structure

```
php-project/
├── api/                    # API endpoints
│   ├── create-document.php
│   ├── delete-document.php
│   ├── generate-pdf.php
│   └── send-email.php
├── assets/                 # Static files
│   ├── css/style.css
│   ├── js/main.js
│   └── images/
├── config/                 # Configuration files
│   ├── config.php
│   └── database.php
├── database/               # Database files
│   ├── schema.sql
│   └── SETUP_INSTRUCTIONS.md
├── includes/               # Reusable components
│   ├── header.php
│   └── footer.php
├── uploads/                # Uploaded files
├── vendor/                 # PHP libraries (TCPDF, PHPMailer)
├── index.php               # Entry point (redirects to login)
├── login.php               # Login page
├── logout.php              # Logout handler
├── dashboard.php           # Main dashboard
├── documents.php           # Document list
├── create-document.php     # Create new document
├── view-document.php       # View document details
├── settings.php            # Application settings
├── profile.php             # User profile
└── README.md               # This file
```

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Check XAMPP MySQL is running (green light)
2. Verify database name is `reqgen_db`
3. Check `config/database.php` credentials:
   - Host: `localhost`
   - User: `root`
   - Password: (empty for default XAMPP)

### Issue: "Login not working"
**Solution:**
1. Verify database has users table
2. Run query in phpMyAdmin: `SELECT * FROM users;`
3. Should see 3 demo users
4. If empty, re-import `database/schema.sql`

### Issue: "Email not sending"
**Solution:**
1. Check SMTP settings in `config/config.php`
2. For Gmail, use App Password (not regular password)
3. Enable "Less secure app access" (if needed)
4. Alternative: Email will still save to database even if SMTP fails

### Issue: "PDF not downloading"
**Solution:**
1. Check if browser is blocking pop-ups
2. Allow pop-ups for `localhost`
3. Try different browser (Chrome recommended)

### Issue: "Page not found (404)"
**Solution:**
1. Verify project is in correct folder: `C:\xampp\htdocs\reqgen\`
2. Access via: `http://localhost/reqgen/` (not just `localhost`)
3. Check Apache is running in XAMPP

---

## 📚 Database Schema

### Users Table
- `id` - Unique user ID
- `username` - Username
- `email` - Email address (unique)
- `password` - Password (plain text for demo - use hashing in production!)
- `role` - User role (analyst/admin/client)
- `name` - Full name

### Documents Table
- `id` - Unique document ID
- `name` - Document name
- `type` - Document type (brd/srs/sdd/po)
- `content` - HTML content
- `original_note` - Original requirements
- `refined_note` - Refined/processed notes
- `company_name` - Company name
- `project_name` - Project name
- `created_at` - Creation timestamp

### Settings Table
- `id` - Unique settings ID
- `company_name` - Company name
- `address` - Company address
- `phone` - Phone number
- `email` - Email address
- `api_key` - API key (for future features)
- `logo` - Company logo
- `updated_at` - Last update timestamp

---

## 🎯 Future Enhancements

- [ ] Password hashing (bcrypt/Argon2)
- [ ] User registration
- [ ] Role-based permissions
- [ ] Document templates
- [ ] AI-powered content generation
- [ ] Multi-language support
- [ ] Document versioning
- [ ] Collaborative editing

---

## 📞 Support

For issues or questions:
1. Check **Troubleshooting** section above
2. Review **database/SETUP_INSTRUCTIONS.md**
3. Check XAMPP logs in `C:\xampp\apache\logs\`

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 🎉 Success!

If you can:
- ✅ Login with demo credentials
- ✅ Create a new document
- ✅ View document list
- ✅ Download PDF

Then you're all set! **Happy Documenting!** 🚀
