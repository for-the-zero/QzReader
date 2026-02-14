> [!NOTE]
>
> 由GLM-5通过iflow Cli生成，由我修改
>
> 只保留部分

# QQ空间数据结构文档

本文档描述 `说说_1mb.json` 和 `shares_0.5mb.json` 的数据结构。

---

## 1. 说说数据结构

顶层是一个**数组**，每个元素代表一条说说。

### 说说主字段

- `cmtnum` (number): 评论数量
- `commentlist` (array): 原始评论列表，见 [评论结构](#评论结构-commentlist--custom_comments)
- `conlist` (array): 内容片段列表，见 [内容片段结构](#内容片段结构-conlist)
- `content` (string): 说说文本内容（原始）
- `created_time` (number): 创建时间戳（秒级）
  - 示例: `1756275491`
- `fwdnum` (number): 转发数量
- `lastmodify` (number): 最后修改时间戳
  - 示例: `0`, `1756275600`
- `lbs` (object): 位置信息，见 [位置结构](#位置结构-lbs)
- `name` (string): 发布者昵称
- `pic` (array): 图片列表（原始），见 [图片结构](#图片结构-pic)
- `secret` (number): 是否私密
  - 示例: `0`, `1`
- `source_name` (string): 发布来源设备/应用
  - 示例: `"iQOO Neo9"`
- `tid` (string): 说说唯一标识ID
  - 示例: `"ca45a59f23a3ae68b1560c00"`, `"abc123def456"`
- `uin` (number): 发布者QQ号
  - 示例: `2678408650`, `123456789`
- `imagetotal` (number): 图片总数
- `videototal` (number): 视频总数
- `video` (array): 视频列表，见 [视频结构](#视频结构-video)
- `uniKey` (string): （可访问的说说URL）
  - 示例: `"http://user.qzone.qq.com/2678408650/mood/ca45a59f23a3ae68b1560c00"`
- `likes` (array): 点赞列表，见 [点赞结构](#点赞结构-likes)
- `likeTotal` (number): 点赞总数

---

### 评论结构 (commentlist)

评论是一个**数组**，每个元素代表一条评论。

- `content` (string): 评论内容
- `create_time` (number): 创建时间戳（秒级）
  - 示例: `1756275535`, `1756200000`
- `name` (string): 评论者昵称
- `reply_num` (number): 回复数量
- `tid` (number): 评论ID
  - 示例: `1`, `123`
- `uin` (number): 评论者QQ号
  - 示例: `2964774820`, `123456789`
- `list_3`：回复，嵌套这个数据

---

### 内容片段结构 (conlist)

```json

    {
        "con": "文本",
        "type": 2,
        "custom_display": "文本"
    },
    {
        "type": 1,
        "url": "https://...",
        "text": "网页链接",
        "custom_display": "<a href='...' target='_blank'>网页链接</a>"
    },
    {
        "nick": "昵称",
        "type": 0,
        "uin": "1145141919810（QQ号）",
        "custom_url": "http://user.qzone.qq.com/1145141919810",
        "custom_display": "<a href='https://user.qzone.qq.com/1145141919810' target='_blank'>@昵称</a>"
    },
```

---

### 位置结构 (lbs)

- `name` (string): 位置名称
  - 示例: `""`, `"西湖"`
- `pos_x` (string): 经度
  - 示例: `""`, `"120.1551"`
- `pos_y` (string): 纬度
  - 示例: `""`, `"30.2741"`

---

### 图片结构 (pic / custom_images)

图片是一个**数组**，每个元素代表一张图片。

- `height` (number): 图片高度（像素）
- `width` (number): 图片宽度（像素）
- `pic_id` (string): 图片ID(注：可以访问)
- `smallurl` (string): 小图URL
- `url1` (string): 图片URL
- `custom_url` (string): 处理后的图片URL(注：不知道有什么区别)
- `custom_mimeType` (string): 图片扩展名
  - 示例: `".jpeg"`, `".png"`, `".gif"`
- `custom_filename` (string): 本地文件名
  - 示例: `"3A2C57A7.jpeg"`, `"057062E2.png"`

### 视频结构 (video)

视频是一个**数组**，每个元素代表一个视频。

- `cover_height`: 封面
- `cover_width`: 封面
- `video_id`: id，可用于查找视频
- `video_time`: 视频时间
- `custom_pre_filename`: 封面图
- `custom_filename`: 视频名称

---

### 点赞结构 (likes)

点赞是一个**数组**，每个元素代表一个点赞用户

- `fuin` (number): 点赞者QQ号
  - 示例: `2964774820`, `123456789`, `987654321`
- `nick` (string): 点赞者昵称
  - 示例: `"RhoPaper"`, `"小明"`, `"User123"`

---

## 2. 分享数据结构

顶层是一个**数组**，每个元素代表一条分享。

### 分享主字段

- `id` (number): 分享ID
  - 示例: `1756092307`, `1755758156`, `1755712930`
- `uin` (string): QQ号
- `nickname` (string): 发布者昵称
- `desc` (string): 分享描述
  - 示例: `"求你了不会翻译别翻"`, `"问号"`, `""`
- `source` (object): 分享来源内容，见 [分享来源结构](#分享来源结构-source)
- `shareTime` (number): 分享时间戳（秒级）
  - 示例: `1756092300`, `1755758100`, `1755712920`
- `likes` (array): 点赞列表，见 [点赞结构](#点赞结构-likes)
- `likeTotal` (number): 点赞总数
  - 示例: `0`, `1`, `10`
- `comments` (array): 评论列表
  - 示例: `[]`, `[{"content": "...", "name": "..."}]`
- `commentTotal` (number): 评论总数
  - 示例: `0`, `1`, `5`

---

### 分享来源结构 (source)

- `title` (string): 分享标题
  - 示例:  `"GitHub独立时代落幕"`
- `desc` (string): 分享来源描述（播放量/点赞等）
  - 示例: `"2.1万播放·962点赞·326弹幕"`, `""`
- `url` (string): 分享链接URL
  - 示例: `"http://mqqapi://microapp/open?mini_appid=1109937557&fakeUrl=https://m.q.qq.com/a/s/2b1f41298c701ea6ff0346f1588e5580"`
- `from` (object): 来源平台信息
  - `url` (string): 来源URL
  - `name` (string): 来源平台名称
- `images` (array): 分享封面图片列表，见 [分享图片结构](#分享图片结构-images)

---

### 分享图片结构 (images)

- `url` (string): 原始图片URL
  - 示例: `"https://qq.ugcimg.cn/v1/..."`
- `custom_url` (string): 处理后的图片URL
  - 示例: `"http://qq.ugcimg.cn/v1/..."`
- `custom_mimeType` (string): 图片MIME类型
  - 示例: `".jpeg"`, `".png"`
- `custom_filename` (string): 本地文件名
  - 示例: `"2DABC64E.jpeg"`, `"8479D8C5.jpeg"`

<!--根据@examples/json_structure.md，编写examples/db_table.md，规划数据库表头，将两个数据架构合二为一，一起存储，各自都要保留文档内的信息，用表格展示出来（表头名（英文）、类型（中文）、注释），（合适的地方可以直接放JSON，比如图片，然后标注JSON结构即可）-->