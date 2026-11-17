# 唐卡数字展馆进度

日期：2026-11-17；项目：F:\code\Tangka-Digital-Museum

## 已实现

- 完全独立 Vue 3 / TypeScript / Vite / Three.js 静态展馆，独立 package.json、lockfile、node_modules、配置、馆藏数据和 main 分支 Git 仓库；无后端、登录或原平台启动依赖。
- 单个完整室内空间：地面、墙面、天花、入口、几何边饰、画框、铭牌、8盏暖色作品灯；左3右3后2，中央观察空间与矮凳。
- OrbitControls 左键旋转、滚轮缩放、右键平移；限制缩放与旋转范围；复位、缩放按钮、全屏。Raycaster 点击具体作品、框体高亮、平滑聚焦、右侧档案、作品切换、关闭与 Esc。
- 指针移动累计超过6px或多指操作避免误点击；修复相机复位时残余惯性造成偏移的问题。
- 8件真实馆藏；8张约625px标准图和8张本地详情图，详情最长边2000～2200px，met-37820为900px原尺寸。等比压缩、不裁切、不放大，校验信息与馆方地址保留。中文题名注明为原项目编辑译名，专属寓意字段留空。
- 两条并行纹理队列、详情懒加载、高清失败回退标准图、像素比上限1.65、无实时阴影、尺寸监听、资源清理、空数据/错误数据/图片失败提示。
- README、ATTRIBUTION、GitHub Pages官方Actions流程；main push及手动触发；按仓库名生成base；dist产物。依赖与私密配置等已排除。
- 原平台仅只读检查并复制开放馆藏材料；没有修改原平台任何文件、接口、数据库或未提交改动。进度文件仅写入新项目。

## 已验证

- npm install 成功，npm run dev 成功，本地服务 http://127.0.0.1:5173/。
- vue-tsc 和 Vite 默认生产构建成功；显式 /Tangka-Digital-Museum/ base生产构建成功。
- 使用本机 Edge 无头浏览器和实际 WebGL 软件渲染验收，开发版6组全部通过；生产子路径6组全部通过。报告：verification/dev-results.json、verification/subpath-results.json。
- 验收覆盖8件本地图像HTTP200、所有详情图片成功解码、作品中英题名/编号/来源链接与JSON匹配、真实画布Raycaster拾取、切换、关闭、拖动防误触。
- 通过实际渲染图像变化验证左键旋转、滚轮缩放、右键平移、缩放按钮；复位后图像回到原视角；全屏进入与退出。
- 1920×1080、1366×768、390×844没有横向溢出，侧栏边界在屏幕内；截图位于verification目录。空数据、非法数据和图片全部请求失败的提示通过。
- 生产子路径下JS/CSS/JSON、全部展厅标准图与详情图成功加载，无首轮正常浏览的浏览器脚本异常。
- 8件馆方页面及Open Access政策已逐一打开；原始API快照公版标记和CC0记录对应；16张本地图像的SHA256与许可证据逐一核对。
- Git main 初始化成功；已关联用户提供的origin，尚无提交或推送。

## 最后视觉复核

- 发现侧墙作品在聚焦时与装饰柱重叠；已将侧墙作品移到 z=6、0、-6 的柱间位置。最终布局已重新通过开发版6组、生产子路径6组完整验收；TypeScript与生产构建通过；聚焦截图人工复核确认作品无遮挡。

## 剩余问题及验证边界

- 用户已创建GitHub仓库cosmicdust17/TangkaDigitalMuseum；尚未上传素材或源码；真正GitHub Actions远程运行和公网Pages地址须在用户确认公开范围并上传后验收。当前通过的是本地生产子路径模拟，不冒称已上线。
- 普通笔记本实体GPU帧率、其他浏览器、真实触屏手势尚未实机测量；本次软件渲染交互通过不能替代硬件性能测评。
- met-37820官方可取得原图仅900px，未伪造高清；作品专属文化寓意没有可靠资料时继续留空。
- Chromium测试浏览器下载遇网络超时，已停止；本机Edge完整验收通过，README包含Edge替代命令。

## 连接用户新建仓库（2026-11-17）

### 已实现
- README更新为真实仓库 cosmicdust17/TangkaDigitalMuseum，并将部署示例改为 /TangkaDigitalMuseum/。
- 已关联 origin：https://github.com/cosmicdust17/TangkaDigitalMuseum.git；不暂存、不提交、不推送，不变更远程公开权限。
- 原有Actions按实际仓库名生成base，无需修改应用代码。

### 已验证
- git ls-remote 和 HEAD只读检查成功，远程未公布任何分支或提交。

### 待验证及剩余问题
- origin关联成功；/TangkaDigitalMuseum/ 的 TypeScript检查和生产构建通过，Edge实际WebGL浏览器6组验收全部通过。报告：verification/repository-subpath-results.json。
- 上传候选文件清单已检查，未包含node_modules、dist、.env、浏览器缓存或原平台私有文件；暂存区为空。
- 遵循用户提供规则“不得自动提交、推送”，上传须由用户明确确认；仓库可见性、Pages设置和公网发布尚未验证。

## 用户授权首次上传

### 已实现
- 用户明确允许提交并推送独立展馆源码与已核验馆藏素材；本次仅操作独立仓库 main，不修改原平台，不改写历史。
- 准备首次提交并推送 origin/main；保留素材来源及许可证据，遵守.gitignore。

### 已验证
- 上传前 origin 精确匹配 https://github.com/cosmicdust17/TangkaDigitalMuseum.git，当前分支 main，远程仍为空。
- 实际仓库子路径的构建及6组浏览器验收沿用上一轮已通过结果；本次不修改应用代码。

### 待验证
- 提交和推送结果、Actions执行及公网Pages访问待检查，不提前声称发布成功。
