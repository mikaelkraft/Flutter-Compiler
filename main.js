// Flutter Compiler for Acode - Visibility Baseline (v1.11.6 tested)
// DO NOT add async/await before menu registrations. Keep everything sync-registered first.

module.exports = {
  init(acode) {
    // Hard guard: never throw in init; surface errors with toast.
    try {
      // 1) Always signal load
      try {
        acode.toast("Flutter Compiler loaded");
      } catch (_) {
        // ignore
      }

      // 2) Synchronous, minimal-safe menus first (no async, no external deps)
      const safeMenus = [
        {
          label: "✅ Plugin Check",
          handler: () => {
            try {
              const features = [
                typeof acode.toast === "function" ? "toast" : "-",
                typeof acode.confirm === "function" ? "confirm" : "-",
                typeof acode.showPicker === "function" ? "picker" : "-",
                typeof acode.openFile === "function" ? "openFile" : "-",
              ].filter(Boolean).join(", ");
              acode.toast(`Plugin OK. UI: ${features}`);
            } catch (e) {
              acode.toast("Check failed: " + (e?.message || e));
            }
          }
        },
        {
          label: "📑 Changelog",
          handler: () => {
            try {
              // Note: This just attempts to open CHANGELOG.md at plugin root.
              // If not present in plugin zip root or not listed in plugin.json files, it won’t open.
              if (typeof acode.openFile === "function") {
                acode.openFile("CHANGELOG.md");
              } else {
                acode.toast("openFile API unavailable");
              }
            } catch (e) {
              acode.toast("Open changelog failed: " + (e?.message || e));
            }
          }
        },
        {
          label: "⚙️ Settings (Dummy)",
          handler: () => {
            try {
              if (typeof acode.showInputDialog === "function") {
                acode.showInputDialog("Settings", [
                  { label: "Debug Mode", type: "checkbox", checked: false },
                  { label: "SDK Path", type: "text", value: "$HOME/flutter/bin" }
                ], () => acode.toast("Saved (dummy)"));
              } else {
                acode.toast("showInputDialog unavailable");
              }
            } catch (e) {
              acode.toast("Settings error: " + (e?.message || e));
            }
          }
        },
        {
          label: "❓ Help",
          handler: () => {
            try {
              if (typeof acode.showPicker === "function") {
                acode.showPicker("Help & Support", ["Docs", "Donate"], (idx) => {
                  if (idx === 0 && typeof acode.launchUrl === "function") {
                    acode.launchUrl("https://github.com/mikaelkraft/Flutter-Compiler/wiki");
                  } else if (idx === 1 && typeof acode.launchUrl === "function") {
                    acode.launchUrl("https://github.com/sponsors/mikaelkraft");
                  } else {
                    acode.toast("No action");
                  }
                });
              } else {
                acode.toast("showPicker unavailable");
              }
            } catch (e) {
              acode.toast("Help error: " + (e?.message || e));
            }
          }
        }
      ];

      // Preferred registration API (if supported)
      let registeredViaPluginMenu = false;
      if (typeof acode.setPluginMenu === "function") {
        for (const item of safeMenus) {
          acode.setPluginMenu(item.label, item.handler);
        }
        registeredViaPluginMenu = true;
      }

      // Fallback: side button to guarantee a visible entry point
      let sideButtonAdded = false;
      if (!registeredViaPluginMenu && typeof acode.addSideButton === "function") {
        acode.addSideButton({
          text: "Flutter",
          icon: "", // set a custom icon path if desired (ensure it's in plugin.json files)
          onClick: () => {
            // Offer the same quick actions via a simple picker
            if (typeof acode.showPicker === "function") {
              acode.showPicker("Flutter", safeMenus.map(m => m.label), (idx) => {
                const picked = safeMenus[idx];
                picked && picked.handler();
              });
            } else {
              acode.toast("Side button active. Picker unavailable.");
            }
          }
        });
        sideButtonAdded = true;
      }

      // Final fallback: at least drop a toast so user sees plugin is alive
      if (!registeredViaPluginMenu && !sideButtonAdded) {
        acode.toast("Plugin UI APIs not found. Minimal load only.");
      }

      // Optional: confirm install; register AFTER menus so UI is already present
      if (typeof acode.on === "function" && typeof acode.confirm === "function") {
        acode.on("install", async () => {
          try {
            await acode.confirm("Flutter Compiler", "Installed successfully. Open the Plugins panel to use it.", ["OK"]);
          } catch (_) {}
        });
      }
    } catch (err) {
      try {
        acode.toast("Plugin init error: " + (err?.message || err));
      } catch (_) {}
    }
  },

  destroy() {
    // If you add side buttons or sidebar apps with IDs, detach them here.
  }
};
