import { Database } from "bun:sqlite";

function buildWhereClause(filter: filterType | filterRangeReqType['other']): { where: string, params: (string | number | boolean)[] } {
    const conditions: string[] = [];
    const params: (string | number | boolean)[] = [];
    const f = filter;
    if (f.type !== 'both') {
        conditions.push('type = ?');
        params.push(f.type);
    }
    if ('picTotal' in f && f.picTotal != null) {
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
    if ('mediaTotal' in f && f.mediaTotal != null) {
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
    if (f.secret) {
        conditions.push('secret = 1');
    }
    if (f.hasLbs) {
        conditions.push('lbs IS NOT NULL');
    }
    if (f.withLink) {
        conditions.push("(content LIKE '%http%' OR content LIKE '%链接%')");
    }
    if (f.withAt) {
        conditions.push("content LIKE '%@%'");
    }
    if (f.date) {
        if (Array.isArray(f.date)) {
            // 区间模式: [startTs, endTs]
            conditions.push('created_time BETWEEN ? AND ?');
            params.push(Math.floor(f.date[0] / 1000), Math.floor(f.date[1] / 1000));
        } else {
            // 单日模式: {year, month, day}
            const startTs = Math.floor(new Date(f.date.year, f.date.month - 1, f.date.day).getTime() / 1000);
            const endTs = Math.floor(new Date(f.date.year, f.date.month - 1, f.date.day, 23, 59, 59).getTime() / 1000);
            conditions.push('created_time BETWEEN ? AND ?');
            params.push(startTs, endTs);
        }
    }
    if ('likes' in f && f.likes != null) {
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
    if ('comments' in f && f.comments != null) {
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
    if ('fwds' in f && f.fwds != null) {
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
    if ('shareSource' in f && f.shareSource) {
        conditions.push("share_source LIKE ?");
        params.push(`%"${f.shareSource}"%`);
    }
    return { where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', params };
};

function parseRow(row: any): postType {
    const base = {
        uni_key: row.uni_key,
        tid: row.tid,
        uin: row.uin,
        nickname: row.nickname,
        content: row.content,
        created_time: row.created_time,
        likes: JSON.parse(row.likes || '[]'),
        like_total: row.like_total,
        comments: JSON.parse(row.comments || '[]'),
        comment_total: row.comment_total,
        images: JSON.parse(row.images || '[]'),
        image_total: row.image_total,
    };
    if (row.type === 'shuoshuo') {
        return {
            ...base,
            type: 'shuoshuo',
            video: JSON.parse(row.video || '[]'),
            video_total: row.video_total,
            last_modify: row.last_modify,
            source_name: row.source_name,
            secret: row.secret === 1,
            lbs: row.lbs ? JSON.parse(row.lbs) : { name: '', pos_x: '', pos_y: '' },
            conlist: JSON.parse(row.conlist || '[]'),
            fwd_num: row.fwd_num,
        };
    }
    return {
        ...base,
        type: 'share',
        share_source: row.share_source ? JSON.parse(row.share_source) : { title: '', desc: '', url: '', from: { url: '', name: '' } },
    };
};

export async function get(data: reqListType, db: Database): Promise<postType[]> {
    const { where, params } = buildWhereClause(data.filter);
    let sql = `SELECT * FROM posts ${where} ORDER BY created_time DESC`;
    if (data.range) {
        sql += ` LIMIT ? OFFSET ?`;
        params.push(data.range[1] - data.range[0] + 1, data.range[0]);
    }
    const rows = db.query(sql).all(...params) as any[];
    return rows.map(parseRow);
};

export async function count(filter: filterRangeReqType, db: Database): Promise<filterRangeCbType> {
    const { where, params } = buildWhereClause(filter.other);
    const rangeType = filter.getRange;
    if (rangeType === 'date') {
        if (filter.dateViewableRange) {
            const [startTs, endTs] = filter.dateViewableRange;
            const startTime = Math.floor(startTs / 1000);
            const endTime = Math.floor(endTs / 1000);
            const whereClause = where ? `${where} AND` : 'WHERE';
            const sql = `SELECT strftime('%Y-%m-%d', datetime(created_time, 'unixepoch', 'localtime')) as day, COUNT(*) as count FROM posts ${whereClause} created_time BETWEEN ? AND ? GROUP BY day ORDER BY day`;
            const rows = db.query(sql).all(...params, startTime, endTime) as any[];
            const result: { [key: number]: number } = {};
            for (const row of rows) {
                const [year, month, day] = row.day.split('-').map(Number);
                result[year * 10000 + month * 100 + day] = row.count;
            }
            return result;
        }
        const sql = `SELECT strftime('%Y-%m', datetime(created_time, 'unixepoch', 'localtime')) as month, COUNT(*) as count FROM posts ${where} GROUP BY month ORDER BY month`;
        const rows = db.query(sql).all(...params) as any[];
        const result: { [key: number]: number } = {};
        for (const row of rows) {
            const [year, month] = row.month.split('-').map(Number);
            result[year * 100 + month] = row.count;
        }
        return result;
    }
    if (rangeType === 'shareSource') {
        const whereClause = where ? `${where} AND` : 'WHERE';
        const sql = `SELECT DISTINCT json_extract(share_source, '$.from.name') as source FROM posts ${whereClause} share_source IS NOT NULL`;
        const rows = db.query(sql).all(...params) as any[];
        return rows.map(r => r.source).filter(Boolean);
    }
    const fieldMap: Record<string, string> = {
        pic: 'image_total',
        media: 'video_total',
        likes: 'like_total',
        comments: 'comment_total',
        fwds: 'fwd_num',
    };
    const field = fieldMap[rangeType];
    const sql = `SELECT MIN(${field}) as min, MAX(${field}) as max FROM posts ${where}`;
    const row = db.query(sql).get(...params) as any;
    return [row?.min ?? 0, row?.max ?? 0];
};

export async function range(data: filterType, db: Database): Promise<postType[]> {
    const { where, params } = buildWhereClause(data);
    const sql = `SELECT * FROM posts ${where} ORDER BY created_time DESC`;
    const rows = db.query(sql).all(...params) as any[];
    return rows.map(parseRow);
};

if (import.meta.main) {
    const db = new Database('./examples/qzone_data.db');
    // 测试 get
    const result = await get({
        filter: { type: 'both', secret: false, hasLbs: false, withLink: false, withAt: false },
        range: [0, 2],
    }, db);
    console.log('get:', result.length, '条');
    // 测试 get - likes 范围 [5, 'inf']
    const likesInfResult = await get({
        filter: { type: 'both', secret: false, hasLbs: false, withLink: false, withAt: false, likes: [5, 'inf'] },
        range: [0, 2],
    }, db);
    console.log('get likes >= 5:', likesInfResult.length, '条');
    // 测试 count - date (按月)
    const dateByMonth = await count({
        other: { type: 'both', secret: false, hasLbs: false, withLink: false, withAt: false, content: '' },
        getRange: 'date',
    }, db);
    console.log('count date (month):', dateByMonth);
    // 测试 count - date (按天)
    const dateByDay = await count({
        other: { type: 'both', secret: false, hasLbs: false, withLink: false, withAt: false, content: '' },
        getRange: 'date',
        dateViewableRange: [new Date(2024, 0, 1).getTime(), new Date(2024, 0, 31).getTime()],
    }, db);
    console.log('count date (day):', dateByDay);
    // 测试 count - likes [min, max]
    const likesRange = await count({
        other: { type: 'both', secret: false, hasLbs: false, withLink: false, withAt: false, content: '' },
        getRange: 'likes',
    }, db);
    console.log('count likes range:', likesRange);
    // 测试 count - pic [min, max]
    const picRange = await count({
        other: { type: 'both', secret: false, hasLbs: false, withLink: false, withAt: false, content: '' },
        getRange: 'pic',
    }, db);
    console.log('count pic range:', picRange);
    // 测试 count - shareSource
    const shareSources = await count({
        other: { type: 'share', secret: false, hasLbs: false, withLink: false, withAt: false, content: '' },
        getRange: 'shareSource',
    }, db);
    console.log('count shareSource:', shareSources);
    // 测试 range
    const rangeResult = await range({ type: 'shuoshuo', secret: true, hasLbs: false, withLink: false, withAt: false }, db);
    console.log('range (secret shuoshuo):', rangeResult.length, '条');
    // 测试 range - pic 范围 [3, 5]
    const picRangeResult = await range({ type: 'shuoshuo', secret: false, hasLbs: false, withLink: false, withAt: false, picTotal: [3, 5] }, db);
    console.log('range pic [3,5]:', picRangeResult.length, '条');
    db.close();
};