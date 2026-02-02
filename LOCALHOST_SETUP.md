# ReqGen - Localhost Setup Guide

यह complete guide आपको ReqGen application को अपने localhost पर successfully run करने में मदद करेगी।

## 📋 Prerequisites

1. **Node.js** (v18 या higher) - [Download from nodejs.org](https://nodejs.org/)
2. **Git** - [Download from git-scm.com](https://git-scm.com/)
3. **Gmail Account** (email features के लिए)
4. **Deepgram API Key** (voice recording के लिए - Free $200 credits available)

---

## 🚀 Step 1: Project Setup

### 1.1 Install Dependencies

```bash
npm install
```

यह सभी required packages install करेगा।

---

## ⚙️ Step 2: Environment Configuration

### 2.1 Create .env File

```bash
# Copy the example file
cp .env.example .env
```

### 2.2 Configure Environment Variables

अपने `.env` file को open करें और निम्नलिखित values को update करें:

#### A. Database Configuration (Optional)

अगर आप in-memory storage use करना चाहते हैं (recommended for testing):

```env
USE_MYSQL=false
```

अगर आप MySQL database use करना चाहते हैं:

```env
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=reqgen_db
```

#### B. Email Configuration (SMTP) - **REQUIRED FOR EMAIL FEATURE**

**Gmail के लिए (Recommended):**

1. अपने Gmail account में login करें
2. Google Account Settings → Security → 2-Step Verification enable करें
3. Security → App Passwords पर जाएं
4. "Mail" के लिए नया app password generate करें
5. 16-character password को copy करें

अब `.env` file में:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

**Outlook के लिए:**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-outlook-password
SMTP_FROM_EMAIL=your-email@outlook.com
```

#### C. Voice Transcription (Deepgram API) - **REQUIRED FOR VOICE RECORDING**

1. [Deepgram](https://deepgram.com/) पर जाएं
2. Free account बनाएं ($200 free credits मिलेंगे)
3. API Key generate करें
4. `.env` file में add करें:

```env
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

---

## 🏃 Step 3: Run the Application

### 3.1 Development Mode

```bash
npm run dev
```

यह command:
- Backend server को port 5000 पर start करेगा
- Frontend को Vite के साथ serve करेगा
- Hot Module Replacement (HMR) enable करेगा

### 3.2 Access the Application

अपने browser में जाएं:

```
http://localhost:5000
```

---

## 👤 Step 4: Login Credentials

Application में तीन demo users automatically create होते हैं:

| Role | Email | Password |
|------|-------|----------|
| **Client** | client@reqgen.com | client123 |
| **Analyst** | analyst@reqgen.com | analyst123 |
| **Admin** | admin@reqgen.com | admin123 |

---

## ✅ Step 5: Feature Testing

### 5.1 Test Login
1. Login page पर email और password enter करें
2. Role select करें
3. Login button click करें

### 5.2 Test Document Creation (Note Editor)
1. Login करें (Analyst या Admin role से)
2. "Note Editor" page पर जाएं
3. Document details fill करें:
   - Document Name (required)
   - Company Name
   - Document Type (BRD, SRS, SDD, PO)
   - Content/Notes (required)
4. "Generate Document" button click करें
5. Document automatically "Generated Files" page में save हो जाएगा

### 5.3 Test Voice Recording
1. Note Editor page पर जाएं
2. Microphone icon button click करें
3. Browser में microphone permission allow करें
4. अपनी बात record करें (any language)
5. फिर से microphone button click करें recording stop करने के लिए
6. Text automatically English में convert होकर content field में add हो जाएगा

**Note:** Voice recording के लिए DEEPGRAM_API_KEY required है।

### 5.4 Test AI Refinement
1. Note Editor में content type करें या record करें
2. "Refine with AI" button click करें
3. AI आपके content को professionally refine करेगा
4. Refined content automatically update हो जाएगा

### 5.5 Test Document Download
1. "Generated Files" page पर जाएं
2. किसी document पर "Download" dropdown button click करें
3. "Download as PDF" या "Download as DOCX" select करें
4. File automatically download हो जाएगी

### 5.6 Test Email Sending
1. "Generated Files" page पर जाएं
2. किसी document पर "Email" button click करें
3. Email details fill करें:
   - Recipient email
   - Subject (auto-filled)
   - Optional message
4. "Send Email" button click करें
5. Email PDF attachment के साथ send हो जाएगी

**Note:** Email sending के लिए SMTP credentials required हैं।

### 5.7 Test Document Edit
1. "Generated Files" page पर जाएं
2. किसी document पर "Edit" button click करें
3. Details update करें
4. "Update Document" button click करें

### 5.8 Test Document Approval (Client Role)
1. Client role से login करें
2. "Generated Files" page पर जाएं
3. किसी document पर "Review" dropdown click करें
4. "Approve", "Request Changes", या "Return to Client" select करें
5. अगर "Request Changes" select किया है, तो message enter करें
6. Submit करें

### 5.9 Test Settings (Admin Only)
1. Admin role से login करें
2. "Settings" page पर जाएं
3. Company details update करें:
   - Company Name
   - Address
   - Phone
   - Email
   - Logo Upload
4. "Save Settings" button click करें

---

## 🐛 Troubleshooting

### Issue 1: "cross-env: not found" Error

**Solution:**
```bash
npm install
npm run dev
```

### Issue 2: Email Not Sending

**Possible Causes:**
1. SMTP credentials गलत हैं
2. Gmail App Password use नहीं कर रहे
3. `.env` file में SMTP settings missing हैं

**Solution:**
- `.env` file check करें
- Gmail App Password generate करें (normal password काम नहीं करेगा)
- SMTP settings verify करें

### Issue 3: Voice Recording Not Working

**Possible Causes:**
1. DEEPGRAM_API_KEY missing है
2. Microphone permission denied है
3. Browser microphone support नहीं करता

**Solution:**
- `.env` file में DEEPGRAM_API_KEY add करें
- Browser में microphone permission allow करें
- Chrome या Firefox browser use करें

### Issue 4: "Failed to launch browser" for PDF Generation

**Solution:**
यह issue Chromium dependencies की वजह से हो सकता है। Localhost पर PDF generation properly काम करना चाहिए।

अगर issue persist करे:
```bash
# Install Chromium dependencies (Linux/Mac)
# This is usually not needed on localhost
```

### Issue 5: Port 5000 Already in Use

**Solution:**
```bash
# Kill the process using port 5000
# On Mac/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue 6: Changes Not Reflecting

**Solution:**
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
npm run dev

# या simply browser refresh करें
Ctrl+Shift+R (Hard Refresh)
```

---

## 📝 Important Notes

### Data Persistence

1. **In-Memory Storage (Default):**
   - Data `.storage-data.json` file में save होता है
   - Server restart के बाद भी data persist रहता है
   - यह testing के लिए perfect है

2. **MySQL Storage (Optional):**
   - Permanent database storage
   - Production use के लिए recommended
   - `.env` में `USE_MYSQL=true` set करें

### API Keys Storage

सभी sensitive credentials `.env` file में रखें। यह file automatically `.gitignore` में है, तो आपके credentials publicly share नहीं होंगे।

### Browser Compatibility

ReqGen best works with:
- ✅ Google Chrome (Recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ⚠️ Safari (Limited microphone support)

---

## 🆘 Getting Help

अगर कोई issue हो तो:

1. Console में error messages check करें (F12 → Console)
2. Server logs check करें
3. `.env` file की settings verify करें
4. सभी dependencies properly install हैं verify करें (`npm install`)

---

## 🎉 Success!

अगर सब कुछ properly setup है, तो आप:

- ✅ Login कर सकते हैं
- ✅ Documents create कर सकते हैं
- ✅ Voice recording use कर सकते हैं
- ✅ AI refinement use कर सकते हैं
- ✅ Documents download कर सकते हैं (PDF/DOCX)
- ✅ Emails send कर सकते हैं
- ✅ Documents edit/delete कर सकते हैं
- ✅ Approval workflow use कर सकते हैं

**Happy Coding! 🚀**
