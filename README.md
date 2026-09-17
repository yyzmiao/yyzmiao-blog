# 一叶梓喵的小站

基于 Astro 的静态中文技术博客，内容由 Markdown 管理并自动部署到 `yyzmiao.top`。

## 本地开发

```bash
npm install
npm run dev
```

## 写一篇文章

在 `src/content/posts/` 新建 Markdown 文件，使用以下 frontmatter：

```yaml
---
title: "文章标题"
description: "文章摘要"
publishedAt: "2026-09-17T12:00:00+08:00"
updatedAt: "2026-09-17T12:00:00+08:00"
slug: "article-slug"
tags: ["标签"]
draft: false
seoTitle: "文章标题"
seoDescription: "文章摘要"
---
```

推送到 `main` 分支后，GitHub Actions 会执行检查、构建、生成 Pagefind 搜索索引，并原子部署到服务器。

## 必需的 Actions Secrets

- `DEPLOY_HOST`：服务器地址
- `DEPLOY_PORT`：SSH 端口
- `DEPLOY_USER`：受限部署用户
- `DEPLOY_SSH_KEY`：部署私钥
- `DEPLOY_KNOWN_HOSTS`：服务器 SSH host key

## 常用命令

- `npm run check`：类型与内容校验
- `npm run build`：生成完整静态站和搜索索引
- `npm run migrate:wordpress`：重新从旧 WordPress API 导入文章
