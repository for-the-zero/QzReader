# QzReader

QQ空间数据本地查看器，配合 [QZoneExport](https://github.com/ShunCai/QZoneExport)导出助手使用

## 功能

- JSON 转 SQLite：将导出的说说/分享 JSON 文件转换为数据库
- 浏览：分页查看、多条件筛选（日期、图片数、点赞数、关键词等）
- 抽卡：随机查看一条说说
- 统计：发说说时间分布、最活跃时段、点赞评论分布、emoji使用统计等

## 运行

需要 Bun 环境。

```bash
bun install
bun dev
```

打开 http://localhost:3000

## 使用流程

1. 用 QZoneExport 导出说说和分享的 JSON 文件
2. 在首页点击「选择文件」导入 JSON，程序会转换为 SQLite 并保存
3. 选择生成的 .db 文件
4. （可选）选择本地图片文件夹，用于显示本地图片
5. 开始浏览

## 图片显示优先级

1. 本地图片文件夹（如果配置）
2. 在线图片（需开启「使用在线图片」，可能触发风控）

## 技术栈

- 后端：Bun + SQLite
- 前端：React + shadcn/ui + Tailwind CSS + Framer Motion

---

上面是AI生成的，我来补充一点

这个项目使用了AI辅助开发其中`frontend\appComponents\sub\filter.tsx` `frontend\appComponents\Analysis.tsx` `frontend\appComponents\Browse.tsx` `frontend\appComponents\Random.tsx` `examples` `backend\convert.ts` `backend\get.ts` `build.ts`均由AI完成

你也可以到Release下载打包好的版本