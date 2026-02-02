# 🎯 MySQL Database Setup for Replit - Complete Guide

## ⚠️ Important: Replit पर MySQL कैसे use करें?

Replit directly MySQL support नहीं करता। लेकिन आप **Free External MySQL Database** use कर सकते हो!

---

## 🆓 Option 1: PlanetScale (Best - 5GB Free Forever)

### Step 1: PlanetScale Account Banao
1. **Website**: https://planetscale.com/
2. **Sign up** करो (GitHub account से)
3. **Create new database** click करो
4. Database name: `reqgen_db`
5. Region: **Choose closest** (e.g., Mumbai, Singapore)

### Step 2: Connection String Copy Karo
1. Dashboard में जाओ
2. **Connect** button click करो
3. Select: **"Connect with Node.js"**
4. Connection details copy karo:
   ```
   Host: xxxxxxx.connect.psdb.cloud
   Username: xxxxxxxxxx
   Password: ******************
   Database: reqgen_db
   ```

### Step 3: Replit Secrets में Add Karo
1. Replit में **Tools** → **Secrets** open करो
2. Yeh secrets add karo:

```env
USE_MYSQL=true
MYSQL_HOST=your-host.connect.psdb.cloud
MYSQL_PORT=3306
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=reqgen_db
```

### Step 4: Application Restart Karo
```bash
# Workflow restart button click karo
# Ya manually:
npm run dev
```

### Step 5: Test Karo
Login karo application में:
- Data permanent save hoga
- Workflow restart ke baad bhi data rahega! ✅

---

## 🆓 Option 2: Railway (Free $5 Credit Monthly)

### Step 1: Railway Account Banao
1. **Website**: https://railway.app/
2. Sign up with GitHub
3. **New Project** → **Provision MySQL**

### Step 2: Connection Details Copy Karo
1. MySQL service click karo
2. **Connect** tab में जाओ
3. Variables copy karo:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### Step 3: Replit Secrets में Add Karo (Same as above)

---

## 🆓 Option 3: Aiven (Free 30-Day Trial)

### Step 1: Aiven Account
1. **Website**: https://aiven.io/
2. Sign up → Select **MySQL** service
3. Free tier select karo

### Step 2: Connection Info Copy Karo
```env
USE_MYSQL=true
MYSQL_HOST=mysql-xxx.aivencloud.com
MYSQL_PORT=12345
MYSQL_USER=avnadmin
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=defaultdb
```

---

## 📝 Localhost XAMPP से Connect (Advanced)

⚠️ **Warning**: Yeh option **sirf local development** के liye hai. Replit cloud से aapke computer ka localhost accessible nahi hai.

### Solution: ngrok Use Karo
1. XAMPP start karo (MySQL running hona chahiye)
2. **ngrok** install karo: https://ngrok.com/
3. Terminal में run karo:
   ```bash
   ngrok tcp 3306
   ```
4. Forwarding URL copy karo (e.g., `tcp://0.tcp.ngrok.io:12345`)
5. Replit Secrets में add karo:
   ```env
   USE_MYSQL=true
   MYSQL_HOST=0.tcp.ngrok.io
   MYSQL_PORT=12345
   MYSQL_USER=root
   MYSQL_PASSWORD=
   MYSQL_DATABASE=reqgen_db
   ```

**⚠️ Limitation**: Free ngrok session 2 hours ke baad expire ho jata hai!

---

## ✅ Verify Connection

### Check Console Logs:
```
📦 Storage initialized: MySQL Database
✅ MySQL tables initialized successfully
```

### Test Database:
1. Login page kholo
2. Document create karo
3. Workflow restart karo
4. Data wapas dikhna chahiye! ✅

---

## 🐛 Common Issues & Solutions

### Error: `connect ETIMEDOUT`
**Problem**: Database server unreachable
**Solution**: 
- Check firewall settings
- Verify host/port correct hai
- PlanetScale/Railway dashboard check karo

### Error: `Access denied for user`
**Problem**: Wrong username/password
**Solution**: 
- Secrets ko double-check karo
- Database credentials regenerate karo

### Error: `Unknown database`
**Problem**: Database name wrong hai
**Solution**: 
- MYSQL_DATABASE value check karo
- Database exist karta hai verify karo

### Data Save Nahi Ho Raha
**Problem**: USE_MYSQL secret set nahi hai
**Solution**:
```env
USE_MYSQL=true  # Yeh zaroor add karo!
```

### Tables Nahi Ban Rahe
**Problem**: Automatic table creation fail
**Solution**: PlanetScale/Railway console mein manually run karo:
```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  original_note TEXT NOT NULL,
  refined_note TEXT,
  company_name TEXT,
  project_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 💡 Recommendations

1. **Best Choice**: **PlanetScale** (free forever, 5GB storage)
2. **Second Best**: **Railway** ($5/month credit)
3. **Testing Only**: **ngrok + XAMPP** (not for production)

---

## 🎉 Congratulations!

Aapka MySQL database ab Replit par connected hai! 

**Features:**
✅ Permanent data storage
✅ Auto-restart safe (data nahi jayega)
✅ Free hosting
✅ Production-ready

---

## 📞 Need Help?

1. Check console logs: `npm run dev`
2. Verify secrets: Tools → Secrets
3. Test connection in PlanetScale/Railway dashboard

**Happy Coding! 🚀**
