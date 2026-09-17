# 一叶梓喵的小站

基于 [AstroPaper 6](https://github.com/satnaing/astro-paper) 的静态中文技术博客，内容由 Markdown 管理并自动部署到 `yyzmiao.top`。

## 本地开发

```bash
npm install
npm run dev
```

## 写一篇文章

按公开 URL 在 `src/content/posts/YYYY/MM/DD/` 新建 Markdown 文件，例如 `src/content/posts/2026/09/17/article-slug.md`：

```yaml
---
title: "文章标题"
description: "文章摘要"
pubDatetime: 2026-09-17T12:00:00+08:00
modDatetime: 2026-09-17T12:00:00+08:00
tags: ["标签"]
draft: false
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

## 主题

展示层使用 AstroPaper 6.1.0，并保留其 MIT 许可证于 `LICENSE-AstroPaper`。站点只在主题提供的配置入口、中文文案、旧 URL 兼容与 Giscus 评论位置上做适配。
