const { execSync } = require("child_process");

const isInnerBuild = process.env.IS_OPEN_NEXT_CHILD === "true";

if (isInnerBuild) {
  console.log("[Build] Running inner Next.js production build...");
  execSync("next build", { stdio: "inherit" });
} else {
  console.log("[Build] Generating Prisma client...");
  execSync("prisma generate", { stdio: "inherit" });

  console.log("[Build] Building OpenNext Cloudflare Worker bundle...");
  execSync("opennextjs-cloudflare build", {
    stdio: "inherit",
    env: { ...process.env, IS_OPEN_NEXT_CHILD: "true" }
  });
}
