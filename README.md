# 一叶梓喵的小站

基于 [Astro](https://astro.build/) 与 [Firefly](https://github.com/CuteLeaf/Firefly) 的静态中文技术博客，内容由 Markdown 管理并自动部署到 `yyzmiao.top`。

## 本地开发

```bash
corepack pnpm install
corepack pnpm dev
```

## 写一篇文章

按公开 URL 在 `src/content/posts/YYYY/MM/DD/` 新建 Markdown 文件，例如 `src/content/posts/2026/09/17/article-slug.md`：

```yaml
---
title: "文章标题"
description: "文章摘要"
published: 2026-09-17T12:00:00+08:00
updated: 2026-09-17T12:00:00+08:00
tags: ["标签"]
category: "分类"
draft: false
---
```

文章会发布到 `/2026/09/17/article-slug/`。推送到 `main` 后，GitHub Actions 将完成检查、构建、Pagefind 索引和原子部署。

## 常用命令

- `pnpm check`：检查 Astro 内容和组件
- `pnpm type-check`：执行 TypeScript 类型检查
- `pnpm build`：构建完整静态站和搜索索引
- `pnpm preview`：预览生产构建

## 部署 Secrets

- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_KNOWN_HOSTS`

站点主题保留 Firefly 原项目许可证，服务器凭证不进入仓库。
