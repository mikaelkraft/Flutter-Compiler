// Flutter Compiler for Acode - Enhanced UX Edition
// By Mikael Kraft (@mikaelkraft)
// Version 1.1.0

module.exports = {
  async init(acode) {
    // --- Config ---
    const config = {
      termuxPath: "$HOME/flutter/bin",
      debugMode: false,
      theme: "default" // "neural", "neon", "default"
    };

    // --- Themes ---
    const themes = {
      default: { name: "Default", accent: "#2196f3", bg: "#232323", fg: "#fafafa" },
      neural:  { name: "Neural Futuristic", accent: "#3fffa3", bg: "#181826", fg: "#b0ffef" },
      neon:    { name: "Neon Night", accent: "#ff00cc", bg: "#1a0033", fg: "#ffeeff" }
    };

    // --- Utilities ---
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
    function applyTheme(themeKey) {
      const t = themes[themeKey] || themes["default"];
      if (acode.applyTheme) {
        acode.applyTheme({
          accent: t.accent,
          background: t.bg,
          foreground: t.fg,
          name: t.name,
        });
      } else {
        document.documentElement.style.setProperty("--accent", t.accent);
        document.documentElement.style.setProperty("--background", t.bg);
        document.documentElement.style.setProperty("--foreground", t.fg);
      }
      config.theme = themeKey;
    }

    // --- Loader ---
    function showLoader(msg = "Processing...") {
      if (acode.showLoader) return acode.showLoader(msg);
      const loader = document.createElement("div");
      loader.textContent = msg;
      loader.style = "position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);color:#fff;background:#333;padding:2em 3em;border-radius:1em;box-shadow:0 0 40px #2196f3;z-index:9999;font-size:1.3em;";
      loader.id = "flutter-loader";
      document.body.appendChild(loader);
      return () => { document.body.removeChild(loader); };
    }

    // --- Notification ---
    function showNotification(title, message, actions) {
      if (acode.showNotification) {
        acode.showNotification(title, message, actions);
      } else {
        acode.toast(`[${title}] ${message}`, 4000);
      }
    }

    // --- Command shortcuts ---
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
      createProject: async (opts) => {
        const projectDir = await getProjectDir();
        if (!projectDir) {
          acode.toast("❌ Please open a project directory first");
          return;
        }
        let cmd = "flutter create .";
        if (opts && opts.lang) cmd += ` --project-language=${opts.lang}`;
        if (opts && opts.platforms) cmd += ` --platforms=${opts.platforms}`;
        await execute(cmd);
      },
      flutterfire: async () => {
        const res = await execute("dart pub global activate flutterfire_cli");
        if (res && res.success) await execute("flutterfire configure");
      },
      firebaseDeploy: () => execute("flutter pub run flutterfire_cli:flutterfire deploy")
    };

    // --- Menus: Register IMMEDIATELY so plugin always appears! ---
    acode.setPluginMenu("🆕 Create Project (Dialog)", showCustomProjectDialog);
    acode.setPluginMenu("🩺 Flutter Doctor", commands.doctor);
    acode.setPluginMenu("📦 Pub Get", commands.pubGet);
    acode.setPluginMenu("🚀 Run App", commands.runApp);
    acode.setPluginMenu("🔧 Build APK", commands.buildApk);
    acode.setPluginMenu("📦 Build AppBundle", commands.buildAppBundle);
    acode.setPluginMenu("🔥 FlutterFire Setup", commands.flutterfire);
    acode.setPluginMenu("☁️ Firebase Deploy", commands.firebaseDeploy);
    acode.setPluginMenu("🧹 Clean Project", commands.clean);
    acode.setPluginMenu("🔄 Repair Packages", commands.repair);
    acode.setPluginMenu("🔍 Code Analysis", commands.analyze);
    acode.setPluginMenu("✨ Format Code", commands.format);
    acode.setPluginMenu("🧪 Run Tests", commands.test);

    acode.setPluginMenu("💡 Theme Switcher", () => {
      acode.showPicker("Choose Plugin Theme", Object.keys(themes).map(k => themes[k].name), idx => {
        const selectedKey = Object.keys(themes)[idx];
        applyTheme(selectedKey);
        setSecureConfig("flutter_compiler", JSON.stringify(config));
        acode.toast(`Theme set: ${themes[selectedKey].name}`);
      });
    });

    acode.setPluginMenu("📑 Changelog", () => acode.openFile("CHANGELOG.md"));

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
        selIndex => {
          const actions = {
            0: () => acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki"),
            1: () => {
              const donationOptions = [
                "GitHub Sponsors (Monthly)",
                "Buy Me a Coffee (One-time)",
                "Copy Crypto Address (USDT on ERC20)"
              ];
              acode.showPicker("Support Options", donationOptions, dIndex => {
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
          if (actions[selIndex]) actions[selIndex]();
        }
      );
    });

    acode.setPluginMenu("⚙️ Settings", () => {
      acode.showInputDialog("Compiler Settings", [
        { label: "Debug Mode", type: "checkbox", checked: !!config.debugMode },
        { label: "Flutter SDK Path", type: "text", value: config.termuxPath }
      ], async values => {
        config.debugMode = !!values[0];
        config.termuxPath = values[1] || config.termuxPath;
        await setSecureConfig("flutter_compiler", JSON.stringify(config));
        acode.toast("✅ Settings saved");
      });
    });

    // --- Custom dialog for project creation ---
    function showCustomProjectDialog() {
      if (acode.showCustomDialog) {
        acode.showCustomDialog({
          title: "🆕 Create Flutter Project",
          html: `
            <div style="padding:1em">
              <label>Project Language:</label>
              <select id="proj-lang">
                <option value="dart">Dart</option>
                <option value="kotlin">Kotlin (Android)</option>
                <option value="swift">Swift (iOS)</option>
              </select>
              <br><br>
              <label>Platforms:</label>
              <input type="text" id="proj-platforms" placeholder="android,ios,web" value="android,ios">
              <br><br>
              <button id="proj-create-btn">Create</button>
            </div>
          `,
          onLoad(dialog) {
            dialog.querySelector("#proj-create-btn").onclick = async () => {
              const lang = dialog.querySelector("#proj-lang").value;
              const platforms = dialog.querySelector("#proj-platforms").value;
              dialog.close();
              await commands.createProject({ lang, platforms });
            };
          }
        });
      } else {
        acode.showInputDialog("Create Flutter Project", [
          { label: "Project Language", type: "select", options: ["dart", "kotlin", "swift"], value: "dart" },
          { label: "Platforms (comma separated)", type: "text", value: "android,ios" }
        ], async values => {
          await commands.createProject({ lang: values[0], platforms: values[1] });
        });
      }
    }

    // --- Initialization after menus are registered: ensures plugin always appears ---
    setTimeout(async () => {
      try {
        const savedConfig = await getSecureConfig("flutter_compiler");
        if (savedConfig) {
          try {
            const parsed = JSON.parse(savedConfig);
            Object.assign(config, parsed);
          } catch (e) {
            log(`Saved config parse failed: ${e.message}`, true);
          }
        }
        applyTheme(config.theme || "default");
        if (!(await checkFlutterExists())) {
          const hideLoader = showLoader("Installing Flutter SDK...");
          await installFlutter();
          hideLoader && hideLoader();
          showNotification("Flutter SDK", "Installation complete", [
            { text: "Doctor", onclick: commands.doctor }
          ]);
        }
      } catch (e) {
        log(`Initialization failed: ${e && e.message ? e.message : e}`, true);
      }
    }, 0);

    // --- Project Validation ---
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

    // --- Install dialog ---
    if (acode.on) {
      acode.on("install", async () => {
        try {
          if (acode.showCustomDialog) {
            acode.showCustomDialog({
              title: "🎉 Flutter Compiler Installed!",
              html: `
                <div style="padding:1em">
                  <b>Transform your Android device into a Flutter dev environment!</b><br>
                  <small>Need help? Check <a href="https://github.com/mikaelkraft/Flutter-Compiler/wiki" target="_blank">documentation</a> or <a href="https://github.com/sponsors/mikaelkraft" target="_blank">support</a> the project.</small>
                  <br><br>
                  <button id="doc-btn">View Docs</button>
                  <button id="donate-btn">Donate</button>
                </div>
              `,
              onLoad(dialog) {
                dialog.querySelector("#doc-btn").onclick = () => acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki");
                dialog.querySelector("#donate-btn").onclick = () => acode.launchUrl("https://github.com/sponsors/mikaelkraft");
              }
            });
          } else {
            acode.toast("🎉 Flutter Compiler Installed! See docs for help.");
          }
        } catch (e) {
          log(`Install dialog failed: ${e && e.message ? e.message : e}`, true);
        }
      });
    }

    // --- Core command execution ---
    async function execute(command) {
      log(`Executing: ${command}`);
      const hideLoader = showLoader("Running command...");
      try {
        const res = await executeLocal(command);
        hideLoader && hideLoader();
        showNotification("Command Finished", res.message || "Done", [
          { text: "View Output", onclick: () => acode.showMessage(res.output || "No output") }
        ]);
        return res;
      } catch (err) {
        hideLoader && hideLoader();
        acode.toast("❌ Command failed");
        throw err;
      }
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
  },

  destroy() {
    // Cleanup if necessary
  }
};
