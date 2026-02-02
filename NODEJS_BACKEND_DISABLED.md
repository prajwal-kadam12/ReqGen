# Node.js Backend Disabled - Now Using PHP + MySQL

The original Node.js backend (in the `server/` directory) has been **disabled** in favor of the new PHP + MySQL (XAMPP) backend.

## What Changed

### ✅ NEW: PHP Backend (in `api/` directory)
- PHP files for all API endpoints
- MySQL database (XAMPP)
- Session-based authentication
- All features implemented in PHP

### ❌ DISABLED: Node.js Backend (in `server/` directory)
- Express.js server (server/index.ts)
- Node.js API routes (server/routes.ts)
- In-memory storage (server/storage.ts)
- Vite integration (server/vite.ts)

## How to Use

### For XAMPP/PHP Backend (Default - USE_PHP_BACKEND = true)

1. Install XAMPP and start Apache + MySQL
2. Copy project to `C:\xampp\htdocs\reqgen`
3. Import database schema from `api/database/schema.sql`
4. Install PHPMailer (see XAMPP_SETUP_GUIDE.md)
5. Run frontend: `npm run dev` (Vite only - no Node.js server)
6. Access at: `http://localhost:5173`

### To Re-enable Node.js Backend (If Needed)

If you want to switch back to Node.js:

1. Open `client/src/config/api.ts`
2. Change: `export const USE_PHP_BACKEND = false;`
3. Restart the full application: `npm run dev`

## File Structure

```
project/
├── api/                    # ✅ PHP Backend (ACTIVE)
│   ├── auth/              # Login, logout, check
│   ├── config/            # Database connection
│   ├── database/          # MySQL schema
│   ├── documents/         # CRUD operations
│   ├── email/             # Email sending
│   ├── refine/            # AI refinement
│   ├── settings/          # Settings management
│   └── transcribe/        # Voice transcription
│
├── server/                # ❌ Node.js Backend (DISABLED)
│   ├── index.ts          # Express server (not used)
│   ├── routes.ts         # API routes (not used)
│   ├── storage.ts        # In-memory storage (not used)
│   └── vite.ts           # Vite integration (not used)
│
├── client/                # ✅ React Frontend (ACTIVE)
│   ├── src/
│   │   ├── config/api.ts # Backend selection (PHP/Node)
│   │   └── ...
│
└── package.json          # Scripts run Vite only (no server)
```

## API Endpoint Mapping

The frontend automatically converts Node.js endpoints to PHP endpoints:

| Frontend Request | Node.js Endpoint | PHP Endpoint |
|-----------------|------------------|--------------|
| `/api/login` | `POST /api/login` | `POST /api/auth/login.php` |
| `/api/logout` | `POST /api/logout` | `POST /api/auth/logout.php` |
| `/api/documents` | `GET /api/documents` | `GET /api/documents/list.php` |
| `/api/documents/create` | `POST /api/documents` | `POST /api/documents/create.php` |
| `/api/documents/:id` | `PATCH /api/documents/:id` | `PATCH /api/documents/update.php/:id` |
| `/api/settings` | `GET /api/settings` | `GET /api/settings/get.php` |
| `/api/send-email` | `POST /api/send-email` | `POST /api/email/send.php` |
| `/api/transcribe` | `POST /api/transcribe` | `POST /api/transcribe/transcribe.php` |
| `/api/refine` | `POST /api/refine` | `POST /api/refine/refine.php` |

## Environment Variables

### For PHP Backend (in .env file or XAMPP environment):

```env
# Database (XAMPP MySQL)
DB_HOST=localhost
DB_NAME=reqgen_db
DB_USER=root
DB_PASS=

# SMTP (for email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# API Keys
DEEPGRAM_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
```

### For Node.js Backend (if re-enabled):
Same environment variables but loaded via Node.js process.env

## Default Login Credentials

| Username | Email | Password | Role |
|----------|-------|----------|------|
| analyst | analyst@reqgen.com | password | Analyst |
| admin | admin@reqgen.com | password | Admin |
| client | client@reqgen.com | password | Client |

**⚠️ IMPORTANT**: Change these in production!

## Troubleshooting

### "Database connection failed"
- ✅ Check XAMPP MySQL is running
- ✅ Database `reqgen_db` exists
- ✅ Schema imported correctly

### "CORS error"
- ✅ Frontend running on `http://localhost:5173`
- ✅ PHP backend allows this origin in `api/config/database.php`

### "Session not working"
- ✅ CORS headers include `Access-Control-Allow-Credentials: true`
- ✅ PHP sessions enabled in `php.ini`

### "PHPMailer not found"
- ✅ Install PHPMailer in `api/vendor/phpmailer/`
- ✅ See XAMPP_SETUP_GUIDE.md for instructions

## Need Help?

See comprehensive setup guide: `XAMPP_SETUP_GUIDE.md`

---

**Note**: The Node.js backend code is preserved in the `server/` directory but is not executed when `USE_PHP_BACKEND = true`. You can safely delete it if you're certain you won't need it.
