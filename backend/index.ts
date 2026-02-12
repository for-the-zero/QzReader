import index from "../frontend/index.html";
import { serve } from "bun";

const server = serve({
    routes: {
        "/": index,
        "/api/ping": {
            async GET(req){
                return Response.json({time: new Date()});
            },
        },
        //TODO:
    },
    development: true,
});
console.log(`Listening on http://localhost:${server.port}`)