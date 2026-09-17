# 一叶梓喵的小站维护手册

本目录是 `yyzmiao.top` 的日常维护说明。博客使用 Astro + Firefly 构建，文章保存在 GitHub 仓库中；推送到 `main` 分支后，GitHub Actions 会自动构建并部署到服务器。

## 1. 常用入口

- 网站：https://yyzmiao.top/
- 仓库：https://github.com/yyzmiao/yyzmiao-blog
- 文章目录：`src/content/posts/`
- 图片目录：`public/uploads/`
- 自动部署：https://github.com/yyzmiao/yyzmiao-blog/actions
- 站点配置：`src/config/siteConfig.ts`
- 导航配置：`src/config/navBarConfig.ts`
- 个人信息：`src/config/profileConfig.ts`
- 首页背景：`src/config/backgroundWallpaper.ts`
- 评论配置：`src/config/commentConfig.ts`
- 页脚内容：`src/config/FooterConfig.html`

## 2. 使用 GitHub 网页发布文章

1. 打开仓库的 `src/content/posts/`。
2. 按文章发布日期依次进入或创建 `年/月/日` 目录。
3. 点击 **Add file → Create new file**。
4. 文件名填写英文或数字 slug，例如 `my-new-post.md`。
5. 复制 `templates/post-template.md` 的内容并修改。
6. 点击 **Commit changes**，提交到 `main` 分支。
7. 打开 Actions 页面查看部署进度；通常约 1–2 分钟上线。

示例文件：

```text
src/content/posts/2026/09/18/my-new-post.md
```

对应公开地址：

```text
https://yyzmiao.top/2026/09/18/my-new-post/
```

文件名建议只使用小写英文字母、数字和连字符，不要使用空格。

## 3. 文章字段说明

```yaml
---
title: "文章标题"
description: "用于首页、搜索和 SEO 的简短摘要"
published: 2026-09-18T12:00:00+08:00
updated: 2026-09-18T12:00:00+08:00
category: "网络"
tags: ["Clash", "DNS", "教程"]
image: "/uploads/2026/09/cover.webp"
draft: false
pinned: false
comment: true
lang: "zh_CN"
---
```

字段含义：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `description` | 建议 | 首页摘要、搜索结果与 SEO 描述 |
| `published` | 是 | 首次发布日期，使用 `+08:00` 时区 |
| `updated` | 否 | 最后更新时间，没有修改可与发布日期相同 |
| `category` | 否 | 单个分类；不填写会显示“未分类” |
| `tags` | 否 | 多个标签组成的数组 |
| `image` | 否 | 文章封面图片路径 |
| `draft` | 否 | `true` 为草稿，不公开；正式发布用 `false` |
| `pinned` | 否 | `true` 将文章置顶 |
| `comment` | 否 | 是否显示 Giscus 评论区 |
| `lang` | 否 | 中文文章使用 `zh_CN` |

## 4. 分类与标签

分类不需要预先创建。给文章增加 `category` 后，Firefly 会自动生成分类入口。

```yaml
category: "Android"
tags: ["Root", "KernelSU", "一加"]
```

推荐分类：

- `网络`
- `Android`
- `AI 工具`
- `开源项目`
- `系统运维`

分类尽量保持稳定；标签可以更具体。一篇文章只能填写一个分类，但可以填写多个标签。

## 5. 上传和使用图片

### GitHub 网页上传

1. 打开 `public/uploads/`。
2. 进入或创建对应年月目录，例如 `public/uploads/2026/09/`。
3. 点击 **Add file → Upload files** 上传图片并提交。
4. 在文章中使用以 `/uploads/` 开头的路径。

正文图片：

```md
![图片说明](/uploads/2026/09/example.webp)
```

文章封面：

```yaml
image: "/uploads/2026/09/cover.webp"
```

建议优先使用 WebP 或 AVIF；普通正文图建议控制在 1 MB 以内。文件名建议使用小写英文、数字和连字符。

## 6. 修改头像和首页背景

### 头像

当前头像文件：

```text
src/assets/images/avatar.avif
```

可以直接替换同名文件。若使用不同文件名，需要同时修改：

```text
src/config/profileConfig.ts
```

### 首页背景

当前桌面与手机背景：

```text
src/assets/images/DesktopWallpaper/d3.avif
src/assets/images/MobileWallpaper/m3.avif
```

可直接替换同名文件，或者在 `src/config/backgroundWallpaper.ts` 中修改 `desktop`、`mobile` 路径。

### 站点名称和简介

- 站点标题、描述、主题色：`src/config/siteConfig.ts`
- 作者名称、个人简介、社交链接：`src/config/profileConfig.ts`
- 首页横幅标题和副标题：`src/config/backgroundWallpaper.ts`

## 7. 修改页脚

自定义页脚内容位于：

```text
src/config/FooterConfig.html
```

当前萌 ICP 链接也在这个文件中。可继续添加公安备案、版权说明等 HTML 内容，不需要修改主题组件。

## 8. 本地维护方式

需要批量编辑或上线前预览时，可在本地运行：

```bash
git clone https://github.com/yyzmiao/yyzmiao-blog.git
cd yyzmiao-blog
corepack pnpm install
corepack pnpm dev
```

生产构建检查：

```bash
corepack pnpm check
corepack pnpm type-check
corepack pnpm build
corepack pnpm preview
```

提交发布：

```bash
git add -A
git commit -m "feat: add new post"
git push origin main
```

## 9. 自动部署流程

每次推送 `main` 后，GitHub Actions 会依次执行：

1. 安装 pnpm 依赖。
2. 检查 Astro 内容与 TypeScript 类型。
3. 构建静态页面、RSS、Sitemap 和 Pagefind 搜索索引。
4. 将 `dist/` 上传到服务器的新版本目录。
5. 检查关键文件是否存在。
6. 使用软链接原子切换新版本。
7. 请求线上首页完成健康检查。

服务器不运行 Astro 或 Node 服务。静态文件位于 `/var/www/yyzmiao-blog/current`，由 Docker 中的 Nginx 只读挂载并提供访问。

## 10. 部署失败排查

先打开仓库的 **Actions** 页面，进入最近一次 `Build and deploy`：

- `Install dependencies` 失败：通常是依赖锁文件问题。
- `Build and index site` 失败：重点检查文章 YAML 格式、日期、引号和 Markdown。
- `Upload release` 失败：检查服务器或 SSH 部署密钥。
- `Activate release` 失败：构建产物缺少关键文件，旧版本不会被切换。
- `Verify production` 失败：检查域名、Cloudflare、Nginx 和服务器网络。

常见文章错误：

- YAML 开头和结尾必须是单独一行 `---`。
- 标题或摘要中含有冒号时应使用引号。
- 日期必须是有效时间格式。
- `tags` 必须写成数组，例如 `["网络", "教程"]`。
- 图片路径大小写必须与实际文件一致。

## 11. 删除或撤回文章

- 临时撤回：将 `draft` 改为 `true` 后提交。
- 永久删除：删除对应 Markdown 文件后提交。
- 修改 URL：移动文件或修改文件名会改变公开 URL，不建议对已发布文章这样操作。

如果误提交，可在 GitHub 找到上一个正常提交并执行 Revert，或在本地创建一个恢复提交。不要使用强制推送覆盖 `main` 历史。

## 12. 日常检查清单

发布后至少检查：

- 首页能否打开。
- 新文章 URL 是否返回 200。
- 标题、摘要、分类、标签和图片是否正确。
- 手机端是否存在横向溢出。
- 搜索能否找到新文章。
- 评论区是否显示。
- Actions 是否为绿色成功状态。

