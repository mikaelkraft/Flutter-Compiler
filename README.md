# 🚀 Flutter Compiler for Acode  
**Turn your Android device into a Flutter development powerhouse**  
*By [Mikael Kraft](https://github.com/mikaelkraft)*  

![Flutter+Acode Banner](assets/flutter_icon.png)  

---

## ✨ Features  
- **Zero-config Flutter SDK installer** (Auto-deploys via Termux)  
- **Full Flutter/Dart command support**:  
  ```bash
  flutter run | build | pub get | doctor
  dart analyze | format | test
  ```  
- **Firebase Tools**:  
  ```bash
  flutterfire configure | deploy
  ```  
- **Cloud fallback** for low-end devices  

---

## 📥 Installation  

### **Prerequisites**  
1. [Acode Editor](https://play.google.com/store/apps/details?id=com.foxdebug.acodefree)  
2. [Termux (F-Droid)](https://f-droid.org/en/packages/com.termux/)  

### **Installation Methods**  
#### **Method 1: One-Click Install**  
Paste this in Acode's plugin installer:  
```
https://acode.foxdebug.com/plugin/install?url=https://github.com/mikaelkraft/Flutter-Compiler/releases/download/v1.0.1/Flutter-Compiler.zip
```  

#### **Method 2: Manual Setup**  
```bash
# Download plugin
wget https://github.com/mikaelkraft/Flutter-Compiler/releases/download/v1.0.1/Flutter-Compiler.zip

# In Acode:
Settings → Plugins → Install from Disk → Select ZIP
```  

---

## 🛠️ First-Run Setup  
The plugin automatically:  
1. Installs Flutter SDK + Dart in Termux  
2. Configures environment paths  
3. Verifies with `flutter doctor`  

*Requires ~1.5GB storage*  

---

## 🎮 Usage  
Access all commands via:  
```
Acode Menu → Plugins → Flutter Compiler
```  

### **Command Cheatsheet**  
| Icon | Command               | Terminal Equivalent               |  
|------|-----------------------|-----------------------------------|  
| 📦   | Pub Get               | `flutter pub get`                 |  
| 🔥   | FlutterFire Setup     | `flutterfire configure`           |  
| 🚀   | Run App               | `flutter run`                     |  
| 🧹   | Clean Project         | `flutter clean`                   |  
| 🔍   | Code Analysis         | `dart analyze`                    |  

---

## 🌩️ Cloud Compilation  
**Enable in plugin settings to:**  
- Offload builds to remote servers  
- Reduce device strain  

*Sample cloud config (Node.js):*  
```javascript
// Cloud endpoint example
app.post('/build', async (req) => {
  const { cmd, project } = req.body;
  const result = await exec(`cd ${project} && ${cmd}`);
  return { logs: result };
});
```

---

## ❓ Troubleshooting  

### **Common Issues**  
| Error                          | Solution                          |  
|--------------------------------|-----------------------------------|  
| `Termux not found`            | Install from F-Droid (not Play Store) |  
| `Flutter doctor errors`       | Run manual install:              |  
```bash
./termux_install.sh  # From project's assets folder
```  
| `Permission denied`           | Run:                             |  
```bash
termux-setup-storage && chmod +x termux_install.sh
```  

---

## 🛠️ Technical Details  

### **Plugin Structure**  
```
flutter_compiler_acode/  
├── plugin.json          # Metadata  
├── main.js              # Core logic  
└── assets/  
    ├── flutter_icon.png  
    └── termux_install.sh # Auto-installer  
```  

### **termux_install.sh**  
```bash
#!/bin/bash
pkg update -y && pkg install -y git wget openjdk-17 dart
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.22.2-stable.tar.xz
tar xf flutter_linux_3.22.2-stable.tar.xz
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc
flutter doctor --no-upgrade
```

---

## 📜 License  
MIT © [Mikael Kraft](https://github.com/mikaelkraft)  

> **Pro Tip**: Pair with [Termux:Widget](https://wiki.termux.com/wiki/Termux:Widget) for home-screen command shortcuts!  

[![Get on Acode](https://img.shields.io/badge/Acode-Plugin_Store-green)](https://acode.foxdebug.com/plugins)  
```

further!
