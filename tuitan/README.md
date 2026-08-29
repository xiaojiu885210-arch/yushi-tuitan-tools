# 推探 tuitan v1.0.0

X（Twitter）创业博主探盘。中英双路搜索高播放、高点赞、高收藏的账号和帖子。

## 下载（不会过期）

https://github.com/xiaojiu885210-arch/yushi-tuitan-tools/releases/download/v1.0.0/tuitan-1.0.0.zip

仓库：https://github.com/xiaojiu885210-arch/yushi-tuitan-tools

## 启动

需要 Node.js 20+。

```bash
unzip tuitan-1.0.0.zip
cd tuitan
npm install
npm run dev
```

浏览器打开提示的本地地址（默认 8080）。第一次会写入创业博主资料库，立刻能搜。

## 怎么用

1. **搜索** 输入中文即可，例如「独立开发」「出海」「AI 创业」。
2. 推探会同时跑四条车道：中文、英文对照、话题标签、账号名。
3. 结果按播放、点赞、收藏（权重最高）打热度。
4. **接入** 可贴自己的 X Bearer Token 做实搜；不贴也能用资料库。

Token 只存在这台浏览器，不会写入博主库。

## Token 从哪来

1. 打开 https://developer.x.com 用自己的 X 账号登录。
2. 建一个 App，开通 Read。
3. 复制 Bearer Token（不要 Access Secret）。
4. 套餐需要带 `tweets/search/recent` 才能实搜帖子。
