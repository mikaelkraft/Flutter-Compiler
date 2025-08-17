// Flutter Compiler for Acode
// By Mikael Kraft (@mikaelkraft)
// Version 1.0.1

// Improved Environment Configuration
const ENV_CONFIG = (() => {
  const token = Deno.env.get("AUTH_TOKEN");
  if (!token && typeof acode !== 'undefined') {
    acode.toast("⚠️ AUTH_TOKEN not set - cloud features disabled", 3000);
  }
  return {
    AUTH_TOKEN: token,
    CLOUD_ENDPOINT: "https://flutter-compiler.mikaelkraft.deno.net/"
  };
})();

class FlutterCompiler {
  // Configuration with better defaults handling
  static config = {
    cloudEnabled: Boolean(ENV_CONFIG.AUTH_TOKEN),
    cloudEndpoint: ENV_CONFIG.CLOUD_ENDPOINT,
    apiKey: ENV_CONFIG.AUTH_TOKEN,
    termuxPath: "$HOME/flutter/bin",
    preferLocal: true,
    debugMode: false
  };

  /* [INITIALIZATION] */
  static async init() {
    try {
      const savedConfig = await acode.getSecureConfig("flutter_compiler");
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
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
    
    if (this.config.preferLocal) {
      const localResult = await this._executeLocal(command);
      if (localResult.success) return localResult;
      this._log(`Local execution failed: ${localResult.message}`);
    }
    
    if (this.config.cloudEnabled) {
      try {
        return await this._executeCloud(command);
      } catch (e) {
        this._log(`Cloud execution failed: ${e.message}`);
      }
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
      return { 
        success: true, 
        message: `📱 Local: ${command.split(' ')[0]}` 
      };
    } catch (e) {
      return { 
        success: false, 
        message: `❌ Local: ${e.message}` 
      };
    }
  }

  /* [CLOUD EXECUTION] - Improved with timeout */
  static async _executeCloud(command, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const projectDir = await editor.getProjectDir();
      const payload = {
        cmd: command,
        project: await this._getProjectId(projectDir),
        timestamp: Date.now()
      };

      this._log(`Cloud request: ${command}`);
      
      const response = await fetch(this.config.cloudEndpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
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

  /* [LOGGING] - Enhanced */
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

/* [PLUGIN UI] */
acode.on("initialize", FlutterCompiler.init);

// Settings Menu
acode.setPluginMenu("⚙️ Settings", () => {
  acode.showInputDialog("Compiler Settings", [
    { label: "Cloud Endpoint", type: "text", value: FlutterCompiler.config.cloudEndpoint },
    { label: "Enable Cloud", type: "checkbox", checked: FlutterCompiler.config.cloudEnabled },
    { label: "Prefer Local", type: "checkbox", checked: FlutterCompiler.config.preferLocal },
    { label: "Debug Mode", type: "checkbox", checked: FlutterCompiler.config.debugMode }
  ], async (values) => {
    FlutterCompiler.config = { 
      ...FlutterCompiler.config,
      cloudEndpoint: values[0],
      cloudEnabled: values[1],
      preferLocal: values[2],
      debugMode: values[3]
    };
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