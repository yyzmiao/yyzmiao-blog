# 快速维护卡片

## 新文章位置

```text
src/content/posts/YYYY/MM/DD/article-slug.md
```

## 正文图片位置

```text
public/uploads/YYYY/MM/image.webp
```

```md
![说明](/uploads/YYYY/MM/image.webp)
```

## 分类与标签

```yaml
category: "技术"
subcategory: "网络与安全"
tags: ["DNS", "Clash"]
```

## 发布状态

```yaml
draft: false
```

## 自动部署

提交到 `main` → GitHub Actions → 构建与搜索索引 → 上传服务器 → 原子切换。

## 主要配置文件

```text
src/config/siteConfig.ts             站点标题、主题和功能
src/config/profileConfig.ts          头像、作者和社交链接
src/config/backgroundWallpaper.ts    首页背景与横幅文案
src/config/navBarConfig.ts           顶部导航
src/config/commentConfig.ts          Giscus 评论
src/config/FooterConfig.html         自定义页脚
```
