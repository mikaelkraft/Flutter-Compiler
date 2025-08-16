// cloud/mod.ts
import { exec } from "https://deno.land/x/exec/mod.ts";

Deno.serve(async (req) => {
  // 1. Auth check (optional)
  const auth = req.headers.get("Authorization");
  if (auth !== "Bearer YOUR_SECRET_KEY") {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Parse request
  const { cmd, project } = await req.json();
  
  // 3. Execute Flutter commands
  try {
    const tempDir = `tmp_${Date.now()}`;
    const cloneCmd = `git clone ${project} ${tempDir} && cd ${tempDir}`;
    
    await exec(cloneCmd);
    const result = await exec(`${cmd}`, { cwd: tempDir });
    
    // Cleanup
    await exec(`rm -rf ${tempDir}`);
    
    return new Response(JSON.stringify({
      success: true,
      output: result.output
    }));
  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), { status: 500 });
  }
});