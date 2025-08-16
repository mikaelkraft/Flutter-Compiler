// Flutter Compiler Plugin for Acode
// By Mikael Kraft (@mikaelkraft)

class FlutterTools {
  static async runCommand(command) {
    try {
      const projectDir = await editor.getProjectDir();
      const termuxCmd = `
        cd ${projectDir} &&
        [ ! -d "$HOME/flutter" ] && ./termux_install.sh ||
        export PATH="$PATH:$HOME/flutter/bin" &&
        ${command}
      `;
      
      await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${termuxCmd}"`);
      return { success: true, message: `✅ ${command} executed` };
    } catch (e) {
      return { success: false, message: `❌ ${command} failed: ${e.message}` };
    }
  }

  // Core Flutter Commands
  static async doctor() {
    return this.runCommand("flutter doctor");
  }

  static async pubGet() {
    return this.runCommand("flutter pub get");
  }

  static async buildApk() {
    return this.runCommand("flutter build apk --release");
  }

  static async buildAppBundle() {
    return this.runCommand("flutter build appbundle");
  }

  static async runApp() {
    return this.runCommand("flutter run");
  }

  // Dart Commands
  static async analyze() {
    return this.runCommand("dart analyze");
  }

  static async formatCode() {
    return this.runCommand("dart format .");
  }

  static async runTests() {
    return this.runCommand("flutter test");
  }

  // FlutterFire Setup
  static async installFlutterFire() {
    const res = await this.runCommand("dart pub global activate flutterfire_cli");
    if (res.success) {
      return this.runCommand("flutterfire configure");
    }
    return res;
  }

  // Firebase Tools
  static async deployToFirebase() {
    return this.runCommand("flutter pub run flutterfire_cli:flutterfire deploy");
  }

  // Clean/Repair
  static async cleanProject() {
    return this.runCommand("flutter clean");
  }

  static async repairPackages() {
    return this.runCommand("flutter pub upgrade --major-versions");
  }
}

// Plugin UI Setup
acode.setPluginMenu("🩺 Flutter Doctor", () => FlutterTools.doctor().then(res => acode.toast(res.message)));
acode.setPluginMenu("📦 Pub Get", () => FlutterTools.pubGet().then(res => acode.toast(res.message)));
acode.setPluginMenu("🚀 Run App", () => FlutterTools.runApp().then(res => acode.toast(res.message)));
acode.setPluginMenu("🔧 Build APK", () => FlutterTools.buildApk().then(res => acode.toast(res.message)));
acode.setPluginMenu("📦 Build AppBundle", () => FlutterTools.buildAppBundle().then(res => acode.toast(res.message)));
acode.setPluginMenu("🔥 FlutterFire Setup", () => FlutterTools.installFlutterFire().then(res => acode.toast(res.message)));
acode.setPluginMenu("☁️ Firebase Deploy", () => FlutterTools.deployToFirebase().then(res => acode.toast(res.message)));
acode.setPluginMenu("🧹 Clean Project", () => FlutterTools.cleanProject().then(res => acode.toast(res.message)));
acode.setPluginMenu("🔄 Repair Packages", () => FlutterTools.repairPackages().then(res => acode.toast(res.message)));
acode.setPluginMenu("🔍 Code Analysis", () => FlutterTools.analyze().then(res => acode.toast(res.message)));
acode.setPluginMenu("✨ Format Code", () => FlutterTools.formatCode().then(res => acode.toast(res.message)));
acode.setPluginMenu("🧪 Run Tests", () => FlutterTools.runTests().then(res => acode.toast(res.message)));

// Initialize Flutter on first run
acode.on("initialize", async () => {
  const hasFlutter = await acode.exec('[ -d "$HOME/flutter" ] && echo "1"');
  if (!hasFlutter) {
    acode.toast("⚙️ First-time setup: Flutter will be installed automatically");
  }
});