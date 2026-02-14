# QQ空间数据库表结构设计

---

## posts 主表

存储说说和分享的统一数据，通过 `type` 字段区分类型。

| 字段名 | 类型 | 注释 |
|--------|------|------|
| `uni_key` | 文本 | 说说访问URL |
| `type` | 文本 | 类型：`shuoshuo` 或 `share` |
| `tid` | 文本 | 说说唯一标识ID / 分享ID |
| `uin` | 文本 | 发布者QQ号 |
| `nickname` | 文本 | 发布者昵称 |
| `content` | 文本 | 内容（说说文本 / 分享描述） |
| `created_time` | 整数 | 创建时间戳（秒级） |
| `likes` | JSON | 点赞列表，见 [点赞结构](#点赞结构-likes) |
| `like_total` | 整数 | 点赞总数 |
| `comments` | JSON | 评论列表，见 [评论结构](#评论结构-comments) |
| `comment_total` | 整数 | 评论总数 |
| `images` | JSON | 图片列表，见 [图片结构](#图片结构-images) |
| `image_total` | 整数 | 图片总数 |
| `video` | JSON | 视频列表（仅说说），见 [视频结构](#视频结构-video) |
| `video_total` | 整数 | 视频总数（仅说说） |
| `last_modify` | 整数 | 最后修改时间戳（仅说说） |
| `source_name` | 文本 | 发布来源设备/应用（仅说说） |
| `secret` | 布尔 | 是否私密：0否 / 1是（仅说说） |
| `lbs` | JSON | 位置信息（仅说说），见 [位置结构](#位置结构-lbs) |
| `conlist` | JSON | 内容片段列表（仅说说），见 [内容片段结构](#内容片段结构-conlist) |
| `fwd_num` | 整数 | 转发数量（仅说说） |
| `share_source` | JSON | 分享来源信息（仅分享），见 [分享来源结构](#分享来源结构-share_source) |


---

## JSON 子结构定义

### 位置结构 (lbs)

```json
{
    "name": "位置名称",
    "pos_x": "经度",
    "pos_y": "纬度"
}
```

### 内容片段结构 (conlist)

```json
[
    {
        "con": "文本内容",
        "type": 2,
        "custom_display": "显示文本"
    },
    {
        "type": 1,
        "url": "https://...",
        "text": "网页链接",
        "custom_display": "<a href='...'>网页链接</a>"
    },
    {
        "nick": "昵称",
        "type": 0,
        "uin": "QQ号",
        "custom_url": "http://user.qzone.qq.com/...",
        "custom_display": "<a href='...'>@昵称</a>"
    }
]
```

### 图片结构 (images)

说说图片与分享图片合并存储：

```json
[
    {
        "height": 1080,
        "width": 1920,
        "pic_id": "图片ID",
        "small_url": "小图URL",
        "url": "原图URL",
        "custom_url": "处理后URL",
        "mime_type": ".jpeg",
        "filename": "本地文件名"
    }
]
```

### 视频结构 (video)

```json
[
    {
        "cover_height": 720,
        "cover_width": 1280,
        "video_id": "视频ID",
        "video_time": "时长",
        "cover_filename": "封面文件名",
        "filename": "视频文件名"
    }
]
```

### 点赞结构 (likes)

```json
[
    {
        "fuin": 123456789,
        "nick": "点赞者昵称"
    }
]
```

### 评论结构 (comments)

说说评论与分享评论合并存储：

```json5
[
    {
        "content": "评论内容",
        "create_time": 1756275535,
        "name": "评论者昵称",
        "reply_num": 2,
        "tid": 1, // 评论ID
        "uin": 123456789,
        "replies": [] // 嵌套子评论，结构相同
    }
]
```

### 分享来源结构 (share_source)

```json
{
    "title": "分享标题",
    "desc": "播放量/点赞等描述",
    "url": "分享链接URL",
    "from": {
        "url": "来源URL",
        "name": "来源平台名称"
    }
}
```

---

## 字段来源对照表

| 字段名 | 说说来源 | 分享来源 |
|--------|----------|----------|
| `uni_key` | `uniKey` | `uniKey` |
| `uin` | `uin` | `uin` |
| `nickname` | `name` | `nickname` |
| `content` | `content` | `desc` |
| `created_time` | `created_time` | `shareTime` |
| `likes` | `likes` | `likes` |
| `like_total` | `likeTotal` | `likeTotal` |
| `comments` | `commentlist` | `comments` |
| `comment_total` | `cmtnum` | `commentTotal` |
| `images` | `pic` | `source.images` |
| `video` | `video` | - |
| `video_total` | `videototal` | - |
| `last_modify` | `lastmodify` | - |
| `source_name` | `source_name` | - |
| `secret` | `secret` | - |
| `lbs` | `lbs` | - |
| `conlist` | `conlist` | - |
| `fwd_num` | `fwdnum` | - |
| `image_total` | `imagetotal` | - |
| `share_source` | - | `source` |