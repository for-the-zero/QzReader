import { type Serve } from "bun";
import { AsyncFileDialog } from "@bindrs/rfd";
import { Database } from "bun:sqlite";
import path from "path";

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
            const list = await get(data, db);
            const { where, params } = (() => {
                const conditions: string[] = [];
                const params: (string | number | boolean)[] = [];
                const f = data.filter;
                if (f.type !== 'both') {
                    conditions.push('type = ?');
                    params.push(f.type);
                }
                if (f.picTotal != null) {
                    if (typeof f.picTotal === 'number') {
                        conditions.push('image_total = ?');
                        params.push(f.picTotal);
                    } else if (f.picTotal[1] === 'inf') {
                        conditions.push('image_total >= ?');
                        params.push(f.picTotal[0]);
                    } else {
                        conditions.push('image_total BETWEEN ? AND ?');
                        params.push(f.picTotal[0], f.picTotal[1]);
                    }
                }
                if (f.mediaTotal != null) {
                    if (typeof f.mediaTotal === 'number') {
                        conditions.push('video_total = ?');
                        params.push(f.mediaTotal);
                    } else if (f.mediaTotal[1] === 'inf') {
                        conditions.push('video_total >= ?');
                        params.push(f.mediaTotal[0]);
                    } else {
                        conditions.push('video_total BETWEEN ? AND ?');
                        params.push(f.mediaTotal[0], f.mediaTotal[1]);
                    }
                }
                if (f.secret) conditions.push('secret = 1');
                if (f.hasLbs) conditions.push('lbs IS NOT NULL');
                if (f.withLink) conditions.push("(content LIKE '%http%' OR content LIKE '%链接%')");
                if (f.withAt) conditions.push("content LIKE '%@%'");
                if (f.date) {
                    if (Array.isArray(f.date)) {
                        conditions.push('created_time BETWEEN ? AND ?');
                        params.push(Math.floor(f.date[0] / 1000), Math.floor(f.date[1] / 1000));
                    } else {
                        const startTs = Math.floor(new Date(f.date.year, f.date.month - 1, f.date.day).getTime() / 1000);
                        const endTs = Math.floor(new Date(f.date.year, f.date.month - 1, f.date.day, 23, 59, 59).getTime() / 1000);
                        conditions.push('created_time BETWEEN ? AND ?');
                        params.push(startTs, endTs);
                    }
                }
                if (f.likes != null) {
                    if (typeof f.likes === 'number') {
                        conditions.push('like_total = ?');
                        params.push(f.likes);
                    } else if (f.likes[1] === 'inf') {
                        conditions.push('like_total >= ?');
                        params.push(f.likes[0]);
                    } else {
                        conditions.push('like_total BETWEEN ? AND ?');
                        params.push(f.likes[0], f.likes[1]);
                    }
                }
                if (f.comments != null) {
                    if (typeof f.comments === 'number') {
                        conditions.push('comment_total = ?');
                        params.push(f.comments);
                    } else if (f.comments[1] === 'inf') {
                        conditions.push('comment_total >= ?');
                        params.push(f.comments[0]);
                    } else {
                        conditions.push('comment_total BETWEEN ? AND ?');
                        params.push(f.comments[0], f.comments[1]);
                    }
                }
                if (f.fwds != null) {
                    if (typeof f.fwds === 'number') {
                        conditions.push('fwd_num = ?');
                        params.push(f.fwds);
                    } else if (f.fwds[1] === 'inf') {
                        conditions.push('fwd_num >= ?');
                        params.push(f.fwds[0]);
                    } else {
                        conditions.push('fwd_num BETWEEN ? AND ?');
                        params.push(f.fwds[0], f.fwds[1]);
                    }
                }
                if (f.content) {
                    conditions.push('content LIKE ?');
                    params.push(`%${f.content}%`);
                }
                if (f.shareSource) {
                    conditions.push("share_source LIKE ?");
                    params.push(`%"${f.shareSource}"%`);
                }
                return { where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', params };
            })();
            const countSql = `SELECT COUNT(*) as total FROM posts ${where}`;
            const countRow = db.query(countSql).get(...params) as any;
            return Response.json({
                list: list,
                total: countRow?.total || 0,
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
    "/api/img": {
        async GET(req) {
            let { searchParams } = new URL(req.url);
            let src = searchParams.get('src') as string;
            let online = searchParams.get('online');
            if(configs.picPath){
                let localPath = path.join(configs.picPath, src);
                if (await Bun.file(localPath).exists()) {
                    return new Response(Bun.file(localPath));
                };
            };
            if(online){
                try {
                    const res = await fetch(online, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
                            'Referer': 'https://qzone.qq.com/',
                            'Accept': 'image/*,video/*,*/*;q=0.8',
                        },
                    });
                    return new Response(res.body, {
                        status: res.status,
                        headers: {
                            'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
                            'Cache-Control': 'public, max-age=31536000',
                            'Access-Control-Allow-Origin': '*',
                        },
                    });
                } catch (e) {
                    return new Response('Proxy Error', { status: 500 });
                };
            };
            let blank = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
            return new Response(blank, {
                headers: { 'Content-Type': 'image/gif' }
            });
        }
    }
} as Serve.Routes<Request, any>;
export default appRoutes;