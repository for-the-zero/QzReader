import tailwindPlugin from "bun-plugin-tailwind";
import { existsSync, rmSync, mkdirSync, writeFileSync, unlinkSync } from "fs";

const args = process.argv.slice(2);
const buildFrontendOnly = args.includes("frontend");
const buildExeOnly = args.includes("exe");
const buildAll = args.length === 0 || (buildFrontendOnly && buildExeOnly) || (!buildFrontendOnly && !buildExeOnly);

const tempEntryPath = "./backend/index.prod.ts";

async function clean() {
    if (existsSync("dist")) {
        rmSync("dist", { recursive: true, force: true });
    }
    mkdirSync("dist", { recursive: true });
}

async function buildFrontend() {
    console.log("Building frontend to dist/frontend...");
    mkdirSync("dist/frontend", { recursive: true });
    
    const result = await Bun.build({
        entrypoints: ["./frontend/index.html"],
        outdir: "./dist/frontend",
        minify: true,
        plugins: [tailwindPlugin],
    });
    
    if (!result.success) {
        console.error("Frontend build failed:");
        for (const log of result.logs) {
            console.error(log);
        }
        process.exit(1);
    }
    console.log("Frontend build complete!");
    console.log("Outputs:", result.outputs.map(o => o.path).join(", "));
}

function createTempEntry() {
    const content = `import index from "../frontend/index.html";
import appRoutes from "./appRoutes";
import { serve } from "bun";

const server = serve({
    routes: {
        "/": index,
        ...appRoutes
    },
    development: false,
    idleTimeout: 45,
});
console.log(\`Listening on http://localhost:\${server.port}\`);
process.on("SIGINT", async() => {
    await server.stop();
    console.log("Closed~ ");
    process.exit();
});
`;
    writeFileSync(tempEntryPath, content);
}

function removeTempEntry() {
    if (existsSync(tempEntryPath)) {
        unlinkSync(tempEntryPath);
    }
}

async function buildExe() {
    console.log("Building exe to dist...");
    
    createTempEntry();
    
    const result = await Bun.build({
        entrypoints: [tempEntryPath],
        compile: {
            outfile: "./dist/QzReader.exe",
            windows: {
                hideConsole: false,
            },
        },
        minify: true,
        plugins: [tailwindPlugin],
    });
    
    removeTempEntry();
    
    if (!result.success) {
        console.error("Exe build failed:");
        for (const log of result.logs) {
            console.error(log);
        }
        process.exit(1);
    }
    console.log("Exe build complete!");
    console.log("Output:", result.outputs[0]?.path);
}

async function main() {
    try {
        if (buildAll || !buildExeOnly) {
            await clean();
        }
        
        if (buildAll || buildFrontendOnly) {
            await buildFrontend();
        }
        
        if (buildAll || buildExeOnly) {
            await buildExe();
        }
        
        console.log("\nBuild finished!");
    } catch (error) {
        console.error("Build error:", error);
        process.exit(1);
    }
}

main();