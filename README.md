# 计算机组成原理刷题 PWA

由原单文件 `计算机组成原理.html`（394/408 题硬编码、2000+ 行）重构而来的渐进式 Web 应用（PWA）。

## 目录结构

```
jzyl-pwa/
├── index.html              # 页面外壳（无内嵌题目）
├── manifest.webmanifest    # PWA 清单：图标、主题色、standalone 模式
├── sw.js                   # Service Worker：预缓存全部资源，首访后离线可用
├── serve.cjs               # 零依赖本地静态服务器
├── 启动刷题.bat             # Windows 双击启动（自动选 Node/Python 并打开浏览器）
├── css/style.css           # 全部样式（含移动端专项适配）
├── js/app.js               # 应用逻辑
├── data/
│   ├── chapters.json       # 27 个章节元信息（名称、题数）
│   └── ch0.json … ch26.json# 按章节拆分的题目，切换时按需 fetch
└── icons/                  # 192/512/maskable 图标 + SVG
```

## 如何运行

PWA 的 `fetch` 与 Service Worker 要求 http(s) 环境，**不能直接双击 index.html（file:// 会被浏览器拦截）**。三选一：

1. **Windows 双击 `启动刷题.bat`**（本机有 Node.js 或 Python 即可，自动打开浏览器）。
2. 命令行：`node serve.cjs` 或 `python -m http.server 8765`，浏览器访问 `http://127.0.0.1:8765/index.html`。
3. 把整个文件夹部署到任意静态托管（GitHub Pages / Netlify / 校园服务器）。

## 手机上“安装”与离线使用

1. 用手机浏览器访问部署后的地址（或与电脑同一 Wi‑Fi 下访问电脑 IP）。
2. 首次打开后，Service Worker 会把全部 27 章题目缓存到本机，此后断网也能刷题。
3. iPhone：Safari 分享 →「添加到主屏幕」；Android：Chrome 菜单 →「添加到主屏幕/安装应用」。之后从桌面图标进入即全屏运行，无浏览器地址栏。

## 对照《方式.md》落实的优化

| 方面 | 做法 |
|---|---|
| 数据/视图分离 | 408 题拆为 27 个 JSON，按章 `fetch` 并内存缓存，不重复请求 |
| 渲染性能 | 每批 10 条 `requestAnimationFrame` 分片插入；卡片 `content-visibility:auto`；只保留当前章 DOM，切走即释放 |
| 事件绑定 | 选项点击统一委托到题目容器（1 个监听器替代 1600+） |
| 搜索 | 加载章节时构建中文双字（bigram）倒排索引，交集定位 + 完整短语校验，200ms 防抖 |
| 状态存储 | IndexedDB 异步持久化（localStorage 兜底），自动迁移旧版 localStorage 进度；每答一题即时保存；支持导出/导入 JSON 备份 |
| 离线 | Service Worker install 阶段预缓存外壳+全部章节（共 37 个资源），缓存优先、网络回退并回填，导航请求离线回退首页 |
| 移动端导航 | 27 个挤压标签改为：桌面横滑标签条；手机端「☰ 目录」抽屉（带每章进度）+ 上一章/下一章 + 左右滑动手势 |
| 移动端交互 | 选项最小高度 44px、按下缩放反馈、`viewport-fit=cover` + safe-area、键盘弹起不遮挡、记住上次章节并定位到首道未答题 |
| 其他 | 保留 A/B/C/D 快捷键并新增 ←/→ 切章；在线/离线状态徽标；暗色模式；返回顶部；筛选（全部/已答/未答/错题/正确） |

## 数据说明

- 题库逐题从原 HTML 提取，脚本校验了每章题数与原标签标注一致，总计 **27 章 408 题**（原页头“26 组 394 题”为旧文案，已更正）。
- 答题记录结构与旧版兼容：`{ 章节序号: { 题号: { userAnswer, correct } } }`。
