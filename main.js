// Flutter Compiler for Acode - Local Only Version
// By Mikael Kraft (@mikaelkraft)
// Version 1.0.2

class FlutterCompiler {
  // Simplified configuration
  static config = {
    termuxPath: "$HOME/flutter/bin",
    preferLocal: true, // Always true now
    debugMode: false
  };

  /* [INITIALIZATION] */
  static async init() {
    try {
      const savedConfig = await acode.getSecureConfig("flutter_compiler");
      if (savedConfig) {
        this.config = { 
          ...this.config, 
          ...JSON.parse(savedConfig),
          preferLocal: true // Force local mode
        };
      }
      
      if (!(await this._checkFlutterExists())) {
        await this._installFlutter();
      }
    } catch (e) {
      this._log(`Initialization failed: ${e.message}`, true);
    }
  }

  static async _checkFlutterExists() {
    try {
      return await acode.exec(`[ -d "${this.config.termuxPath}" ] && echo "1"`);
    } catch {
      return false;
    }
  }

  static async _installFlutter() {
    const INSTALL_CMD = `
      pkg update -y && 
      pkg install -y git wget openjdk-17 dart && 
      wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.22.2-stable.tar.xz && 
      tar xf flutter_linux_*.tar.xz && 
      echo 'export PATH="\\$PATH:\\$HOME/flutter/bin"' >> ~/.bashrc && 
      source ~/.bashrc
    `;
    
    try {
      acode.toast("⚙️ Setting up Flutter...");
      await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${INSTALL_CMD}"`);
      this._log("Flutter installation completed");
    } catch (e) {
      this._log(`Installation failed: ${e.message}`, true);
      throw e;
    }
  }

  /* [CORE EXECUTION] */
  static async execute(command) {
    this._log(`Executing: ${command}`);
    return await this._executeLocal(command); // Always use local execution
  }

  /* [LOCAL EXECUTION] */
  static async _executeLocal(command) {
    try {
      const projectDir = await editor.getProjectDir();
      const termuxCmd = `
        cd ${projectDir} &&
        export PATH="$PATH:${this.config.termuxPath}" &&
        ${command}
      `;
      
      await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${termuxCmd}"`);
      return { 
        success: true, 
        message: `📱 ${command.split(' ')[0]}` 
      };
     
return {
  success: true,
  message: `📱 Running in ${projectDir.split('/').pop()}` // Shows folder name
};
    } catch (e) {
      return { 
        success: false, 
        message: `❌ ${e.message}` 
      };
    }
  }

  /* [LOGGING] */
  static _log(message, isError = false) {
    if (!this.config.debugMode) return;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[Flutter][${timestamp}] ${message}`);
    if (isError) {
      acode.toast(`Flutter: ${message.substring(0, 50)}`, 3000);
    }
  }

  /* [COMMAND SHORTCUTS] */
  static doctor = () => this.execute("flutter doctor --no-upgrade");
  static pubGet = () => this.execute("flutter pub get");
  static buildApk = () => this.execute("flutter build apk --release");
  static buildAppBundle = () => this.execute("flutter build appbundle");
  static runApp = () => this.execute("flutter run");
  static analyze = () => this.execute("dart analyze");
  static format = () => this.execute("dart format .");
  static test = () => this.execute("flutter test");
  static clean = () => this.execute("flutter clean");
  static repair = () => this.execute("flutter pub upgrade --major-versions");
  
  static async flutterfire() { 
    const res = await this.execute("dart pub global activate flutterfire_cli");
    return res.success ? this.execute("flutterfire configure") : res;
  }
  
  static firebaseDeploy = () => this.execute("flutter pub run flutterfire_cli:flutterfire deploy");
}

/* [PLUGIN UI SETUP] */
acode.on("initialize", FlutterCompiler.init);

// Installation Welcome Message
acode.on("install", async () => {
  const choice = await acode.confirm(
    "🎉 Flutter Compiler Installed!",
    `Transform your Android device into a Flutter development environment!
    
Need help? Check the documentation or support the project.`,
    [
      { text: "Get Started", id: "ok" },
      { text: "View Docs", id: "docs" },
      { text: "Donate", id: "donate" }
    ]
  );

  if (choice === "docs") {
    acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki");
  } else if (choice === "donate") {
    acode.launchUrl("https://github.com/sponsors/mikaelkraft");
  }
});

// Unified Help & Support Menu
acode.setPluginMenu("❓ Help & Support", () => {
  acode.showPicker(
    "Flutter Compiler - Support",
    [
      "📚 Documentation",
      "💖 Sponsor Development", 
      "🐛 Report Issues",
      "💬 Join Community"
    ],
    (selected) => {
      const actions = {
        0: () => acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki"),
        1: () => {
          acode.showPicker(
            "Support Options",
            [
              "GitHub Sponsors (Monthly)",
              "Buy Me a Coffee (One-time)", 
              "Copy Crypto Address (USDT on ERC20)"
            ],
            (donationChoice) => {
              const urls = {
                0: "https://github.com/sponsors/mikaelkraft",
                1: "https://buymeacoffee.com/mikaelkraft",
                2: "0x57ccCC13ba0aBF9Dc7f884E94875e73856160822"
              };
              if (donationChoice === 2) {
                acode.setClipboard(urls[2]);
                acode.toast("USDT(ERC20) Wallet address copied!");
              } else {
                acode.launchUrl(urls[donationChoice]);
              }
            }
          );
        },
        2: () => acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/issues"),
        3: () => acode.launchUrl("https://discord.gg/your-invite-link")
      };
      actions[selected]();
    }
  );
});

// Settings Menu
acode.setPluginMenu("⚙️ Settings", () => {
  acode.showInputDialog("Compiler Settings", [
    {
      label: "Debug Mode",
      type: "checkbox",
      checked: FlutterCompiler.config.debugMode
    }
  ], async (values) => {
    FlutterCompiler.config.debugMode = values[0];
    await acode.setSecureConfig("flutter_compiler", JSON.stringify(FlutterCompiler.config));
    acode.toast("✅ Settings saved");
  });
});

// Command Menu
[
  { icon: "🩺", name: "Flutter Doctor", cmd: "doctor" },
  { icon: "📦", name: "Pub Get", cmd: "pubGet" },
  { icon: "🚀", name: "Run App", cmd: "runApp" },
  { icon: "🔧", name: "Build APK", cmd: "buildApk" },
  { icon: "📦", name: "Build AppBundle", cmd: "buildAppBundle" },
  { icon: "🔥", name: "FlutterFire Setup", cmd: "flutterfire" },
  { icon: "☁️", name: "Firebase Deploy", cmd: "firebaseDeploy" },
  { icon: "🧹", name: "Clean Project", cmd: "clean" },
  { icon: "🔄", name: "Repair Packages", cmd: "repair" },
  { icon: "🔍", name: "Code Analysis", cmd: "analyze" },
  { icon: "✨", name: "Format Code", cmd: "format" },
  { icon: "🧪", name: "Run Tests", cmd: "test" }
].forEach(({icon, name, cmd}) => {
  acode.setPluginMenu(`${icon} ${name}`, () => 
    FlutterCompiler[cmd]().then(res => acode.toast(res.message))
});