// cloud/deploy.ts - Production-Ready 
// ❤️ Mikael Kraft © 2025
const ENV = {
  // Required Configuration
  AUTH_TOKEN: Deno.env.get("AUTH_TOKEN"),
  
  // Rate Limiting (10 requests/minute)
  RATE_LIMIT_WINDOW_MS: 60_000,
  MAX_REQUESTS: 10,
  
  // Security Tuning
  REQUEST_TIMEOUT_MS: 300_000, // 5 minute request validity
  MAX_CMD_LENGTH: 1024,
  ALLOWED_GIT_DOMAINS: new Set(["github.com", "gitlab.com", "bitbucket.org"])
};

// Fail fast if token missing
if (!ENV.AUTH_TOKEN) throw new Error("❌ AUTH_TOKEN environment variable required");

// ================= SECURITY CORE =================
const requestTracker = new Map<string, {
  count: number;
  resetTime: number; // Tracks window expiration
}>();

class Security {
  // Command Sanitization
  static sanitizeCommand(cmd: string): string {
    if (cmd.length > ENV.MAX_CMD_LENGTH) {
      throw new Error(`Command exceeds ${ENV.MAX_CMD_LENGTH} character limit`);
    }
    return cmd.replace(/[^a-zA-Z0-9\-_\.\/\s:@]/g, '');
  }

  // Git URL Validation
  static validateGitUrl(url: string): void {
    try {
      const domain = new URL(url.replace("git@", "https://")
                             .replace("git:", "https://"))
                      .hostname;
      if (!ENV.ALLOWED_GIT_DOMAINS.has(domain)) {
        throw new Error(`Git domain ${domain} not allowed`);
      }
    } catch {
      throw new Error("Invalid Git URL format");
    }
  }

  // Request Freshness Check
  static validateTimestamp(timestamp: number): void {
    const now = Date.now();
    const age = now - timestamp;
    
    if (age < 100) throw new Error("Request too recent (potential replay)");
    if (age > ENV.REQUEST_TIMEOUT_MS) {
      throw new Error(`Request expired (${Math.round(age/1000)}s old)`);
    }
  }
}

// ================= API CORE =================
class APIHandler {
  static async handleCommand(payload: {
    cmd: string;
    project?: string;
    timestamp: number;
  }) {
    // Input Validation
    if (!payload.cmd) throw new Error("Missing command");
    const cleanCmd = Security.sanitizeCommand(payload.cmd);
    Security.validateTimestamp(payload.timestamp);

    // Project Setup (if needed)
    let tempDir: string | undefined;
    try {
      if (payload.project?.startsWith("git:")) {
        Security.validateGitUrl(payload.project);
        tempDir = await this.setupProject(payload.project);
      }

      // Execute Command
      return await this.runCommand(cleanCmd, tempDir);
    } finally {
      if (tempDir) await this.cleanup(tempDir);
    }
  }

  private static async setupProject(gitUrl: string): Promise<string> {
    const tempDir = await Deno.makeTempDir({ prefix: "flutter_clone_" });
    const process = Deno.run({
      cmd: ["git", "clone", "--depth", "1", gitUrl.replace("git:", "https://"), tempDir],
      stderr: "piped"
    });
    
    const [status, stderr] = await Promise.all([
      process.status(),
      process.stderrOutput()
    ]);
    process.close();

    if (!status.success) {
      throw new Error(new TextDecoder().decode(stderr));
    }
    return tempDir;
  }

  private static async runCommand(cmd: string, cwd?: string) {
    const bannedPatterns = [";", "&&", "||", "`", "$(", ">", "<", "|"];
    if (bannedPatterns.some(p => cmd.includes(p))) {
      throw new Error("Command contains unsafe characters");
    }

    const process = Deno.run({
      cmd: ["sh", "-c", cmd],
      cwd,
      stdout: "piped",
      stderr: "piped"
    });

    try {
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
    } finally {
      process.close();
    }
  }

  private static async cleanup(dir: string) {
    try {
      await Deno.remove(dir, { recursive: true });
    } catch (e) {
      console.warn(`Cleanup warning: ${e.message}`);
    }
  }
}

// ================= SERVER SETUP =================
Deno.serve(async (req) => {
  const clientIp = req.headers.get("X-Forwarded-For")?.split(',')[0]?.trim() || "unknown";

  // Health Check Endpoint
  if (req.method === "GET") {
    return Response.json({
      status: "operational",
      rateLimit: `${ENV.MAX_REQUESTS}/${ENV.RATE_LIMIT_WINDOW_MS/1000}s`
    });
  }

  // Rate Limiting
  const now = Date.now();
  const clientRecord = requestTracker.get(clientIp);
  
  if (clientRecord && now < clientRecord.resetTime) {
    if (clientRecord.count >= ENV.MAX_REQUESTS) {
      return Response.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    requestTracker.set(clientIp, {
      count: clientRecord.count + 1,
      resetTime: clientRecord.resetTime
    });
  } else {
    requestTracker.set(clientIp, {
      count: 1,
      resetTime: now + ENV.RATE_LIMIT_WINDOW_MS
    });
  }

  // Authentication
  if (req.method === "POST" && 
      req.headers.get("Authorization") !== `Bearer ${ENV.AUTH_TOKEN}`) {
    return Response.json(
      { error: "Invalid authentication" },
      { status: 401 }
    );
  }

  // Process Request
  try {
    const payload = await req.json();
    const result = await APIHandler.handleCommand(payload);
    
    return Response.json({
      ...result,
      rateLimit: {
        remaining: ENV.MAX_REQUESTS - (requestTracker.get(clientIp)?.count || 0),
        resetIn: Math.ceil(((requestTracker.get(clientIp)?.resetTime || 0) - now)/1000)
      }
    });
  } catch (e) {
    console.error(`API Error: ${e.message}`);
    return Response.json(
      { error: e.message },
      { status: 400 }
    );
  }
});

console.log("🚀 Flutter Compiler API running");