import { AsyncFileDialog } from "@bindrs/rfd";
import { Database } from "bun:sqlite";
import ProgressBar from "progress";

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS posts (
    uni_key TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    tid TEXT,
    uin TEXT,
    nickname TEXT,
    content TEXT,
    created_time INTEGER,
    likes TEXT,
    like_total INTEGER DEFAULT 0,
    comments TEXT,
    comment_total INTEGER DEFAULT 0,
    images TEXT,
    image_total INTEGER DEFAULT 0,
    video TEXT,
    video_total INTEGER DEFAULT 0,
    last_modify INTEGER,
    source_name TEXT,
    secret INTEGER DEFAULT 0,
    lbs TEXT,
    conlist TEXT,
    fwd_num INTEGER DEFAULT 0,
    share_source TEXT
);
`;
const INSERT_SQL = `
INSERT INTO posts (
    uni_key, type, tid, uin, nickname, content, created_time,
    likes, like_total, comments, comment_total, images, image_total,
    video, video_total, last_modify, source_name, secret, lbs,
    conlist, fwd_num, share_source
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

function safeJsonStringify(data: any, fallback: string = '[]'): string {
    try {
        return JSON.stringify(data ?? []);
    } catch (e) {
        console.warn(e);
        return fallback;
    };
};
function detectDataType(data: unknown): { type: 'shuoshuo' | 'share' | 'unknown'; error?: string } {
    if (data === null || data === undefined) {
        return { type: 'unknown', error: '数据为空' };
    };
    if (!Array.isArray(data)) {
        return { type: 'unknown', error: '数据不是数组格式' };
    };
    if (data.length === 0) {
        return { type: 'unknown', error: '数据数组为空' };
    };
    const first = data[0];
    if (typeof first !== 'object' || first === null) {
        return { type: 'unknown', error: '数组元素不是对象' };
    };
    if ('tid' in first && 'name' in first) return { type: 'shuoshuo' };
    if ('id' in first && 'source' in first) return { type: 'share' };
    return { type: 'unknown', error: '无法识别的数据结构，缺少必要字段' };
};
function convertShuoshuoImages(pic: any[]): any[] {
    if (!Array.isArray(pic)) return [];
    return pic.map(p => ({
        height: p.height,
        width: p.width,
        pic_id: p.pic_id,
        small_url: p.smallurl,
        url: p.url1,
        custom_url: p.custom_url,
        mime_type: p.custom_mimeType,
        filename: p.custom_filename
    }));
};
function convertShareImages(images: any[]): any[] {
    if (!Array.isArray(images)) return [];
    return images.map(img => ({
        url: img.url,
        custom_url: img.custom_url,
        mime_type: img.custom_mimeType,
        filename: img.custom_filename
    }));
};
function convertVideo(video: any[]): any[] {
    if (!Array.isArray(video)) return [];
    return video.map(v => ({
        cover_height: v.cover_height,
        cover_width: v.cover_width,
        video_id: v.video_id,
        video_time: v.video_time,
        cover_filename: v.custom_pre_filename,
        filename: v.custom_filename
    }));
};
function convertShuoshuoComments(commentlist: any[]): any[] {
    if (!Array.isArray(commentlist)) return [];
    function processComment(c: any): any {
        return {
            content: c.content,
            create_time: c.create_time,
            name: c.name,
            reply_num: c.reply_num,
            tid: c.tid,
            uin: c.uin,
            replies: Array.isArray(c.list_3) ? c.list_3.map(processComment) : []
        };
    };
    return commentlist.map(processComment);
};
function convertShareComments(comments: any[]): any[] {
    if (!Array.isArray(comments)) return [];
    
    function processComment(c: any): any {
        return {
            content: c.content,
            create_time: c.create_time,
            name: c.name,
            reply_num: c.reply_num,
            tid: c.tid,
            uin: c.uin,
            replies: Array.isArray(c.list_3) ? c.list_3.map(processComment) : []
        };
    };
    return comments.map(processComment);
};
function convertShuoshuo(item: any): any[] | null {
    if (!item || typeof item !== 'object') {
        console.warn('无效的说说数据项');
        return null;
    };
    return [
        item.uniKey || '',
        'shuoshuo',
        item.tid || '',
        String(item.uin ?? ''),
        item.name || '',
        item.content || '',
        item.created_time || 0,
        safeJsonStringify(item.likes),
        item.likeTotal || 0,
        safeJsonStringify(convertShuoshuoComments(item.commentlist)),
        item.cmtnum || 0,
        safeJsonStringify(convertShuoshuoImages(item.pic)),
        item.imagetotal || 0,
        safeJsonStringify(convertVideo(item.video)),
        item.videototal || 0,
        item.lastmodify || 0,
        item.source_name || '',
        item.secret || 0,
        safeJsonStringify(item.lbs, '{}'),
        safeJsonStringify(item.conlist),
        item.fwdnum || 0,
        null // share_source
    ];
};
function convertShare(item: any): any[] | null {
    if (!item || typeof item !== 'object') {
        console.warn('无效的分享数据项');
        return null;
    }
    const source = item.source || {};
    return [
        item.uniKey || `share_${item.id}`,
        'share',
        String(item.id ?? ''),
        String(item.uin ?? ''),
        item.nickname || '',
        item.desc || '',
        item.shareTime || 0,
        safeJsonStringify(item.likes),
        item.likeTotal || 0,
        safeJsonStringify(convertShareComments(item.comments)),
        item.commentTotal || 0,
        safeJsonStringify(convertShareImages(source.images)),
        Array.isArray(source.images) ? source.images.length : 0,
        null, // video
        0,    // video_total
        null, // last_modify
        null, // source_name
        null, // secret
        null, // lbs
        null, // conlist
        null, // fwd_num
        safeJsonStringify({
            title: source.title,
            desc: source.desc,
            url: source.url,
            from: source.from
        }, '{}')
    ];
}
function mergeAndSortData(dataArray: any[][]): any[] {
    let allShuoshuo: any[] = [];
    let allShare: any[] = [];
    for (const data of dataArray) {
        const { type } = detectDataType(data);
        if (type === 'shuoshuo') {
            allShuoshuo = allShuoshuo.concat(data);
        } else if (type === 'share') {
            allShare = allShare.concat(data);
        };
    };
    allShuoshuo.sort((a, b) => (a.created_time || 0) - (b.created_time || 0));
    allShare.sort((a, b) => (a.shareTime || 0) - (b.shareTime || 0));
    return [...allShuoshuo, ...allShare];
};
function convert(src: any, showProgress: boolean = true): Database | string {
    let db: Database;
    
    try {
        db = new Database(':memory:');
    } catch (e) {
        console.error(e);
        return '创建数据库失败';
    };
    try {
        db.run(CREATE_TABLE_SQL);
    } catch (e) {
        console.error(e);
        db.close();
        return '创建表失败';
    };
    let insertStmt;
    try {
        insertStmt = db.prepare(INSERT_SQL);
    } catch (e) {
        console.error(e);
        db.close();
        return '准备插入语句失败';
    };
    const { type: dataType, error } = detectDataType(src);
    if (dataType === 'unknown') {
        db.close();
        return error || '无法识别的数据类型';
    };
    const timeField = dataType === 'shuoshuo' ? 'created_time' : 'shareTime';
    const sortedSrc = [...src].sort((a, b) => {
        const timeA = a[timeField] || 0;
        const timeB = b[timeField] || 0;
        return timeA - timeB;
    });
    const convertFn = dataType === 'shuoshuo' ? convertShuoshuo : convertShare;
    const total = sortedSrc.length;
    let successCount = 0;
    let failCount = 0;
    const shouldShowProgress = showProgress && total > 0;
    const bar = shouldShowProgress ? new ProgressBar('  转换中 [:bar] :current/:total :percent', {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total: total,
        clear: true
    }) : null;
    for (let i = 0; i < total; i++) {
        const item = sortedSrc[i];
        try {
            const values = convertFn(item);
            if (values === null) {
                failCount++;
                continue;
            }
            insertStmt.run(...values);
            successCount++;
        } catch (e) {
            failCount++;
            console.error(e);
        };
        bar?.tick();
    };
    if (bar) {
        bar.terminate();
    };
    return db;
};
function convertMultiple(dataArray: any[][], showProgress: boolean = true): Database | string {
    let db: Database;
    try {
        db = new Database(':memory:');
    } catch (e) {
        console.error(e);
        return '创建数据库失败';
    };
    try {
        db.run(CREATE_TABLE_SQL);
    } catch (e) {
        console.error(e);
        db.close();
        return '创建表失败';
    };
    let insertStmt;
    try {
        insertStmt = db.prepare(INSERT_SQL);
    } catch (e) {
        console.error(e);
        db.close();
        return '准备插入语句失败';
    };
    let allShuoshuo: any[] = [];
    let allShare: any[] = [];
    for (const data of dataArray) {
        const { type } = detectDataType(data);
        if (type === 'shuoshuo') {
            allShuoshuo = allShuoshuo.concat(data);
        } else if (type === 'share') {
            allShare = allShare.concat(data);
        };
    };
    allShuoshuo.sort((a, b) => (a.created_time || 0) - (b.created_time || 0));
    allShare.sort((a, b) => (a.shareTime || 0) - (b.shareTime || 0));
    const total = allShuoshuo.length + allShare.length;
    if (total === 0) {
        db.close();
        return '没有有效数据';
    };
    let successCount = 0;
    let failCount = 0;
    const shouldShowProgress = showProgress && total > 0;
    const bar = shouldShowProgress ? new ProgressBar('  转换中 [:bar] :current/:total :percent', {
        complete: '=',
        incomplete: ' ',
        width: 30,
        total: total,
        clear: true
    }) : null;
    for (const item of allShuoshuo) {
        try {
            const values = convertShuoshuo(item);
            if (values === null) {
                failCount++;
                continue;
            }
            insertStmt.run(...values);
            successCount++;
        } catch (e) {
            failCount++;
            console.error(e);
        }
        bar?.tick();
    };
    for (const item of allShare) {
        try {
            const values = convertShare(item);
            if (values === null) {
                failCount++;
                continue;
            }
            insertStmt.run(...values);
            successCount++;
        } catch (e) {
            failCount++;
            console.error(e);
        }
        bar?.tick();
    };
    if (bar) {
        bar.terminate();
    };
    return db;
};
export async function convertFromFile(filePaths: string | string[]): Promise<Database | string> {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    if (paths.length === 0) {
        return '文件路径为空';
    };
    const dataArray: any[][] = [];
    for (const filePath of paths) {
        if (!filePath || typeof filePath !== 'string') {
            return `文件路径无效: ${filePath}`;
        };
        const file = Bun.file(filePath);
        if (!(await file.exists())) {
            return `文件不存在: ${filePath}`;
        };
        let src;
        try {
            src = await file.json();
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.error(e);
                return `JSON 格式错误: ${filePath}`;
            }
            console.error(e);
            return `文件读取失败: ${filePath}`;
        };
        if (!Array.isArray(src)) {
            return `文件 ${filePath} 不是数组格式`;
        };
        dataArray.push(src);
    };
    return convertMultiple(dataArray);
};

export default async function convertInteract(): Promise<string> {
    let fileHandles;
    try {
        fileHandles = await new AsyncFileDialog()
            .addFilter("JSON", ["json", "txt"])
            .setTitle("选择JSON文件（可多选）")
            .pickFiles();
    } catch (e) {
        console.error(e);
        return '文件对话框打开失败';
    };
    if (!fileHandles || fileHandles.length === 0) {
        return '没有选择文件';
    };
    const dataArray: any[][] = [];
    for (const fileHandle of fileHandles) {
        const filePath = fileHandle.path();
        let src;
        try {
            src = await Bun.file(filePath).json();
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.error(e);
                return `JSON 格式错误: ${filePath}`;
            };
            console.error(e);
            return `文件读取失败: ${filePath}`;
        };
        if (!Array.isArray(src)) {
            return `文件 ${filePath} 不是数组格式`;
        };
        dataArray.push(src);
    };
    const result = convertMultiple(dataArray);
    if (typeof result === 'string') {
        return result;
    };
    const count = result.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
    const stats = result.prepare('SELECT type, COUNT(*) as count FROM posts GROUP BY type').all() as { type: string; count: number }[];
    const timeRange = result.prepare('SELECT MIN(created_time) as min_time, MAX(created_time) as max_time FROM posts').get() as { min_time: number; max_time: number };
    let savePath;
    try {
        const saveHandle = await new AsyncFileDialog()
            .addFilter("SQLite 数据库", ["db", "sqlite", "sqlite3"])
            .setFileName("qzone_data.db")
            .setTitle("保存数据库文件")
            .saveFile();
        if (!saveHandle) {
            result.close();
            return '未选择保存路径，已取消';
        };
        savePath = saveHandle.path();
    } catch (e) {
        console.error(e);
        result.close();
        return '保存对话框打开失败';
    };
    try {
        const existingFile = Bun.file(savePath);
        if (await existingFile.exists()) {
            await Bun.write(savePath, '');
        };
        const fileDb = new Database(savePath);
        fileDb.run(CREATE_TABLE_SQL);
        const insertStmt = fileDb.prepare(INSERT_SQL);
        const rows = result.prepare('SELECT * FROM posts ORDER BY created_time').all() as any[];
        for (const row of rows) {
            insertStmt.run(
                row.uni_key, row.type, row.tid, row.uin, row.nickname, row.content, row.created_time,
                row.likes, row.like_total, row.comments, row.comment_total, row.images, row.image_total,
                row.video, row.video_total, row.last_modify, row.source_name, row.secret, row.lbs,
                row.conlist, row.fwd_num, row.share_source
            );
        };
        fileDb.close();
    } catch (e) {
        console.error(e);
        result.close();
        return `数据库保存失败: ${e}`;
    };
    result.close();
    let msg = `成功导入 ${count.count} 条记录`;
    for (const stat of stats) {
        msg += `，${stat.type}: ${stat.count} 条`;
    };
    if (timeRange.min_time && timeRange.max_time) {
        const minDate = new Date(timeRange.min_time * 1000).toLocaleDateString('zh-CN');
        const maxDate = new Date(timeRange.max_time * 1000).toLocaleDateString('zh-CN');
        msg += `，时间: ${minDate} ~ ${maxDate}`;
    };
    msg += `，已保存到 ${savePath}`;
    return msg;
};

if (import.meta.main) {
    console.log(await convertInteract());
};