# 唐卡数字展馆 · Tangka Digital Museum

独立运行的交互式三维唐卡展厅。传统藏式色彩与现代数字空间相结合。无需原平台、登录、数据库或后端。包含 20 件 The Met 开放馆藏，侧墙各8件、后方4件；图片完整等比展示。

## 技术与功能

Vue 3、TypeScript、Vite、Three.js、OrbitControls、Raycaster。完整室内空间、多层画框及暖色灯具（最多6盏实时聚光灯复用）；自由观察、点击聚焦、高亮、档案面板、原始馆藏链接、复位、缩放和全屏。左侧作品索引可用键盘操作；触屏支持单指旋转、双指缩放和平移。拖动超过 6px 或多指操作不会触发作品点击。

展厅使用约625像素的本地标准图，详情按需载入最长2200像素的馆方原图压缩版本（尊重原始尺寸，不放大）。图像以两条并行队列渐进载入；侧栏图像懒加载；像素比最高 1.65，无实时阴影；尺寸自适应并在卸载时释放 Three.js 资源。无数据、图像失败、WebGL 初始化失败时有提示。

## 20件作品与五类题材

坛城、佛陀、菩萨与女尊、护法、上师，每类4件。左侧选择题材会筛选作品索引与三维作品，并定位到对应陈列区域（侧墙题材定位首件作品，坛城展示后墙全组）；“初始视角”恢复全部20件。题材归类是本展馆的浏览组织方式，不宣称为馆方原始分类。

详情新增馆方原文尺寸、入藏说明、工艺种类、材质词语解释和细节观看建议。结构化信息附馆方API及原始馆藏页；对未知颜料、针法、制作工时及专属文化寓意不作推断。布本绘画、缂丝、刺绣的差异由材料记录解释，不把通用知识当成单件作品的检测结论。

## 三维空间与工艺观察

扩建展厅包含分层藻井、悬挂灯具、柱础与柱头、入口格栅屏风、多组软垫坐凳、木质地板、地毯边饰及多层金色画框。两座工艺台展示织架经线、绷布结构和简化工具，均明确标注“教学示意模型”。它们由Three.js几何体生成，不是真实馆藏、历史建筑复原或某件作品的制作流程复原。

地板接缝、墙饰及经线使用InstancedMesh减少重复绘制，20组灯具中复用最多6盏实时聚光灯，保留渐进图片载入及资源清理。

## 本地运行

Node.js 20.19+ 或 22，npm。所有命令在本目录执行：

```powershell
cd F:\code\Tangka-Digital-Museum
npm install
npm run dev
```

默认 http://127.0.0.1:5173/ ，端口占用时以终端显示为准。停止：在启动终端按 Ctrl+C。

```powershell
npm run build
npm run preview
```

产物为 dist；预览默认 http://127.0.0.1:4173/ 。无需 .env 或密钥。

## 操作

左键拖动旋转、滚轮缩放、右键拖动平移。点击画作显示档案并平滑聚焦；Esc 或右上关闭可继续观察。顶部/右下复位，右下加减缩放。全屏需浏览器授权并由点击触发。小屏幕侧栏覆盖部分画布，关闭后继续完整观察。

## 目录

```text
src/
  App.vue                  界面与馆藏载入
  components/ArtworkDetail.vue
  museum/architecture.ts   建筑、材质与基础照明
  museum/exhibits.ts        作品布局、标签与纹理队列
  museum/Museum.ts          相机、鼠标拾取与资源生命周期
  types.ts
  style.css
public/
  artworks.json            独立馆藏数据
  artworks/                20件作品的标准图及高清图
  provenance/met-evidence.json  许可和原图校验证据
.github/workflows/deploy.yml
ATTRIBUTION.md
PROJECT_PROGRESS_SUMMARY.md
tests/                     浏览器验收
verification/              验收结果与本地截图
```

## 馆藏与版权

详见 [ATTRIBUTION.md](ATTRIBUTION.md)。图像及基础元数据按 The Met Open Access / CC0 使用；题名中文为编辑译名。年代、材质、地区、机构、编号来自馆方记录，作品专属文化寓意未核实时留空。没有将未经确认素材或全项目声明为开放许可。仅复制公开馆藏与图像，不包含原平台的代码、配置、用户数据或密钥。

## GitHub 仓库与更新

源码已推送至 [cosmicdust17/TangkaDigitalMuseum](https://github.com/cosmicdust17/TangkaDigitalMuseum)，本地 main 跟踪 origin/main。首次源码提交：459c419。用户已明确授权上传独立展馆源码与本项目收录的已核验CC0馆藏图像。

**在线展馆：[https://cosmicdust17.github.io/TangkaDigitalMuseum/](https://cosmicdust17.github.io/TangkaDigitalMuseum/)**

2026-11-17 已发布20件扩展版本，公网7组真实Edge/WebGL浏览器验收全部通过，报告见 verification/expansion-online-results.json（最初8件版本报告亦保留）。后续更新：

```powershell
git status
git add .
git commit -m "Update Tangka Digital Museum"
git push
```

执行前检查暂存内容，只包含独立项目。node_modules、dist、.env、编辑器配置、测试浏览器缓存及下载的未压缩原图均已排除。仓库原本为public，本次没有修改仓库可见性。

## GitHub Pages

1. 本仓库已启用 GitHub Actions 发布模式；重建仓库时在 Settings → Pages → Build and deployment → Source 选 GitHub Actions。
2. 提交并推送 main，或在 Actions 手动运行 Deploy museum to GitHub Pages。
3. 工作流使用 Node 22、npm ci、官方 configure-pages/upload-pages-artifact/deploy-pages，dist 上传并部署。
4. 工作流根据实际仓库名设置 VITE_BASE_PATH 为 /仓库名/；本地默认相对路径 ./。所有图片、JSON、脚本和样式使用同一 base，无后端 API 或页面路由。仅 GitHub Pages 发布地址为真实在线地址，不预设或虚构。
5. 部署成功后打开工作流输出的地址，验收图像、自由观察及详情。后续 main 的 push 自动更新。仓库名改变无需改代码；若改为账号根站点或自定义域名，将工作流 base 调整为 /。

模拟仓库子路径构建：

```powershell
$env:VITE_BASE_PATH='/TangkaDigitalMuseum/'
npm run build
npm run preview
# 停止预览后再清除：Remove-Item Env:VITE_BASE_PATH
# 打开 http://127.0.0.1:4173/TangkaDigitalMuseum/
```

## 自动验收

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"
npx playwright install chromium
npm test
# 本机已有 Edge 可直接运行：
$env:PLAYWRIGHT_CHANNEL="msedge"
npm test
```

测试实际启动浏览器与 WebGL（无独立显卡的自动测试使用软件渲染），覆盖数据对应、选择切换、画布拾取、旋转/缩放/平移、复位和不同屏幕；与本机 GPU 性能评测分开看待。验收范围和限制见 PROJECT_PROGRESS_SUMMARY.md。本地开发版、生产子路径及公网版本均已有验收报告；硬件性能与触屏实机验证边界见进度记录。
