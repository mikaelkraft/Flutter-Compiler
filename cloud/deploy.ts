// deploy.ts
Deno.serve(async (req) => {
  // 1. Validate request
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // 2. Parse payload
  const { cmd, project } = await req.json().catch(() => ({}));
  if (!cmd) return new Response("Bad request", { status: 400 });

  // 3. Execute in isolated environment
  try {
    const tempDir = `tmp_${Date.now()}`;
    
    // Clone if Git project
    if (project?.startsWith("git:")) {
      const repoUrl = project.replace("git:", "https://");
      await Deno.run({ cmd: ["git", "clone", repoUrl, tempDir] }).status();
    }

    // Run command
    const process = Deno.run({
      cmd: cmd.split(" "),
      cwd: project?.startsWith("git:") ? tempDir : undefined,
      stdout: "piped",
      stderr: "piped"
    });

    const [status, stdout, stderr] = await Promise.all([
      process.status(),
      process.output(),
      process.stderrOutput()
    ]);

    // Cleanup
    if (project?.startsWith("git:")) {
      await Deno.remove(tempDir, { recursive: true });
    }

    // Return results
    return new Response(JSON.stringify({
      success: status.success,
      output: new TextDecoder().decode(stdout),
      error: status.success ? null : new TextDecoder().decode(stderr)
    }));

  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), { status: 500 });
  }
});