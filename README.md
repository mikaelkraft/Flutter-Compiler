# 🚀 Flutter Compiler for Acode

**Turn your Android device into a full Flutter development environment**  
*By [Mikael Kraft](https://github.com/mikaelkraft)*

![Flutter Logo](assets/flutter_icon.png)

---

## ✨ Features

- **One-tap Flutter SDK installer** ([Termux](https://f-droid.org/en/packages/com.termux/), [Termux:API](https://f-droid.org/en/packages/com.termux.api/))
- **Complete Flutter/Dart toolchain**:
    ```bash
    flutter create | run | build | pub get | doctor
    dart analyze | format | test
    ```
- **Firebase Tools integration**:
    ```bash
    flutterfire configure | deploy
    ```

---

## 📥 Installation

### Prerequisites

1. [Acode Editor (Google Play)](https://play.google.com/store/apps/details?id=com.foxdebug.acodefree)
2. [Termux (F-Droid)](https://f-droid.org/en/packages/com.termux/)
3. [Termux:API (F-Droid)](https://f-droid.org/en/packages/com.termux.api/) — Required for command execution
4. [Acode X Terminal Plugin](https://acode.foxdebug.com/plugins) — Download from Acode's plugin directory

### Installation

#### Install via Acode:
```text
Settings → Plugins → Install from URL:
https://github.com/mikaelkraft/Flutter-Compiler
```

#### Or Install via Termux:

1. Install [Termux](https://f-droid.org/en/packages/com.termux/) and [Termux:API](https://f-droid.org/en/packages/com.termux.api/) from F-Droid.
2. Run the following in Termux:
   ```bash
   pkg install git
   git clone https://github.com/mikaelkraft/Flutter-Compiler
   acode install Flutter-Compiler
   ```
3. Accept all permissions

---

## 🛠️ First-Run Setup

The plugin will automatically:

1. Install Flutter SDK in Termux (~1.5GB)
2. Configure environment paths
3. Verify with `flutter doctor`

---

## 🎮 Usage

Access all commands via:

```text
Acode Menu → Plugins → Flutter Compiler
```

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
| Code Analysis       | Check for errors                    |
| Format Code         | Format Dart code                    |
| Run Tests           | Execute test suite                  |

---

## 🚀 Flutter Development in Acode - Full Workflow

### 1. Create a New Project

1. Open Acode's file manager
2. Create a folder for your project (e.g. `my_app`)
3. Use the "Create Project" command from the plugin menu

### 2. Write Your Code

- Use Acode's editor for:
  - `lib/main.dart` (Main app code)
  - `pubspec.yaml` (Dependencies)
  - `test/` (Test files)

### 3. Run Commands via Plugin

Access these through:

```text
Acode Menu → Plugins → Flutter Compiler
```

### 4. Debugging Workflow

1. Make code changes in Acode
2. Run `flutter run` through the plugin
3. View logs directly in Termux or Acode X Terminal

### 5. Building for Release

Via plugin menu:
```text
1. Build AppBundle (for Play Store)
2. Build APK (for direct install)
```

### 6. Advanced Usage

**Hot Reload (After running app):**
1. Save changes in Acode (`Ctrl+S`)
2. Press `r` in Termux where `flutter run` is active

**Hot Restart:** Press `R` in Termux for full restart

**Testing:** Use the "Run Tests" command to execute `flutter test`

### 7. Project Management

- Clean Project: Removes build files
- Repair Packages: Fixes dependency issues
- Code Analysis: Checks for errors and warnings

---

## 🧭 Termux:API Requirement

[Termux:API](https://f-droid.org/en/packages/com.termux.api/) is essential for this plugin to function properly. It provides:

- Secure command execution from Acode to Termux
- Background service for long-running processes
- Proper environment access for Flutter tools
- Reliable communication between apps

**Installation Steps:**

1. Install [Termux:API](https://f-droid.org/en/packages/com.termux.api/) from F-Droid
2. Grant necessary permissions when prompted
3. The plugin will automatically detect and use Termux:API

---

## 🧭 Acode X Terminal Integration

[Acode X Terminal Plugin](https://acode.foxdebug.com/plugins) complements this plugin by providing:

- Integrated terminal inside Acode editor
- Quick command execution alongside your code
- Real-time log viewing during development
- Easy access to Termux environment

**Use Cases:**

- View `flutter run` output while coding
- Run quick Dart commands without switching apps
- Monitor build processes in real-time

---

## ❓ Troubleshooting

### Common Issues

| Error                | Solution                                |
|----------------------|-----------------------------------------|
| Termux not found     | Install from F-Droid (required)         |
| Termux:API missing   | Install Termux:API from F-Droid         |
| Storage access       | Run: `termux-setup-storage` in Termux   |
| Flutter not found    | Re-run installer:<br>```bash<br>bash ~/flutter_installer.sh<br>``` |
| Permission denied    | Grant Termux storage permissions        |

---

### Manual Installation

If automatic setup fails, run in Termux:

```bash
# Manual Flutter installation
pkg update && pkg install git wget openjdk-17 dart
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.22.2-stable.tar.xz
tar xf flutter_linux_*.tar.xz
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
source ~/.bashrc
```

---

## 🛠️ Technical Details

### Plugin Structure

```
flutter_compiler_acode/
├── plugin.json          # Metadata
├── main.js              # Core logic
└── assets/
    ├── flutter_icon.png
    └── termux_install.sh # Auto-installer
```

### Requirements

- Android 8.0+ (for Termux support)
- Minimum 2GB free storage (for Flutter SDK)
- Internet connection for initial setup

---

## 📜 License

MIT © [Mikael Kraft](https://github.com/mikaelkraft)

[![Acode Plugin](https://img.shields.io/badge/Acode-Plugin-green)](https://github.com/mikaelkraft/Flutter-Compiler)