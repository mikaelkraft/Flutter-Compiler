// Baseline Acode plugin to prove install + load + UI
module.exports = {
  init(acode) {
    try {
      // Visible proof the plugin code executed
      if (typeof acode.toast === "function") {
        acode.toast("Baseline plugin loaded");
      }

      // Primary menu (if supported)
      if (typeof acode.setPluginMenu === "function") {
        acode.setPluginMenu("Baseline: Say Hello", () => acode.toast("Hello from plugin"));
      } else if (typeof acode.addSideButton === "function") {
        // Fallback entry point if setPluginMenu isn’t available in this build
        acode.addSideButton({
          text: "Hello",
          onClick: () => acode.toast("Hello from side button")
        });
      }
    } catch (e) {
      // Never throw in init; log as final fallback
      try { console.log("Baseline init error:", e); } catch (_) {}
    }
  },
  destroy() {}
};
