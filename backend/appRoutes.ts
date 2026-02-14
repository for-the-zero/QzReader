import type { Serve } from "bun";

import convert from "./convert";

var configs = {
    dbPath: null,
    picPath: null,
};

const appRoutes = {
    "/api/ping": {
        async GET(req){
            return Response.json({
                time: new Date(),
                ...configs
            });
        },
    },
    "/api/convert": {
        async GET(req){
            return Response.json({
                msg: await convert(),
                ...configs
            });
        },
    },
    //TODO:
} as Serve.Routes<Request, any>;
export default appRoutes;