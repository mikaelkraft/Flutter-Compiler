// Flutter Compiler for Acode - Local Only Version
// By Mikael Kraft (@mikaelkraft)
// Version 1.0.3 (patched for safer UI argument handling)

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
        try {
          const parsed = JSON.parse(savedConfig);
          this.config = { 
            ...this.config, 
            ...parsed,
            preferLocal: true // Force local mode
          };
        } catch (e) {
          // if saved config corrupt, ignore it
          this._log(`Saved config parse failed: ${e.message}`, true);
        }
      }
      
      if (!(await this._checkFlutterExists())) {
        await this._installFlutter();
      }
    } catch (e) {
      this._log(`Initialization failed: ${e && e.message ? e.message : e}`, true);
    }
  }

  static async _checkFlutterExists() {
    try {
      const res = await acode.exec(`[ -d "${this.config.termuxPath}" ] && echo "1"`);
      // normalize result: some acode.exec return string, some boolean, etc.
      return !!res && String(res).trim() === "1";
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
      await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${encodeURIComponent(INSTALL_CMD)}"`);
      this._log("Flutter installation completed");
    } catch (e) {
      this._log(`Installation failed: ${e && e.message ? e.message : e}`, true);
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
      
      // Check if project directory exists
      if (!projectDir) {
        return { 
          success: false, 
          message: "❌ No project directory found. Please open a project first." 
        };
      }
      
      // Check if it's a Flutter project
      const hasPubspec = await acode.exec(`[ -f "${projectDir}/pubspec.yaml" ] && echo "1"`);
      if (!hasPubspec && !command.includes("create")) {
        return {
          success: false,
          message: "❌ Not a Flutter project. Run 'flutter create .' first."
        };
      }
      
      const termuxCmd = `
        cd ${projectDir} &&
        export PATH="$PATH:${this.config.termuxPath}" &&
        ${command}
      `;
      
      // Try Termux:API first for better integration
      let result;
      try {
        result = await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${encodeURIComponent(termuxCmd)}"`);
      } catch (apiError) {
        // Fallback to basic Termux execution
        this._log("Termux:API not available, using fallback", true);
        result = await acode.exec(`termux-exec ${termuxCmd}`);
      }
      
      return { 
        success: true, 
        message: `📱 Running in ${projectDir.split('/').pop()}`,
        output: result
      };
    } catch (e) {
      return { 
        success: false, 
        message: `❌ ${e && e.message ? e.message : e}`,
        error: e ? e.toString() : String(e)
      };
    }
  }

  /* [LOGGING] */
  static _log(message, isError = false) {
    if (!this.config.debugMode) return;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[Flutter][${timestamp}] ${message}`);
    if (isError && typeof acode !== "undefined" && acode.toast) {
      acode.toast(`Flutter: ${String(message).substring(0, 50)}`, 3000);
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
  
  static async createProject() {
    const projectDir = await editor.getProjectDir();
    if (!projectDir) {
      return { success: false, message: "❌ Please open a project directory first" };
    }
    return this.execute("flutter create .");
  }
  
  static async flutterfire() { 
    const res = await this.execute("dart pub global activate flutterfire_cli");
    return res.success ? this.execute("flutterfire configure") : res;
  }
  
  static firebaseDeploy = () => this.execute("flutter pub run flutterfire_cli:flutterfire deploy");
}

/* [PLUGIN UI SETUP] */
acode.on("initialize", () => {
  FlutterCompiler.init();
});

// Installation Welcome Message
acode.on("install", async () => {
  try {
    // Some Acode versions expect an array of labels and return an index.
    // Use a simple array of strings for maximum compatibility.
    const buttons = ["Get Started", "View Docs", "Donate"];
    const choiceIndex = await acode.confirm(
      "🎉 Flutter Compiler Installed!",
      `Transform your Android device into a Flutter development environment!
      
Need help? Check the documentation or support the project.`,
      buttons
    );

    // Normalize returned value: could be index (number) or string label
    let choice = null;
    if (typeof choiceIndex === "number") {
      choice = buttons[choiceIndex];
    } else if (typeof choiceIndex === "string") {
      // If older/newer versions return id or label, match against known labels
      choice = choiceIndex;
    }

    if (choice === "View Docs") {
      acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki");
    } else if (choice === "Donate") {
      acode.launchUrl("https://github.com/sponsors/mikaelkraft");
    } else {
      // default "Get Started" -> do nothing, just dismiss
    }
  } catch (e) {
    // If acode.confirm shape differs or throws, fail gracefully
    FlutterCompiler._log(`Install dialog failed: ${e && e.message ? e.message : e}`, true);
  }
});

// Unified Help & Support Menu
acode.setPluginMenu("❓ Help & Support", () => {
  // Ensure options passed are arrays of strings
  const supportOptions = [
    "📚 Documentation",
    "💖 Sponsor Development", 
    "🐛 Report Issues",
    "💬 Join Community"
  ];

  acode.showPicker(
    "Flutter Compiler - Support",
    supportOptions,
    (selected) => {
      try {
        // selected might be index (number) or label (string). Normalize.
        let selIndex = -1;
        if (typeof selected === "number") {
          selIndex = selected;
        } else if (typeof selected === "string") {
          selIndex = supportOptions.indexOf(selected);
        }

        const actions = {
          0: () => acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki"),
          1: () => {
            const donationOptions = [
              "GitHub Sponsors (Monthly)",
              "Buy Me a Coffee (One-time)", 
              "Copy Crypto Address (USDT on ERC20)"
            ];
            acode.showPicker("Support Options", donationOptions, (donationChoice) => {
              let dIndex = -1;
              if (typeof donationChoice === "number") {
                dIndex = donationChoice;
              } else if (typeof donationChoice === "string") {
                dIndex = donationOptions.indexOf(donationChoice);
              }
              const urls = {
                0: "https://github.com/sponsors/mikaelkraft",
                1: "https://ko-fi.com/mikaelkraft",
                2: "0x57ccCC13ba0aBF9Dc7f884E94875e73856160822"
              };
              if (dIndex === 2) {
                acode.setClipboard(urls[2]);
                acode.toast("USDT(ERC20) Wallet address copied!");
              } else if (dIndex === 0 || dIndex === 1) {
                acode.launchUrl(urls[dIndex]);
              }
            });
          },
          2: () => acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/issues"),
          3: () => acode.launchUrl("https://discord.gg/3pnGUqKg")
        };
        if (actions[selIndex]) {
          actions[selIndex]();
        }
      } catch (err) {
        FlutterCompiler._log(`Support picker handler error: ${err && err.message ? err.message : err}`, true);
      }
    }
  );
});

// Settings Menu
acode.setPluginMenu("⚙️ Settings", () => {
  const inputFields = [
    {
      label: "Debug Mode",
      type: "checkbox",
      checked: !!FlutterCompiler.config.debugMode
    }
  ];

  acode.showInputDialog("Compiler Settings", inputFields, async (values) => {
    try {
      // values may be an array or object depending on Acode version
      let debugVal = false;
      if (Array.isArray(values)) {
        debugVal = !!values[0];
      } else if (values && typeof values === "object" && "0" in values) {
        debugVal = !!values[0];
      } else if (typeof values === "boolean") {
        debugVal = values;
      }
      FlutterCompiler.config.debugMode = debugVal;
      await acode.setSecureConfig("flutter_compiler", JSON.stringify(FlutterCompiler.config));
      acode.toast("✅ Settings saved");
    } catch (e) {
      FlutterCompiler._log(`Settings save failed: ${e && e.message ? e.message : e}`, true);
      acode.toast("❌ Failed to save settings");
    }
  });
});

// Command Menu - FIXED: Proper array definition and iteration
const commandMenuItems = [
  { icon: "🆕", name: "Create Project", cmd: "createProject" },
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
];

// Proper iteration using for loop
for (let i = 0; i < commandMenuItems.length; i++) {
  const item = commandMenuItems[i];
  acode.setPluginMenu(`${item.icon} ${item.name}`, () => {
    FlutterCompiler[item.cmd]().then(res => {
      if (res && res.message) {
        acode.toast(res.message);
      } else {
        acode.toast("✅ Command finished");
      }
      if (res && res.error) {
        FlutterCompiler._log(`Error: ${res.error}`, true);
      }
    }).catch(error => {
      acode.toast(`❌ Failed: ${error && error.message ? error.message : error}`);
      FlutterCompiler._log(`Execution error: ${error}`, true);
    });
  });
}

// Add project validation on startup
acode.on("editorOpen", async () => {
  try {
    const projectDir = await editor.getProjectDir();
    if (projectDir) {
      const hasPubspec = await acode.exec(`[ -f "${projectDir}/pubspec.yaml" ] && echo "1"`);
      if (!hasPubspec) {
        acode.toast("⚠️ Not a Flutter project. Use 'Create Project' first.", 4000);
      }
    }
  } catch (e) {
    FlutterCompiler._log(`editorOpen handler error: ${e && e.message ? e.message : e}`, true);
  }
});