# 鱼市雷达 yushi-radar v1.0.0

闲鱼类目价格与近期排行工作台。选类目、采商品、看排行和价格带，商品库可导出 CSV。

## 下载（不会过期）

https://github.com/xiaojiu885210-arch/yushi-tuitan-tools/releases/download/v1.0.0/yushi-radar-1.0.0.zip

仓库：https://github.com/xiaojiu885210-arch/yushi-tuitan-tools

## 启动

需要 Node.js 20+。

```bash
unzip yushi-radar-1.0.0.zip
cd yushi-radar
npm install
npm run dev
```

浏览器打开提示的本地地址（默认 8080）。第一次会写入演示商品库，立刻能看排行和行情。

## 怎么用

1. **采集** → 选类目 / 关键词 / 时间窗。
2. 三种数据源：
   - **本机闲鱼**：打开闲鱼搜索页，把「鱼市回传」书签拖到书签栏，在闲鱼页点一下，商品回传入库。
   - **演示库**：不开闲鱼也能练手。
   - **Cookie 接口**：在「接入」粘贴闲鱼网页 Cookie。机房 IP 常被滑块拦，拦了就改用本机书签。
3. **排行** 看近期想要数；**行情** 看价格带；**商品库** 搜索、排序、导出 CSV。

Cookie 只存在这台浏览器，不会写入商品库。

## 注意

闲鱼对数据中心 IP 有滑块（Baxia）。完整实搜路径是：**本机浏览器 + 书签回传 / 粘贴 JSON**。Cookie 直连只在本机网络偶尔可用。
