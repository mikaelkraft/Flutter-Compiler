// Auto-install Flutter in Termux  
async function installFlutter() {  
    const cmd = `  
    pkg update -y &&  
    pkg install git openjdk-17 -y &&  
    git clone https://github.com/flutter/flutter.git &&  
    echo 'export PATH="\$PATH:\$HOME/flutter/bin"' >> ~/.bashrc &&  
    source ~/.bashrc &&  
    flutter doctor  
    `;  
    await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${cmd}"`);  
    acode.toast("Flutter installed in Termux!");  
}  

// Run Flutter commands  
async function runFlutterCommand(command) {  
    const projectDir = await editor.getProjectDir();  
    const termuxCmd = `  
    cd ${projectDir} &&  
    export PATH="\$PATH:\$HOME/flutter/bin" &&  
    ${command}  
    `;  
    try {  
        await acode.exec(`am startservice -n com.termux/.app.TermuxService -e cmd "${termuxCmd}"`);  
        acode.toast("✅ Success: " + command);  
    } catch (e) {  
        acode.toast("❌ Termux failed. Trying remote...");  
        const remoteLogs = await remoteFallback(command, projectDir);  
        console.log(remoteLogs);  
    }  
}  

// Remote fallback (optional)  
async function remoteFallback(command, projectDir) {  
    acode.toast("Uploading to cloud...");  
    const response = await fetch("https://your-cloud-service.com/build", {  
        method: "POST",  
        body: JSON.stringify({ cmd: command, project: projectDir })  
    });  
    return response.json();  
}  

// Plugin UI  
acode.setPluginMenu("🛠️ Install Flutter", installFlutter);  
acode.setPluginMenu("📦 Pub Get", () => runFlutterCommand("flutter pub get"));  
acode.setPluginMenu("🔥 Flutterfire", () => runFlutterCommand("dart pub global activate flutterfire_cli && flutterfire configure"));  
acode.setPluginMenu("🚀 Build APK", () => runFlutterCommand("flutter build apk"));  