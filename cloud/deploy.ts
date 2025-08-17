// cloud/deploy.ts - Secure Backend

const AUTH_TOKEN = "f8a7dad00c84f93ebb4b4ebb48c7b0dce9b761dd0a4fde37e67c6d341a673bfd";

// GET requests
Deno.serve(async (req) => {
  // Handle GET requests for health checks
  if (req.method === "GET") {
    return new Response("Flutter Compiler API - Online", { 
      status: 200,
      headers: { "Content-Type": "text/plain" } 
    });
  }

  // 1. Auth & Validation
  if (req.method !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  if (req.headers.get("Authorization") !== `Bearer ${AUTH_TOKEN}`) {
    return errorResponse(401, "Unauthorized");
  }

  // 2. Parse Payload
  let payload;
  try {
    payload = await req.json();
    if (!payload?.cmd) throw new Error("Missing command");
    if (Date.now() - payload.timestamp > 60000) {
      throw new Error("Request expired");
    }
  } catch (e) {
    return errorResponse(400, e.message);
  }

  // 3. Execution
  try {
    console.log(`Processing: ${payload.cmd}`, payload.project ? "(with project)" : "");
    
    let tempDir;
    if (payload.project?.startsWith("git:")) {
      tempDir = await setupProject(payload.project);
    }

    const result = await runCommand(payload.cmd, tempDir);
    
    console.log(`Completed: ${payload.cmd}`, 
      result.success ? "✅" : "❌", 
      result.output?.substring(0, 100) || result.error);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("Execution failed:", e);
    return errorResponse(500, e.message);
  }
});

// Helpers
async function setupProject(gitUrl) {
  const tempDir = `tmp_${Date.now()}`;
  const repoUrl = gitUrl.replace("git:", "https://");
  
  console.log(`Cloning: ${repoUrl}`);
  const clone = Deno.run({
    cmd: ["git", "clone", repoUrl, tempDir],
    stderr: "piped"
  });
  
  if (!(await clone.status()).success) {
    throw new Error("Git clone failed");
  }
  
  return tempDir;
}

async function runCommand(cmd, cwd) {
  console.log(`Running: ${cmd}`, cwd ? `in ${cwd}` : "");
  
  const process = Deno.run({
    cmd: cmd.split(" "),
    cwd,
    stdout: "piped",
    stderr: "piped"
  });

  const [status, stdout, stderr] = await Promise.all([
    process.status(),
    process.output(),
    process.stderrOutput()
  ]);

  return {
    success: status.success,
    output: new TextDecoder().decode(stdout),
    error: status.success ? null : new TextDecoder().decode(stderr)
  };
}

function errorResponse(status, message) {
  console.error(`Error ${status}: ${message}`);
  return new Response(JSON.stringify({
    success: false,
    error: message
  }), { status });
}