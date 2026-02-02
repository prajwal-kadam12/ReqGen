# 🔧 Localhost पर Email Error Fix करें

## ❌ Problem
Localhost पर email send करने पर यह error आता है:
```
Error: connect ECONNREFUSED 127.0.0.1:587
```

## ✅ Solution - 3 Simple Steps

### Step 1: `.env` File बनाएं

अपने project folder में एक नई file बनाएं जिसका नाम हो: `.env`

**Windows में:**
1. Project folder खोलें
2. File Explorer में Right Click करें
3. New → Text Document
4. नाम बदलें: `.env` (बिना .txt के)

**Mac/Linux में:**
```bash
touch .env
```

---

### Step 2: `.env` File में यह Code Copy करें

```env
# Database Configuration
USE_MYSQL=false

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM_EMAIL=your-email@gmail.com
```

---

### Step 3: Gmail App Password बनाएं और Fill करें

#### 3.1 Gmail App Password बनाना:

1. **Google Account Security पर जाएं:**
   - खोलें: https://myaccount.google.com/security

2. **2-Step Verification Enable करें:**
   - "2-Step Verification" ढूंढें
   - अगर OFF है तो ON करें
   - Phone number verify करें

3. **App Password Generate करें:**
   - खोलें: https://myaccount.google.com/apppasswords
   - "Select app" में **"Mail"** चुनें
   - "Select device" में **"Other"** चुनें
   - नाम लिखें: "ReqGen App"
   - **"Generate"** button पर click करें
   - आपको 16-character password मिलेगा: `abcd efgh ijkl mnop`

4. **Password Copy करें:**
   - उस password को copy करें
   - **IMPORTANT:** Spaces हटा दें, बस letters रखें

#### 3.2 `.env` File में Fill करें:

```env
# आपकी actual details यहाँ डालें:

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=kadamprajwal358@gmail.com              ← अपना Gmail address
SMTP_PASSWORD=abcdefghijklmnop                    ← App password (बिना spaces के)
SMTP_FROM_EMAIL=kadamprajwal358@gmail.com         ← वही Gmail address
```

---

### Step 4: Application Restart करें

Terminal में:
```bash
# Server को बंद करें (Ctrl+C)

# फिर से चालू करें:
npm run dev
```

---

## ✅ Test करें

1. Login करें
2. किसी document पर Email icon पर click करें
3. Email address डालें और Send करें
4. ✅ Email successfully भेज दिया जाएगा!

---

## ⚠️ Common Errors और Solutions

### Error 1: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Reason:** Normal Gmail password use किया है, App Password नहीं  
**Solution:** Step 3 follow करें और App Password बनाएं

### Error 2: "connect ECONNREFUSED 127.0.0.1:587"
**Reason:** `.env` file नहीं है या गलत configuration है  
**Solution:** `.env` file check करें, सभी fields सही भरे हों

### Error 3: ".env file not found"
**Reason:** `.env` file project के root folder में नहीं है  
**Solution:** `.env` file को project के main folder में रखें (जहाँ `package.json` है)

---

## 📋 Checklist - सब कुछ सही है?

- [ ] `.env` file बनाई (project root में)
- [ ] Gmail में 2-Step Verification ON है
- [ ] App Password generate किया
- [ ] `.env` में App Password paste किया (spaces हटाकर)
- [ ] SMTP_USER और SMTP_FROM_EMAIL में सही Gmail address है
- [ ] Server restart किया (`npm run dev`)
- [ ] Test email भेजा और successfully मिला

---

## 🎉 All Done!

अब localhost और Replit दोनों पर email काम करेगा!

**Replit:** Secrets में already configure है ✅  
**Localhost:** `.env` file में configure किया ✅

Happy Coding! 🚀
