import { type Serve } from "bun";
import { AsyncFileDialog } from "@bindrs/rfd";
import { Database } from "bun:sqlite";

import convertInteract from "./convert";
import { get, count, range } from "./get";

var configs: serverConfigType = {
    dbPath: null,
    picPath: null,
};
var db: null | Database;

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
                msg: await convertInteract(),
                ...configs
            });
        },
    },
    "/api/select/db": {
        async GET(req){ 
            let fileHandles;
            try {
                fileHandles = await new AsyncFileDialog()
                    .addFilter("SQLite数据库", ["db","sqlite"])
                    .setTitle("选择数据库文件")
                    .pickFile();
            } catch (e) {
                console.error(e);
                return Response.json({msg: '文件对话框打开失败', ...configs});
            };
            if(!fileHandles){
                configs.dbPath = null;
                return Response.json({msg: '没有选择文件', ...configs});
            };
            try{
                if(db){
                    db.close();
                };
                db = new Database(fileHandles.path());
                configs.dbPath = fileHandles.path();
            } catch (e) { 
                if(db){
                    db.close();
                };
                if(configs.dbPath){
                    db = new Database(configs.dbPath);
                } else {
                    db = null;
                };
                return Response.json({msg: '打开数据库失败', ...configs});
            };
            return Response.json({msg: '成功', ...configs});
        },
    },
    "/api/set/db": {
        async POST(req){ 
            const { path } = await req.json();
            if(!path){
                return Response.json({msg: '路径不能为空', ...configs});
            };
            try{
                if(db){
                    db.close();
                };
                db = new Database(path);
                configs.dbPath = path;
            } catch (e) { 
                console.error(e);
                if(configs.dbPath){
                    db = new Database(configs.dbPath);
                } else {
                    db = null;
                };
                return Response.json({msg: '打开数据库失败', ...configs});
            };
            return Response.json({msg: '成功', ...configs});
        },
    },
    "/api/select/pic": {
        async GET(req){ 
            let fileHandles;
            try {
                fileHandles = await new AsyncFileDialog()
                    .setTitle("选择图片所在文件夹")
                    .pickFolder();
            } catch (e) {
                console.error(e);
                return Response.json({msg: '文件对话框打开失败', ...configs});
            };
            if(!fileHandles){
                configs.picPath = null;
                return Response.json({msg: '没有选择文件夹', ...configs});
            };
            configs.picPath = fileHandles.path();
            return Response.json({msg: '成功', ...configs});
        },
    },
    "/api/get":{
        async POST(req){ 
            if(!db){
                return Response.error();
            };
            let data: reqListType = await req.json();
            return Response.json({
                list: await get(data, db),
                ...configs
            })
        },
    },
    "/api/get/count":{
        async POST(req){ 
            if(!db){
                return Response.error();
            };
            let filter: filterRangeReqType = await req.json();
            return Response.json({
                count: await count(filter, db),
                ...configs
            })
        },
    },
    "/api/get/count/range":{
        async POST(req){ 
            if(!db){
                return Response.error();
            };
            let data: filterType = await req.json();
            return Response.json({
                callback: await range(data, db),
                ...configs
            })
        },
    },
    //TODO:
} as Serve.Routes<Request, any>;
export default appRoutes;