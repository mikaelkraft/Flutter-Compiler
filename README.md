# 🚀 Flutter Compiler for Acode

**Transform your Android device into a full-featured Flutter development environment, with a modern UI and advanced settings.**  
*By [Mikael Kraft](https://github.com/mikaelkraft)*

![Flutter Logo](assets/flutter_icon.png)

---

## ✨ Features (v1.0.9)

- **One-tap Flutter SDK installer** (Termux/Termux:API integration)
- **Full Flutter/Dart toolchain:**  
    - `flutter create`, `run`, `build`, `pub get`, `doctor`  
    - `dart analyze`, `format`, `test`
- **Firebase Tools integration:**  
    - `flutterfire configure`, `deploy`
- **Modern UI:**  
    - All actions available via plugin menu  
    - No command palette registration required
- **Advanced Settings:**  
    - Flutter SDK path  
    - Debug mode  
    - Reset all settings to defaults
- **Dedicated Menus:**  
    - Help & Support, Docs, Donate, Community links  
    - Changelog (see [CHANGELOG.md](CHANGELOG.md))

---

## 📥 Installation

### Prerequisites

1. [Acode Editor](https://play.google.com/store/apps/details?id=com.foxdebug.acodefree)
2. [Termux (F-Droid)](https://f-droid.org/en/packages/com.termux/)
3. [Termux:API (F-Droid)](https://f-droid.org/en/packages/com.termux.api/)
4. [Acode X Terminal Plugin](https://acode.foxdebug.com/plugins) (recommended for terminal integration)

### Installation

**Via Acode:**  
- Go to:  
  `Settings → Plugins → Install from ZIP`  
- Select your zipped plugin, ensuring the following structure (files at root):

```
main.js
plugin.json
README.md
CHANGELOG.md
assets/
  flutter_icon.png
  termux_install.sh
```

**Via Termux:**  
```bash
pkg install git
git clone https://github.com/mikaelkraft/Flutter-Compiler
acode install Flutter-Compiler
```
Accept all permissions when prompted.

---

## 🛠️ First-Run Setup

On first launch, the plugin will:
1. Show a welcome dialog
2. Install Flutter SDK in Termux (~1.5GB)
3. Configure environment paths
4. Verify with `flutter doctor`

---

## 🎮 Usage

All features are available via:
- **Acode Menu → Plugins → Flutter Compiler**
- Plugin sidebar panel, with action buttons and settings

### Commands Available

| Menu Command         | Description                         |
|----------------------|-------------------------------------|
| Create Project       | Initialize new Flutter project      |
| Flutter Doctor       | Verify installation                 |
| Pub Get              | Install dependencies                |
| Run App              | Launch on connected device          |
| Build APK            | Generate release APK                |
| Build AppBundle      | Generate Play Store bundle          |
| FlutterFire Setup    | Configure Firebase                  |
| Firebase Deploy      | Deploy to Firebase                  |
| Clean Project        | Remove build files                  |
| Repair Packages      | Fix dependency issues               |
| Code Analysis        | Check for errors                    |
| Format Code          | Format Dart code                    |
| Run Tests            | Execute test suite                  |
| ⚙️ Settings          | Configure plugin/debug mode         |
| 📑 Changelog         | View [CHANGELOG.md](CHANGELOG.md)   |
| ❓ Help & Support    | Links to docs, donations, issues    |

> **Note:** Menus and commands are available in the **Plugins** sidebar after installing the plugin.  
> If you only see documentation, check your ZIP structure and ensure `"main"` is set to `"main.js"` in `plugin.json`.

---

## 🧭 Termux:API Requirement

[Termux:API](https://f-droid.org/en/packages/com.termux.api/) is required for secure command execution and background processes. The plugin will auto-detect and use Termux:API if installed.

---

## 🧭 Acode X Terminal Integration

[Acode X Terminal Plugin](https://acode.foxdebug.com/plugins) is recommended for real-time log viewing and quick command execution inside Acode.

---

## ❓ Troubleshooting

| Error                | Solution                                |
|----------------------|-----------------------------------------|
| Termux not found     | Install from F-Droid (required)         |
| Termux:API missing   | Install Termux:API from F-Droid         |
| Storage access       | Run: `termux-setup-storage` in Termux   |
| Flutter not found    | Re-run installer or reset settings      |
| Permission denied    | Grant Termux storage permissions        |

---

### Manual Installation

If automatic setup fails, run in Termux:
```bash
pkg update && pkg install git wget openjdk-17 dart
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.35.1-stable.tar.xz
tar xf flutter_linux_*.tar.xz
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc
```

---

## 🛠️ Technical Details

### Plugin Structure

```
Flutter-Compiler/
├── plugin.json          # Metadata
├── main.js              # Core logic (Acode plugin format)
├── CHANGELOG.md         # Changelog
├── README.md            # Documentation
└── assets/
    ├── flutter_icon.png
    └── termux_install.sh # Auto-installer
```

- **main.js** must use `module.exports` and register menus in `init(acode)` to show commands!
- **plugin.json** must include `"main": "main.js"` and `"files": [...]` listing all plugin files at the root level.

### Requirements

- Android 8.0+ (Termux support)
- Minimum 2GB free storage (Flutter SDK)
- Internet connection for setup

---

## 📜 License

MIT © [Mikael Kraft](https://github.com/mikaelkraft)

---

## 📑 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## 🔗 Repository

[GitHub: Mikael Kraft / Flutter-Compiler](https://github.com/mikaelkraft/Flutter-Compiler)

---
