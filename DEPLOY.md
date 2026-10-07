# 部署清单（六爻排盘 PWA → GitHub Pages）

> 每次改动后**按序执行**，漏一步都可能导致用户端不更新。

## 部署步骤

1. **改代码**（`index.html` / 图标 / manifest 等）
   - ⚠️ 算法层（历法/纳甲/六亲/世应/六神/旬空/纳音/动爻变爻/伏藏/阴历/神煞）**不要动**；确需改动 → 先回 mingli-engineer 确认 + 跑回归。
2. **🔴 递增 `sw.js` 的 `VERSION`**（v1→v2→v3…）——**强制步骤，每次必做**
   - 原因：已装 PWA 的用户端 SW 是 cache-first，版本号不变就会继续发旧缓存，服务器文件再新也没用。
   - 局域网版（http://）无 SW 不受影响，所以本地测试发现不了这个问题——**别被本地正常骗了**。
3. **本地跑回归**：`node ~/.openclaw/tmp/liuyao-regression/run.js ./index.html out.json` → 6/6 PASS 且与基线 diff 为空。
4. **提交推送**：`git add -A && git commit -m "..." && git push origin main`
5. **等构建**：`gh api repos/liuyuanchendao-art/liuyao-paipan/pages/builds/latest --jq .status` → `built`
6. **公网验证**：
   - `curl` 首页 200、与本地 `index.html` 逐字节一致；
   - `curl sw.js` 确认是**新版本号**；
7. **公网产物回归**：curl 拉公网 `index.html` 跑回归 → 6/6 PASS。
8. **喊 mingli-engineer 复验**（他会走"已装 SW"的路径验）。

## 备注

- 公网地址：https://liuyuanchendao-art.github.io/liuyao-paipan/
- repo：https://github.com/liuyuanchendao-art/liuyao-paipan（public，main，Pages 根目录，`.nojekyll` 已加）
- 局域网兜底：http://192.168.31.192:8137/（`python3 -m http.server 8137`，http 下 SW 不注册属正常）
- 回归器：`~/.openclaw/tmp/liuyao-regression/run.js`（Node + vm + DOM stub）
