// Flutter Compiler for Acode
// By Mikael Kraft (@mikaelkraft)
// Version 1.0.1

class FlutterCompiler {
  // Configuration (Safe Defaults)
  static config = {
    cloudEnabled: true,
    cloudEndpoint: "https://flutter-compiler.mikaelkraft.deno.net/",
    apiKey: "f8a7dad00c84f93ebb4b4ebb48c7b0dce9b761dd0a4fde37e67c6d341a673bfd",
    termuxPath: "$HOME/flutter/bin",
    preferLocal: true,
    debugMode: false
  };

  /* [INITIALIZATION] */
  static async init() {
    // Load saved config
    const savedConfig = await acode.getSecureConfig("flutter_compiler");
    if (savedConfig) {
      this.config = { ...this.config, ...JSON.parse(savedConfig) };
    }
    
    // First-run setup
    const isFirstRun = !(await acode.exec(`[ -d "${this.config.termuxPath}" ] && echo "1"`));
    if (isFirstRun) {
      this._log("First run detected - installing Flutter");
      acode.toast("⚙️ Setting up Flutter for first use...");
      await this._installFlutter();
    }
  }

  static async _installFlutter() {
    const installCmd = `
      pkg update -y && 
      pkg install -y git wget openjdk-17 dart && 
      wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.22.2-stable.tar.xz && 
      tar xf flutter_linux_*.tar.xz && 
      echo 'export PATH="\\$PATH:\\$HOME/flutter/bin"' >> ~/.bashrc && 
      source ~/.bashrc
    `;
    
    await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${installCmd}"`);
    this._log("Flutter installation completed");
  }

  /* [CORE EXECUTION] */
  static async execute(command) {
    this._log(`Executing: ${command}`);
    
    if (this.config.preferLocal) {
      const localResult = await this._executeLocal(command);
      if (localResult.success) return localResult;
      this._log(`Local execution failed: ${localResult.message}`);
    }
    
    if (this.config.cloudEnabled) {
      return await this._executeCloud(command);
    }
    
    return {
      success: false,
      message: "❌ All execution methods failed"
    };
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
      return { success: true, message: `📱 Local: ${command.split(' ')[0]}` };
    } catch (e) {
      return { success: false, message: `❌ Local: ${e.message}` };
    }
  }

  /* [CLOUD EXECUTION] */
  static async _executeCloud(command) {
    try {
      const projectDir = await editor.getProjectDir();
      const projectId = await this._getProjectId(projectDir);
      
      const payload = {
        cmd: command,
        project: projectId,
        timestamp: Date.now()
      };

      this._log(`Sending to cloud: ${JSON.stringify(payload, null, 2)}`);
      
      const response = await fetch(this.config.cloudEndpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      this._log(`Cloud response: ${JSON.stringify(result, null, 2)}`);
      return result;
    } catch (e) {
      this._log(`Cloud error: ${e.message}`, true);
      return { success: false, message: `☁️ ${e.message}` };
    }
  }

  static async _getProjectId(projectDir) {
    try {
      const gitHash = await acode.exec(`cd ${projectDir} && git rev-parse HEAD 2>/dev/null`);
      return `git:${await acode.hash(gitHash)}`;
    } catch {
      return `local:${await acode.hash(Math.random().toString())}`;
    }
  }

  /* [LOGGING] */
  static _log(message, isError = false) {
    if (!this.config.debugMode) return;
    const logLine = `[FlutterCompiler] ${new Date().toISOString()} ${message}`;
    console.log(logLine);
    if (isError) acode.toast(`FLUTTER ERROR: ${message}`, 3000);
  }

  /* [FLUTTER COMMANDS] */
  static async doctor() { return this.execute("flutter doctor --no-upgrade"); }
  static async pubGet() { return this.execute("flutter pub get"); }
  static async buildApk() { return this.execute("flutter build apk --release"); }
  static async buildAppBundle() { return this.execute("flutter build appbundle"); }
  static async runApp() { return this.execute("flutter run"); }
  static async analyze() { return this.execute("dart analyze"); }
  static async format() { return this.execute("dart format ."); }
  static async test() { return this.execute("flutter test"); }
  static async clean() { return this.execute("flutter clean"); }
  static async repair() { return this.execute("flutter pub upgrade --major-versions"); }
  
  /* [FLUTTERFIRE COMMANDS] */
  static async flutterfire() { 
    const res = await this.execute("dart pub global activate flutterfire_cli");
    return res.success ? this.execute("flutterfire configure") : res;
  }
  
  static async firebaseDeploy() {
    return this.execute("flutter pub run flutterfire_cli:flutterfire deploy");
  }
}

/* [PLUGIN UI SETUP] */
// Initialize
acode.on("initialize", async () => {
  await FlutterCompiler.init();
});

// Settings Menu
acode.setPluginMenu("⚙️ Settings", () => {
  acode.showInputDialog("Compiler Configuration", [
    {
      label: "Cloud Endpoint URL",
      type: "text",
      value: FlutterCompiler.config.cloudEndpoint
    },
    {
      label: "Enable Cloud",
      type: "checkbox",
      checked: FlutterCompiler.config.cloudEnabled
    },
    {
      label: "Prefer Local Execution",
      type: "checkbox",
      checked: FlutterCompiler.config.preferLocal
    },
    {
      label: "Debug Mode",
      type: "checkbox",
      checked: FlutterCompiler.config.debugMode
    }
  ], async (values) => {
    FlutterCompiler.config.cloudEndpoint = values[0];
    FlutterCompiler.config.cloudEnabled = values[1];
    FlutterCompiler.config.preferLocal = values[2];
    FlutterCompiler.config.debugMode = values[3];
    await acode.setSecureConfig("flutter_compiler", JSON.stringify(FlutterCompiler.config));
    acode.toast("✅ Settings saved");
  });
});

// Full Command Menu
const commandMenu = [
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

commandMenu.forEach(({icon, name, cmd}) => {
  acode.setPluginMenu(`${icon} ${name}`, () => 
    FlutterCompiler[cmd]().then(res => acode.toast(res.message))
});