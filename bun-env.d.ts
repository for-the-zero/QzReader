declare module "*.svg" {
    const path: `${string}.svg`;
    export = path;
};
declare module "*.module.css" {
    const classes: { readonly [key: string]: string };
    export = classes;
};

interface glbStateType {
    usable: boolean,
    serverUrl: string,
    allowOnline: boolean,
    filter: filterType,
};
interface serverConfigType {
    dbPath: string | null,
    picPath: string | null,
};
interface filterType {
    type: 'shuoshuo' | 'share' | 'both',
    picTotal?: number | [number, number | 'inf'] | null, // shuoshuo only(tick it) // switchable(exact or range)
    mediaTotal?: number | [number, number | 'inf'] | null, // shuoshuo only(tick it) // switchable(exact or range)
    secret: boolean, // shuoshuo only(tick it) // 是否只查看私密的
    hasLbs: boolean, // shuoshuo only(tick it) // 是否只查看有位置的
    withLink: boolean, // shuoshuo filter + all shares // 是否只查看有链接的
    withAt: boolean, // 是否只查看有@的
    date?: {year: number, month: number, day: number} | [number, number] | null, // single day or [startTs, endTs] range
    likes?: number | [number, number | 'inf'] | null, // switchable(exact or range)
    comments?: number | [number, number | 'inf'] | null, // switchable(exact or range)
    fwds?: number | [number, number | 'inf'] | null, // switchable(exact or range)
    content?: string | null,
    shareSource?: string | null, // shares only(tick it)
};
interface filterRangeReqType {
    other: {
        type: 'shuoshuo' | 'share' | 'both',
        picTotal?: number | [number, number],
        mediaTotal?: number | [number, number],
        secret: boolean,
        hasLbs: boolean,
        withLink: boolean,
        withAt: boolean,
        date?: {month: number, year: number},
        likes?: number | [number, number],
        comments?: number | [number, number],
        fwds?: number | [number, number],
        content: string,
        shareSource?: string,
    },
    getRange: 'pic' | 'media' | 'likes' | 'comments' | 'fwds' | 'date' | 'shareSource',
    dateViewableRange?: [number, number], // [startTimestamp, endTimestamp] in milliseconds
};
type filterRangeCbType = [number, number] | {[key: number]: number} | string[]; // other | 'date' | 'shareSource'
interface reqListType {
    filter: filterType,
    range?: [number, number],
    index?: number,
};

type postImage = { height: number, width: number, pic_id: string, small_url: string, url: string, custom_url?: string, mime_type: string, filename?: string };
type postVideo = { cover_height: number, cover_width: number, video_id: string, video_time: string, cover_filename?: string, filename?: string };
type postLike = { fuin: number, nick: string };
type postComment = { content: string, create_time: number, name: string, reply_num: number, tid: number, uin: number, replies: postComment[] };
type postShareSource = { title: string, desc: string, url: string, from: { url: string, name: string } };
interface postBase {
    uni_key: string,
    tid: string,
    uin: string,
    nickname: string,
    content: string,
    created_time: number,
    likes: postLike[],
    like_total: number,
    comments: postComment[],
    comment_total: number,
    images: postImage[],
    image_total: number,
};
interface shuoshuoType extends postBase {
    type: 'shuoshuo',
    video: postVideo[],
    video_total: number,
    last_modify: number,
    source_name: string,
    secret: boolean,
    lbs: { name: string, pos_x: string, pos_y: string },
    conlist: { con?: string, type: number, custom_display?: string, url?: string, text?: string, nick?: string, uin?: string, custom_url?: string }[],
    fwd_num: number,
};
interface shareType extends postBase {
    type: 'share',
    share_source: postShareSource,
};
type postType = shuoshuoType | shareType;