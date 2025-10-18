# 🚀 SHANTHI App - Deployment & Update Guide

**Date:** October 17, 2025  
**App Version:** 1.0.0  
**EAS Project ID:** a5ba71d6-69f1-4bd8-8f23-d1b22e92890a

---

## 📋 Recent Changes Ready for Deployment

### ✅ Changes in This Update:
1. **Notifications Fixed** - Now sends 1 notification daily at 12:00 PM with message "Time to use the SHANTHI App for relaxation"
2. **Login Screen** - Changed label text colors from white to dark blue for better visibility
3. **App Usage Tracking** - Fixed offline queue, race conditions, and improved reliability

---

## 🎯 Recommended: Option 1 - EAS Update (Quick Over-The-Air Update)

**Best for:** JavaScript/React changes (like your notification and UI fixes)  
**Time:** ~5 minutes  
**Users get update:** Automatically on next app restart  
**No app store required:** ✅

### Step-by-Step Instructions:

#### 1️⃣ Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

#### 2️⃣ Login to your Expo account
```bash
eas login
```
Enter your Expo credentials when prompted.

#### 3️⃣ Configure EAS Update (First time only)
```bash
eas update:configure
```
This will add update configuration to your `app.json` file.

#### 4️⃣ Publish the Update
```bash
eas update --branch production --message "Fixed notifications to 1x daily at 12pm, improved login visibility, enhanced app usage tracking"
```

#### 5️⃣ Verify Update was Published
```bash
eas update:list --branch production
```

### ✨ That's it! 
Users will automatically download the update the next time they open the app (while online).

---

## 📦 Option 2 - EAS Build (New APK/IPA Build)

**Best for:** Native code changes, permission changes, or major version updates  
**Time:** ~15-20 minutes (build time)  
**Users get update:** Need to install new APK manually

### Step-by-Step Instructions:

#### 1️⃣ Update Version Number (Optional but Recommended)
Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // Change from 1.0.0 to 1.0.1
    "android": {
      "versionCode": 2   // Increment from 1 to 2
    }
  }
}
```

#### 2️⃣ Build for Android
```bash
eas build --platform android --profile production
```

**What happens:**
- Build starts on EAS servers
- You'll get a URL to track build progress
- Build takes ~15-20 minutes
- You'll get a download link when complete

#### 3️⃣ Download the APK
Once build completes, you'll get a URL like:
```
https://expo.dev/accounts/[your-account]/projects/shanthi/builds/[build-id]
```

Click the download button to get the APK file.

#### 4️⃣ Distribute to Users
- Upload APK to Google Drive
- Share link with participants
- Or send via email/WhatsApp

---

## 🔄 Which Option Should You Choose?

### Use **EAS Update** (Option 1) if:
- ✅ You only changed JavaScript/React code (your current changes)
- ✅ You want users to get updates automatically
- ✅ You want fast deployment (5 minutes)
- ✅ No native code or permissions changed

### Use **EAS Build** (Option 2) if:
- ❌ You changed native Android/iOS code
- ❌ You added new permissions
- ❌ You updated native dependencies
- ❌ You want to submit to Google Play Store (future)

**For your current changes (notifications + UI), use Option 1 - EAS Update** ✅

---

## 📱 How Users Receive Updates

### With EAS Update:
1. User opens the app
2. App checks for updates (while showing splash screen)
3. Downloads update if available (~1-2 seconds)
4. Restarts app with new code
5. User sees changes immediately

### With New APK Build:
1. You send them the new APK file
2. User downloads and installs it
3. May need to allow "install from unknown sources"
4. User sees changes immediately

---

## 🛠️ Complete Deployment Commands

### Quick Reference:

```bash
# For JavaScript/React changes (RECOMMENDED for your case)
eas update --branch production --message "Your update message here"

# To build new Android APK
eas build --platform android --profile production

# To check update status
eas update:list --branch production

# To check build status
eas build:list
```

---

## 📊 Testing Before Deployment

### Local Testing:
```bash
# Start development server
npm start

# Or run on connected Android device
npm run android
```

### Pre-deployment Checklist:
- [ ] Test notification appears at 12 PM
- [ ] Login screen labels are visible (dark blue text)
- [ ] App usage tracking works (check console logs)
- [ ] No console errors
- [ ] App doesn't crash on startup
- [ ] Test on actual Android device if possible

---

## 🔐 EAS Configuration Files

Your app already has these configured:

### `eas.json` - Build and deployment settings
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### `app.json` - EAS Project ID
```json
{
  "extra": {
    "eas": {
      "projectId": "a5ba71d6-69f1-4bd8-8f23-d1b22e92890a"
    }
  }
}
```

---

## 🆘 Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### "No project found"
Make sure you're in the correct directory:
```bash
cd c:\Users\alsto\Desktop\NurseApp
```

### Update not showing on device
1. Make sure device has internet connection
2. Close app completely and reopen
3. Check update was published: `eas update:list --branch production`

### Build failed
1. Check build logs at the URL provided
2. Common issues:
   - Missing dependencies
   - TypeScript errors
   - Configuration issues

---

## 📝 Version History Tracking

Keep track of your updates:

| Version | Date | Changes | Method |
|---------|------|---------|--------|
| 1.0.0 | Initial | Initial release | APK Build |
| 1.0.1 | Oct 17, 2025 | Fixed notifications, login UI, app usage tracking | EAS Update |

---

## 🎓 Next Steps After Deployment

1. **Test on a real device** - Install and verify changes
2. **Monitor logs** - Check Supabase for app usage data
3. **Gather feedback** - Ask participants about notification timing
4. **Document issues** - Keep track of any bugs reported

---

## 🔗 Useful Links

- **EAS Documentation:** https://docs.expo.dev/eas/
- **EAS Update Docs:** https://docs.expo.dev/eas-update/introduction/
- **Your EAS Dashboard:** https://expo.dev/accounts/[your-account]/projects/shanthi
- **Build Status:** https://expo.dev/accounts/[your-account]/projects/shanthi/builds

---

## 💡 Pro Tips

1. **Always test locally first** before publishing updates
2. **Use descriptive update messages** so you know what each update contains
3. **Keep version numbers updated** in app.json for tracking
4. **EAS Update is free** for JavaScript changes
5. **Builds count toward your plan limits** (check your Expo plan)

---

## 🚨 Emergency Rollback

If an update causes issues:

```bash
# Rollback to previous update
eas update --branch production --message "Rollback to previous version"

# Point to a specific previous update
eas update:republish --group [group-id]
```

---

## ✅ Recommended Action Now

**Run this command to deploy your fixes:**

```bash
eas update --branch production --message "Fixed notifications to 1x daily at 12pm, improved login screen visibility, enhanced app usage tracking with offline support"
```

This will push your changes to all users within minutes! 🎉
