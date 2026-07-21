# Jiatong Wei Profile

这是 Leo 的个人主页源码，部署目标是：

`https://jiatong-wei.github.io/profile/`

源码位于仓库的 `0713/2025-blog-public-main/`，GitHub Pages 只发布该目录构建出的 `out/`。旧的 `0705` 站点在新站完成线上验证前保持不动。

## 内容结构

- `public/blogs/`：按 0713 模板展示的近期文章与学习笔记
- `src/app/projects/list.json`：按 0713 模板展示的项目卡片
- `content/wiki/`、`content/papers/`、`content/projects/`：保留给后续知识图谱与内容引擎使用的源材料
- `content/cv.md`：履历源材料

当前公开首页只展示 `public/blogs/` 与项目卡片中的内容。知识图谱和统一内容引擎仍保留在源码中，但暂不生成公开 Wiki、paper、tag 页面。真正私密的 vault 笔记不应放进公开仓库；`publish: false` 只是构建过滤，不是访问控制。

## 本地开发

```text
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm run build
pnpm run check:export
pnpm dev
```

本地开发地址默认是 `http://localhost:2025/profile/`。

## GitHub App 编辑

网页端只使用 GitHub App 的公开 App ID、仓库所有者、仓库名和分支名。App 只应安装到 `Jiatong-Wei/profile`，权限只需要 `Contents: Read and write`。

Private Key 只在浏览器内存中用于签发短期 installation token，默认不写入 `sessionStorage`、仓库、环境变量或构建产物。不要把 `.pem` 文件发送给别人或提交到 Git。

所有编辑服务都会把相对路径统一映射到：

```text
0713/2025-blog-public-main/
```

网页 URL 仍然保持 `/profile/...`，不会把源码目录暴露在访问路径中。

## GitHub Pages

正式部署使用根目录 `.github/workflows/deploy.yml`。切换到 0713 前，应先在本地检查导出结果，再确认 Pages 设置使用 `GitHub Actions`，并连续验证深层路由、资源路径和内容编辑流程。
