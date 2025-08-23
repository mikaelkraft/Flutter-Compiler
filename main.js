// Flutter Compiler for Acode - Local Only Version
// By Mikael Kraft (@mikaelkraft)
// Version 1.0.9 (patched for command palette integration, removed UI/menu rendering)

acode.setPluginInit('com.mikaelkraft.fluttercompiler', (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
  class FlutterCompiler {
      static config = {
        termuxPath: "$HOME/flutter/bin",
        preferLocal: true,
        debugMode: false,
        useTermuxAPI: true,
        isFirstRun: true
      };

      static async init() {
        try {
          const savedConfig = await acode.getSecureConfig("flutter_compiler");
          if (savedConfig) {
            try {
              const parsed = JSON.parse(savedConfig);
              this.config = { ...this.config, ...parsed, preferLocal: true };
            } catch (e) {
              this._log(`Saved config parse failed: ${e.message}`, true);
            }
          }
          if (this.config.isFirstRun) {
            await this._showInstallDialog();
            this.config.isFirstRun = false;
            await acode.setSecureConfig("flutter_compiler", JSON.stringify(this.config));
          }
          this._setupCommands();
          this._log("Initialization completed");
          acode.toast("\u2705 Flutter Compiler ready. Use Ctrl+P to search commands or open the UI from the sidebar.", 5000);
          FlutterCompiler.showUI();
        } catch (e) {
          this._log(`Initialization failed: ${e && e.message ? e.message : e}`, true);
          acode.toast("\u274c Plugin initialization failed. Check prerequisites.", 5000);
        }
      }

      static async _showInstallDialog() {
        try {
          const buttons = ["Get Started", "View Docs", "Donate"];
          const choiceIndex = await acode.confirm(
            "\ud83c\udf89 Flutter Compiler Installed!",
            `Transform your Android device into a Flutter development environment!\n\nNeed help? Check the documentation or support the project.`,
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
          this._log(`Install dialog failed: ${e && e.message ? e.message : e}`, true);
        }
      }

      static _setupCommands() {
        const commands = [
          { name: "Flutter Create Project", description: "Initialize new Flutter project", exec: () => this.createProject() },
          { name: "Flutter Doctor", description: "Verify installation", exec: () => this.doctor() },
          { name: "Flutter Pub Get", description: "Install dependencies", exec: () => this.pubGet() },
          { name: "Flutter Run App", description: "Launch on connected device", exec: () => this.runApp() },
          { name: "Flutter Build APK", description: "Generate release APK", exec: () => this.buildApk() },
          { name: "Flutter Build AppBundle", description: "Generate Play Store bundle", exec: () => this.buildAppBundle() },
          { name: "Flutter FlutterFire Setup", description: "Configure Firebase", exec: () => this.flutterfire() },
          { name: "Flutter Firebase Deploy", description: "Deploy to Firebase", exec: () => this.firebaseDeploy() },
          { name: "Flutter Clean Project", description: "Remove build files", exec: () => this.clean() },
          { name: "Flutter Repair Packages", description: "Fix dependency issues", exec: () => this.repair() },
          { name: "Flutter Code Analysis", description: "Check for errors", exec: () => this.analyze() },
          { name: "Flutter Format Code", description: "Format Dart code", exec: () => this.format() },
          { name: "Flutter Run Tests", description: "Execute test suite", exec: () => this.test() }
        ];

        commands.forEach(cmd => {
          acode.addCommand({
            name: cmd.name,
            description: cmd.description,
            bindKey: { win: null, mac: null },
            exec: async () => {
              try {
                const res = await cmd.exec();
                if (res && res.message) acode.toast(res.message);
                else acode.toast("\u2705 Command finished");
                if (res && res.error) this._log(`Error: ${res.error}`, true);
              } catch (error) {
                acode.toast(`\u274c Failed: ${error && error.message ? error.message : error}`);
                this._log(`Execution error: ${error}`, true);
              }
            }
          });
        });

        // Add sidebar command to open the UI
        acode.addCommand({
          name: "Flutter Compiler UI",
          description: "Open the Flutter Compiler control panel",
          bindKey: { win: null, mac: null },
          exec: () => FlutterCompiler.showUI()
        });

        acode.addCommand({
          name: "Flutter Help & Support",
          description: "Access documentation and support",
          bindKey: { win: null, mac: null },
          exec: async () => {
            try {
              const supportOptions = [
                "📚 Documentation",
                "💖 Sponsor Development", 
                "🐛 Report Issues",
                "💬 Join Community"
              ];
              const selected = await acode.prompt("Flutter Compiler - Support", supportOptions, "select");
              let selIndex = -1;
              if (typeof selected === "number") selIndex = selected;
              else if (typeof selected === "string") selIndex = supportOptions.indexOf(selected);
              const actions = {
                0: () => acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki"),
                1: () => {
                  const donationOptions = ["GitHub Sponsors (Monthly)", "Buy Me a Coffee (One-time)", "Copy Crypto Address (USDT on ERC20)"];
                  acode.prompt("Support Options", donationOptions, "select").then(donationChoice => {
                    let dIndex = -1;
                    if (typeof donationChoice === "number") dIndex = donationChoice;
                    else if (typeof donationChoice === "string") dIndex = donationOptions.indexOf(donationChoice);
                    const urls = {
                      0: "https://github.com/sponsors/mikaelkraft",
                      1: "https://ko-fi.com/mikaelkraft",
                      2: "0x57ccCC13ba0aBF9Dc7f884E94875e73856160822"
                    };
                    if (dIndex === 2) {
                      acode.setClipboard(urls[2]);
                      acode.toast("USDT(ERC20) Wallet address copied!");
                    } else if (dIndex === 0 || dIndex === 1) acode.launchUrl(urls[dIndex]);
                  });
                },
                2: () => acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/issues"),
                3: () => acode.launchUrl("https://discord.gg/3pnGUqKg")
              };
              if (actions[selIndex]) actions[selIndex]();
            } catch (err) {
              this._log(`Support handler error: ${err && err.message ? err.message : err}`, true);
            }
          }
        });

        acode.addCommand({
          name: "Flutter Compiler Settings",
          description: "Configure Flutter Compiler plugin",
          bindKey: { win: null, mac: null },
          exec: async () => {
            try {
              const inputFields = [
                {
                  label: "Debug Mode",
                  type: "checkbox",
                  checked: !!this.config.debugMode
                }
              ];
              const values = await acode.prompt("Compiler Settings", inputFields, "checkbox");
              let debugVal = false;
              if (Array.isArray(values)) debugVal = !!values[0];
              else if (values && typeof values === "object" && "0" in values) debugVal = !!values[0];
              else if (typeof values === "boolean") debugVal = values;
              this.config.debugMode = debugVal;
              await acode.setSecureConfig("flutter_compiler", JSON.stringify(this.config));
              acode.toast("✅ Settings saved");
            } catch (e) {
              this._log(`Settings save failed: ${e && e.message ? e.message : e}`, true);
              acode.toast("❌ Failed to save settings");
            }
          }
        });
      }

      static showUI() {
        $page.show(
          `<div style="padding:16px;max-width:400px;margin:auto;">
            <h2 style="text-align:center;">Flutter Compiler</h2>
            <button id="fc-create" style="width:100%;margin:8px 0;">Create Project</button>
            <button id="fc-doctor" style="width:100%;margin:8px 0;">Flutter Doctor</button>
            <button id="fc-pubget" style="width:100%;margin:8px 0;">Pub Get</button>
            <button id="fc-run" style="width:100%;margin:8px 0;">Run App</button>
            <button id="fc-buildapk" style="width:100%;margin:8px 0;">Build APK</button>
            <button id="fc-buildbundle" style="width:100%;margin:8px 0;">Build AppBundle</button>
            <button id="fc-flutterfire" style="width:100%;margin:8px 0;">FlutterFire Setup</button>
            <button id="fc-firebase" style="width:100%;margin:8px 0;">Firebase Deploy</button>
            <button id="fc-clean" style="width:100%;margin:8px 0;">Clean Project</button>
            <button id="fc-repair" style="width:100%;margin:8px 0;">Repair Packages</button>
            <button id="fc-analyze" style="width:100%;margin:8px 0;">Code Analysis</button>
            <button id="fc-format" style="width:100%;margin:8px 0;">Format Code</button>
            <button id="fc-test" style="width:100%;margin:8px 0;">Run Tests</button>
          </div>`,
          {
            onshow() {
              const bind = (id, fn) => {
                const el = document.getElementById(id);
                if (el) el.onclick = async () => {
                  el.disabled = true;
                  el.textContent = 'Running...';
                  try {
                    const res = await fn();
                    acode.toast(res && res.message ? res.message : 'Done');
                  } catch (e) {
                    acode.toast('Error: ' + (e && e.message ? e.message : e));
                  }
                  el.disabled = false;
                  el.textContent = el.getAttribute('data-label') || el.textContent;
                };
                if (el) el.setAttribute('data-label', el.textContent);
              };
              bind('fc-create', FlutterCompiler.createProject);
              bind('fc-doctor', FlutterCompiler.doctor);
              bind('fc-pubget', FlutterCompiler.pubGet);
              bind('fc-run', FlutterCompiler.runApp);
              bind('fc-buildapk', FlutterCompiler.buildApk);
              bind('fc-buildbundle', FlutterCompiler.buildAppBundle);
              bind('fc-flutterfire', FlutterCompiler.flutterfire);
              bind('fc-firebase', FlutterCompiler.firebaseDeploy);
              bind('fc-clean', FlutterCompiler.clean);
              bind('fc-repair', FlutterCompiler.repair);
              bind('fc-analyze', FlutterCompiler.analyze);
              bind('fc-format', FlutterCompiler.format);
              bind('fc-test', FlutterCompiler.test);
            }
          }
        );
      }

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
          return { success: false, message: "\u274c Please open a project directory first" };
        }
        return this.execute("flutter create .");
      }
      static async flutterfire() {
        const res = await this.execute("dart pub global activate flutterfire_cli");
        return res.success ? this.execute("flutterfire configure") : res;
      }
      static firebaseDeploy = () => this.execute("flutter pub run flutterfire_cli:flutterfire deploy");

      static async execute(command) {
        this._log(`Executing: ${command}`);
        try {
          const hasTermuxAPI = await this._checkTermuxAPI();
          this.config.useTermuxAPI = hasTermuxAPI;
          if (!(await this._checkFlutterExists())) {
            await this._installFlutter();
          }
          return await this._executeLocal(command);
        } catch (e) {
          this._log(`Execution failed: ${e && e.message ? e.message : e}`, true);
          return { success: false, message: `\u274c ${e && e.message ? e.message : e}` };
        }
      }

      static async _checkTermuxAPI() {
        try {
          const res = await acode.exec("pm list packages | grep com.termux.api");
          return !!res && res.includes("com.termux.api");
        } catch {
          return false;
        }
      }

      static async _checkFlutterExists() {
        try {
          const res = await acode.exec(`[ -d "${this.config.termuxPath}" ] && echo "1"`);
          return !!res && String(res).trim() === "1";
        } catch {
          return false;
        }
      }

      static async _installFlutter() {
        const INSTALL_CMD = `
          pkg update -y && 
          pkg install -y git wget openjdk-17 dart cmake ninja clang && 
          wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.35.1-stable.tar.xz && 
          tar xf flutter_linux_*.tar.xz && 
          echo 'export PATH="\$PATH:\$HOME/flutter/bin"' >> ~/.bashrc && 
          source ~/.bashrc
        `;
        try {
          this._log("Starting Flutter installation");
          acode.toast("\u2699\ufe0f Setting up Flutter...");
          if (this.config.useTermuxAPI) {
            await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${encodeURIComponent(INSTALL_CMD)}"`);
          } else {
            await acode.exec(INSTALL_CMD);
          }
          this._log("Flutter installation completed");
          acode.toast("\u2705 Flutter installed. Restart Acode if needed.", 5000);
        } catch (e) {
          this._log(`Installation failed: ${e && e.message ? e.message : e}`, true);
          acode.toast("\u274c Flutter installation failed. Check Termux or run manually.", 5000);
          throw e;
        }
      }

      static async _executeLocal(command) {
        try {
          const projectDir = await editor.getProjectDir();
          if (!projectDir) {
            return { success: false, message: "\u274c No project directory found. Please open a project first." };
          }
          const hasPubspec = await acode.exec(`[ -f "${projectDir}/pubspec.yaml" ] && echo "1"`);
          if (!hasPubspec && !command.includes("create")) {
            return { success: false, message: "\u274c Not a Flutter project. Run 'Flutter Create Project' first." };
          }
          const termuxCmd = `
            cd ${projectDir} &&
            export PATH="$PATH:${this.config.termuxPath}" &&
            ${command}
          `;
          let result;
          try {
            this._log("Executing command via Termux:API or fallback");
            if (this.config.useTermuxAPI) {
              result = await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${encodeURIComponent(termuxCmd)}"`);
            } else {
              result = await acode.exec(termuxCmd);
            }
          } catch (e) {
            this._log(`Command execution failed: ${e && e.message ? e.message : e}`, true);
            throw e;
          }
          return { success: true, message: `\ud83d\udcf1 Running in ${projectDir.split('/').pop()}`, output: result };
        } catch (e) {
          return { success: false, message: `\u274c ${e && e.message ? e.message : e}`, error: e ? e.toString() : String(e) };
        }
      }

      static _log(message, isError = false) {
        if (!this.config.debugMode) return;
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[Flutter][${timestamp}] ${message}`);
        if (isError && acode.toast) {
          acode.toast(`Flutter: ${String(message).substring(0, 50)}`, 5000);
        }
      }
    }

  FlutterCompiler.init();

  // Register sidebar command to open the UI (outside the class)
  acode.addCommand({
    name: "Flutter Compiler UI",
    description: "Open the Flutter Compiler control panel",
    bindKey: { win: null, mac: null },
    exec: () => FlutterCompiler.showUI()
  });
});

acode.setPluginUnmount('com.mikaelkraft.fluttercompiler', () => {
  console.log('Flutter Compiler unmounted');
});