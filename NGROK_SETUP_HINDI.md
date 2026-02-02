# 🌐 Ngrok Setup Guide - Replit ke liye

Ye guide Replit par XAMPP database use karne ke liye hai

---

## 🤔 Ngrok Kya Hai?

**Ngrok** ek tool hai jo aapke **PC ko internet se connect** karta hai.

**Kyu Chahiye?**
- Aapka XAMPP **local PC** par hai (private)
- Replit **cloud** par hai (internet par)
- Replit ko aapke PC ke database tak **access** chahiye
- Ngrok ek **tunnel** (bridge) banata hai dono ke beech

**Simple Analogy**:
- Aapka ghar = Local PC (XAMPP)
- Office = Replit (cloud)
- Ngrok = Teleporter jo office se ghar connect kare! 🚀

---

## 📥 Step 1: Ngrok Download Karo

1. Visit: https://ngrok.com/download
2. **Sign up** karo (free account)
3. Apne OS ke liye download karo:
   - Windows: `ngrok-v3-stable-windows-amd64.zip`
   - Mac: `ngrok-v3-stable-darwin-amd64.zip`
   - Linux: `ngrok-v3-stable-linux-amd64.zip`
4. Extract karo (e.g., `C:\ngrok\`)

---

## 🔑 Step 2: Ngrok Authenticate Karo

1. Login karo: https://dashboard.ngrok.com/
2. **Authtoken** copy karo
3. Command Prompt/Terminal open karo
4. Ye command run karo:

```bash
# Windows (agar C:\ngrok mein extract kiya)
C:\ngrok\ngrok config add-authtoken YOUR_AUTH_TOKEN

# Mac/Linux
./ngrok config add-authtoken YOUR_AUTH_TOKEN
```

**Sirf ek baar karna hai!**

---

## 🚀 Step 3: XAMPP MySQL Tunnel Banao

### XAMPP MySQL Running Hai?
XAMPP Control Panel mein check karo - MySQL **green** hona chahiye

### Ngrok Start Karo

Command Prompt/Terminal mein:

```bash
# Windows
C:\ngrok\ngrok tcp 3306

# Mac/Linux  
./ngrok tcp 3306
```

---

## 📋 Step 4: Connection Details Copy Karo

Terminal mein ye output dikhega:

```
Session Status    online
Account           your-email (Plan: Free)
Forwarding        tcp://0.tcp.ngrok.io:18447 -> localhost:3306
                  ^^^^^^^^^^^^^^^^^  ^^^^^
                  Host               Port
```

**Copy karo**:
- **Host**: `0.tcp.ngrok.io` (ya jo bhi dikhe)
- **Port**: `18447` (random number - har baar different hoga)

**IMPORTANT**: 
- Port `3306` NAHI - jo ngrok de raha hai wo use karo!
- Free plan mein har baar new URL milega

---

## 🔐 Step 5: Replit Secrets Update Karo

Replit mein jao:

1. Left sidebar mein **Secrets** (🔒 lock icon) click karo
2. Ye secrets add/update karo:

| Secret Name | Value |
|-------------|-------|
| USE_MYSQL | `true` |
| MYSQL_HOST | `0.tcp.ngrok.io` (apna ngrok host) |
| MYSQL_PORT | `18447` (apna ngrok port) |
| MYSQL_USER | `root` |
| MYSQL_PASSWORD | (khali chhodo) |
| MYSQL_DATABASE | `reqgen_db` |

3. **Save** karo

---

## ✅ Step 6: Replit Application Restart Karo

Mujhe bolo: "Ngrok setup complete - please restart"

Main application restart kar dunga aur:
- ✅ Replit aapke PC ke XAMPP se connect hoga
- ✅ Same database dono jagah
- ✅ Login kaam karega!

---

## ⏰ Important Notes

### Ngrok Terminal Band Mat Karo!
- Jab tak Replit use kar rahe ho, ngrok **running** rehna chahiye
- Terminal close kiya = connection khatam

### Har Baar New URL Milega (Free Plan)
- Ngrok restart kiye = new port number
- Replit Secrets phir se update karne honge
- **Paid plan** ($8/month) = fixed URL (optional)

### Speed Thoda Slow Ho Sakta Hai
- Data aapke PC se tunnel ke through jaa raha hai
- Normal hai - koi tension nahi!

---

## 🔧 Troubleshooting

### Error: "ECONNREFUSED"
**Problem**: Ngrok tunnel nahi chal raha
**Solution**:
- Check ngrok terminal running hai
- XAMPP MySQL green hai
- Replit secrets mein sahi host/port hai

### Error: "Tunnel expired"
**Problem**: Free ngrok session timeout (2 hours)
**Solution**:
- Ngrok restart karo
- Naya host/port Replit Secrets mein update karo

### "Authentication failed"
**Problem**: Authtoken galat hai
**Solution**:
- Ngrok dashboard se token copy karo
- Phir se authenticate karo

---

## 🎯 Quick Checklist

Before using Replit with XAMPP:

- [ ] XAMPP MySQL running hai (green light)
- [ ] Ngrok terminal running hai
- [ ] Ngrok ne host aur port diya
- [ ] Replit Secrets mein sahi details hai
- [ ] Application restart ki

---

## 💡 Pro Tip

**Script Banao (Optional)**:

Save this as `start-ngrok.bat` (Windows):
```batch
@echo off
echo Starting ngrok tunnel for MySQL...
C:\ngrok\ngrok tcp 3306
pause
```

Double-click karne se ngrok start ho jayega! 🚀

---

## ❓ Questions?

- Ngrok free mein kitna time chalega? → **Unlimited** (but URL har baar change)
- Kya secure hai? → **Haan**, encrypted tunnel
- Kya production mein use kar sakte? → **Nahi**, sirf development ke liye

Koi doubt ho toh mujhe batao! 😊
