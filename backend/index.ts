import index from "../frontend/index.html";
import appRoutes from "./appRoutes";
import { serve } from "bun";

const server = serve({
    routes: {
        "/": index,
        ...appRoutes
    },
    development: !process.env.PRODUCTION,
    idleTimeout: 45,
});
console.log(`Listening on http://localhost:${server.port}`)
process.on("SIGINT", async() => {
    await server.stop();
    console.log("Closed~ ");
    process.exit();
});