// Flutter Compiler for Acode - Local Only Version (Acode Plugin Format)
// By Mikael Kraft (@mikaelkraft)
// Version 1.0.9

module.exports = {
  /** Called once when plugin is loaded */
  async init(acode) {
    // FlutterCompiler logic as a closure (not static class)
    const config = {
      termuxPath: "$HOME/flutter/bin",
      preferLocal: true,
      debugMode: false
    };

    async function getProjectDir() {
      if (typeof editor !== "undefined" && editor.getProjectDir) {
        return await editor.getProjectDir();
      }
      if (acode.editor && acode.editor.getProjectDir) {
        return await acode.editor.getProjectDir();
      }
      return null;
    }

    async function getSecureConfig(key) {
      if (acode.getSecureConfig) return await acode.getSecureConfig(key);
      return null;
    }
    async function setSecureConfig(key, value) {
      if (acode.setSecureConfig) return await acode.setSecureConfig(key, value);
    }

    function log(message, isError = false) {
      if (!config.debugMode) return;
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[Flutter][${timestamp}] ${message}`);
      if (isError && acode.toast) {
        acode.toast(`Flutter: ${String(message).substring(0, 50)}`, 3000);
      }
    }

    // Initialization logic
    async function initialize() {
      try {
        const savedConfig = await getSecureConfig("flutter_compiler");
        if (savedConfig) {
          try {
            const parsed = JSON.parse(savedConfig);
            Object.assign(config, parsed, { preferLocal: true });
          } catch (e) {
            log(`Saved config parse failed: ${e.message}`, true);
          }
        }
        if (!(await checkFlutterExists())) {
          await installFlutter();
        }
      } catch (e) {
        log(`Initialization failed: ${e && e.message ? e.message : e}`, true);
      }
    }

    async function checkFlutterExists() {
      try {
        const res = await acode.exec(`[ -d "${config.termuxPath}" ] && echo "1"`);
        return !!res && String(res).trim() === "1";
      } catch {
        return false;
      }
    }

    async function installFlutter() {
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
        log("Flutter installation completed");
      } catch (e) {
        log(`Installation failed: ${e && e.message ? e.message : e}`, true);
        throw e;
      }
    }

    async function execute(command) {
      log(`Executing: ${command}`);
      return await executeLocal(command);
    }

    async function executeLocal(command) {
      try {
        const projectDir = await getProjectDir();
        if (!projectDir) {
          return { success: false, message: "❌ No project directory found. Please open a project first." };
        }
        const hasPubspec = await acode.exec(`[ -f "${projectDir}/pubspec.yaml" ] && echo "1"`);
        if (!hasPubspec && !command.includes("create")) {
          return { success: false, message: "❌ Not a Flutter project. Run 'flutter create .' first." };
        }
        const termuxCmd = `
          cd ${projectDir} &&
          export PATH="$PATH:${config.termuxPath}" &&
          ${command}
        `;
        let result;
        try {
          result = await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${encodeURIComponent(termuxCmd)}"`);
        } catch (apiError) {
          log("Termux:API not available, using fallback", true);
          result = await acode.exec(`termux-exec ${termuxCmd}`);
        }
        return { success: true, message: `📱 Running in ${projectDir.split('/').pop()}`, output: result };
      } catch (e) {
        return { success: false, message: `❌ ${e && e.message ? e.message : e}`, error: e ? e.toString() : String(e) };
      }
    }

    // Command shortcuts
    const commands = {
      doctor: () => execute("flutter doctor --no-upgrade"),
      pubGet: () => execute("flutter pub get"),
      buildApk: () => execute("flutter build apk --release"),
      buildAppBundle: () => execute("flutter build appbundle"),
      runApp: () => execute("flutter run"),
      analyze: () => execute("dart analyze"),
      format: () => execute("dart format ."),
      test: () => execute("flutter test"),
      clean: () => execute("flutter clean"),
      repair: () => execute("flutter pub upgrade --major-versions"),
      createProject: async () => {
        const projectDir = await getProjectDir();
        if (!projectDir) {
          return { success: false, message: "❌ Please open a project directory first" };
        }
        return execute("flutter create .");
      },
      flutterfire: async () => {
        const res = await execute("dart pub global activate flutterfire_cli");
        return res.success ? execute("flutterfire configure") : res;
      },
      firebaseDeploy: () => execute("flutter pub run flutterfire_cli:flutterfire deploy")
    };

    // Menu registration (Acode format)
    acode.setPluginMenu("❓ Help & Support", () => {
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
            3: () => acode.launchUrl("https://discord.gg/UPJGA6sTvh")
          };
          if (actions[selIndex]) {
            actions[selIndex]();
          }
        }
      );
    });

    acode.setPluginMenu("📑 Changelog", () => {
      acode.openFile("CHANGELOG.md");
    });

    acode.setPluginMenu("⚙️ Settings", () => {
      const inputFields = [
        {
          label: "Debug Mode",
          type: "checkbox",
          checked: !!config.debugMode
        }
      ];
      acode.showInputDialog("Compiler Settings", inputFields, async (values) => {
        try {
          let debugVal = false;
          if (Array.isArray(values)) {
            debugVal = !!values[0];
          } else if (values && typeof values === "object" && "0" in values) {
            debugVal = !!values[0];
          } else if (typeof values === "boolean") {
            debugVal = values;
          }
          config.debugMode = debugVal;
          await setSecureConfig("flutter_compiler", JSON.stringify(config));
          acode.toast("✅ Settings saved");
        } catch (e) {
          log(`Settings save failed: ${e && e.message ? e.message : e}`, true);
          acode.toast("❌ Failed to save settings");
        }
      });
    });

    // Command Menus
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
    for (let i = 0; i < commandMenuItems.length; i++) {
      const item = commandMenuItems[i];
      acode.setPluginMenu(`${item.icon} ${item.name}`, () => {
        commands[item.cmd]().then(res => {
          if (res && res.message) {
            acode.toast(res.message);
          } else {
            acode.toast("✅ Command finished");
          }
          if (res && res.error) {
            log(`Error: ${res.error}`, true);
          }
        }).catch(error => {
          acode.toast(`❌ Failed: ${error && error.message ? error.message : error}`);
          log(`Execution error: ${error}`, true);
        });
      });
    }

    // Project Validation on Startup (optional)
    if (acode.on) {
      acode.on("editorOpen", async () => {
        try {
          const projectDir = await getProjectDir();
          if (projectDir) {
            const hasPubspec = await acode.exec(`[ -f "${projectDir}/pubspec.yaml" ] && echo "1"`);
            if (!hasPubspec) {
              acode.toast("⚠️ Not a Flutter project. Use 'Create Project' first.", 4000);
            }
          }
        } catch (e) {
          log(`editorOpen handler error: ${e && e.message ? e.message : e}`, true);
        }
      });
    }

    // Do initialization
    await initialize();

    // Install dialog
    if (acode.on) {
      acode.on("install", async () => {
        try {
          const buttons = ["Get Started", "View Docs", "Donate"];
          const choiceIndex = await acode.confirm(
            "🎉 Flutter Compiler Installed!",
            `Transform your Android device into a Flutter development environment!
            
Need help? Check the documentation or support the project.`,
            buttons
          );
          let choice = null;
          if (typeof choiceIndex === "number") {
            choice = buttons[choiceIndex];
          } else if (typeof choiceIndex === "string") {
            choice = choiceIndex;
          }
          if (choice === "View Docs") {
            acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki");
          } else if (choice === "Donate") {
            acode.launchUrl("https://github.com/sponsors/mikaelkraft");
          }
        } catch (e) {
          log(`Install dialog failed: ${e && e.message ? e.message : e}`, true);
        }
      });
    }
  },

  /** Called when plugin is uninstalled */
  destroy() {
    // Cleanup if necessary
  }
};
