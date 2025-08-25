
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
    - All actions available via plugin sidebar panel
    - No command palette registration required
- **Advanced Settings:**
    - Flutter SDK path
    - First run dialog toggle
    - Debug mode
    - Verbose logging
    - Default project directory
    - Dark theme toggle (live preview)
    - Reset all settings to defaults

---

## 📥 Installation

### Prerequisites

1. [Acode Editor](https://play.google.com/store/apps/details?id=com.foxdebug.acodefree)
2. [Termux (F-Droid)](https://f-droid.org/en/packages/com.termux/)
3. [Termux:API (F-Droid)](https://f-droid.org/en/packages/com.termux.api/)
4. [Acode X Terminal Plugin](https://acode.foxdebug.com/plugins) (optional, for terminal integration)

### Installation

**Via Acode:**
```
Settings → Plugins → Install from URL:
https://github.com/mikaelkraft/Flutter-Compiler
```

**Via Termux:**
```
pkg install git
git clone https://github.com/mikaelkraft/Flutter-Compiler
acode install Flutter-Compiler
```
Accept all permissions when prompted.

---

## 🛠️ First-Run Setup

On first launch, the plugin will:

1. Show a welcome dialog (can be toggled in settings)
2. Install Flutter SDK in Termux (~1.5GB)
3. Configure environment paths
4. Verify with `flutter doctor`

---

## 🎮 Usage

Access all features via:

```
Acode Menu → Plugins → Flutter Compiler
```

Or open the sidebar panel for a modern UI with action buttons and settings.

### Command Cheatsheet

| Command             | Description                         |
|---------------------|-------------------------------------|
| Create Project      | Initialize new Flutter project      |
| Flutter Doctor      | Verify installation                 |
| Pub Get             | Install dependencies                |
| Run App             | Launch on connected device          |
| Build APK           | Generate release APK                |
| Build AppBundle     | Generate Play Store bundle          |
| FlutterFire Setup   | Configure Firebase                  |
| Firebase Deploy     | Deploy to Firebase                  |
| Clean Project       | Remove build files                  |
| Repair Packages     | Fix dependency issues               |
| Code Analysis       | Check for errors                    |
| Format Code         | Format Dart code                    |
| Run Tests           | Execute test suite                  |

---

## 🚀 Flutter Development Workflow

1. **Create a New Project**
    - Open Acode's file manager
    - Create a folder for your project (e.g. `my_app`)
    - Use "Create Project" from the plugin UI

2. **Write Your Code**
    - Edit `lib/main.dart`, `pubspec.yaml`, and test files in Acode

3. **Run Commands**
    - Use the plugin UI for all Flutter/Dart actions

4. **Debug & Build**
    - Run `flutter run` and view logs in Termux or Acode X Terminal
    - Build APK/AppBundle for release

5. **Advanced**
    - Hot reload: Save in Acode, press `r` in Termux
    - Hot restart: Press `R` in Termux
    - Run tests: Use "Run Tests" in plugin

6. **Settings**
    - Access advanced settings from the plugin UI
    - Configure SDK path, theme, logging, and more
    - Reset settings to defaults if needed

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
├── main.js              # Core logic
├── README.md            # Documentation
└── assets/
    ├── flutter_icon.png
    └── termux_install.sh # Auto-installer
```

### Requirements

- Android 8.0+ (Termux support)
- Minimum 2GB free storage (Flutter SDK)
- Internet connection for setup

---

## 📜 License

MIT © [Mikael Kraft](https://github.com/mikaelkraft)

[![Acode Plugin](https://img.shields.io/badge/Acode-Plugin-green)](https://github.com/mikaelkraft/Flutter-Compiler)