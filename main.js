// Flutter Compiler for Acode - Reliable Menu Edition

module.exports = {
  init(acode) {
    // --- Menus: ALWAYS register synchronously and FIRST! ---
    acode.setPluginMenu("🆕 Create Project (Dialog)", () => {
      acode.showInputDialog("Create Flutter Project", [
        { label: "Project Language", type: "select", options: ["dart", "kotlin", "swift"], value: "dart" },
        { label: "Platforms (comma separated)", type: "text", value: "android,ios" }
      ], (values) => {
        acode.toast(`Creating project with ${values[0]} for ${values[1]}`);
      });
    });

    acode.setPluginMenu("🩺 Flutter Doctor", () => {
      acode.toast("Running: flutter doctor");
    });

    acode.setPluginMenu("⚙️ Settings", () => {
      acode.showInputDialog("Compiler Settings", [
        { label: "Debug Mode", type: "checkbox", checked: false },
        { label: "Flutter SDK Path", type: "text", value: "$HOME/flutter/bin" }
      ], (values) => {
        acode.toast("Settings saved");
      });
    });

    acode.setPluginMenu("💡 Theme Switcher", () => {
      acode.showPicker("Choose Plugin Theme", ["Default", "Neural", "Neon"], idx => {
        acode.toast(`Theme set: ${["Default", "Neural", "Neon"][idx]}`);
      });
    });

    acode.setPluginMenu("📑 Changelog", () => acode.openFile("CHANGELOG.md"));

    acode.setPluginMenu("❓ Help & Support", () => {
      acode.showPicker("Support", ["Docs", "Donate"], idx => {
        if (idx === 0) acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki");
        if (idx === 1) acode.launchUrl("https://github.com/sponsors/mikaelkraft");
      });
    });
  },
  destroy() {}
};
