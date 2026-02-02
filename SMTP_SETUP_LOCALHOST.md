# SMTP Configuration for Localhost

## Current Setup (Replit)
Your SMTP credentials are already configured in Replit Secrets and the application is working. The following environment variables are set:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`

## Setting Up on Localhost

### Option 1: Using a `.env` file (Recommended)

1. Create a `.env` file in the root directory of your project:
   ```bash
   touch .env
   ```

2. Add your SMTP credentials to the `.env` file:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   ```

3. Install `dotenv` package (if not already installed):
   ```bash
   npm install dotenv
   ```

4. Update `server/index.ts` to load environment variables (add at the very top):
   ```typescript
   import 'dotenv/config';
   ```

5. Make sure `.env` is in your `.gitignore` file:
   ```
   .env
   ```

### Option 2: Using System Environment Variables

#### On macOS/Linux:
```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your-email@gmail.com
export SMTP_PASSWORD=your-app-password
export SMTP_FROM_EMAIL=your-email@gmail.com
```

#### On Windows (Command Prompt):
```cmd
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587
set SMTP_USER=your-email@gmail.com
set SMTP_PASSWORD=your-app-password
set SMTP_FROM_EMAIL=your-email@gmail.com
```

#### On Windows (PowerShell):
```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="your-email@gmail.com"
$env:SMTP_PASSWORD="your-app-password"
$env:SMTP_FROM_EMAIL="your-email@gmail.com"
```

### Common SMTP Providers

#### Gmail
- **SMTP_HOST**: `smtp.gmail.com`
- **SMTP_PORT**: `587` (TLS) or `465` (SSL)
- **Note**: You need to create an "App Password" (not your regular Gmail password)
- **How to get App Password**:
  1. Go to Google Account Settings
  2. Enable 2-Step Verification
  3. Go to Security → App Passwords
  4. Generate a new app password for "Mail"
  5. Use this 16-character password as `SMTP_PASSWORD`

#### Outlook/Office365
- **SMTP_HOST**: `smtp-mail.outlook.com` or `smtp.office365.com`
- **SMTP_PORT**: `587`
- **SMTP_USER**: Your full email address
- **SMTP_PASSWORD**: Your Outlook password

#### Yahoo Mail
- **SMTP_HOST**: `smtp.mail.yahoo.com`
- **SMTP_PORT**: `587` or `465`
- **Note**: Requires App Password (similar to Gmail)

#### SendGrid
- **SMTP_HOST**: `smtp.sendgrid.net`
- **SMTP_PORT**: `587` or `465`
- **SMTP_USER**: `apikey` (literal string)
- **SMTP_PASSWORD**: Your SendGrid API key

### Testing Email Functionality

After setting up SMTP credentials, test the email feature:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in to the application
3. Go to "Generated Files"
4. Click "Preview" on any document
5. Click "Send Email" and enter a recipient email
6. Check if the email was sent successfully

### Troubleshooting

#### "Invalid login" error
- Double-check your username and password
- For Gmail: Make sure you're using an App Password, not your regular password
- For other providers: Verify SMTP settings are correct

#### "Connection timeout" error
- Check your firewall settings
- Verify the SMTP port is correct (587 for TLS, 465 for SSL)
- Some networks block SMTP ports - try a different network

#### "Self-signed certificate" error
- Add `rejectUnauthorized: false` to nodemailer config (not recommended for production)

### Security Best Practices

1. **Never commit credentials to Git**: Always use `.env` file and add it to `.gitignore`
2. **Use App Passwords**: When available (Gmail, Yahoo), use app-specific passwords
3. **Enable 2FA**: On your email account for extra security
4. **Rotate passwords regularly**: Change SMTP passwords periodically
5. **Use environment-specific configs**: Different credentials for dev/staging/production

### Current Email Configuration File

The email configuration is in `server/email.ts` and uses these environment variables automatically:
```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
```

No code changes needed - just set the environment variables!
