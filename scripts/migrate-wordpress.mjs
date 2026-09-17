import fs from 'node:fs/promises';
import path from 'node:path';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const WP_API = 'https://yyzmiao.top/wp-json/wp/v2';
const CONTENT_DIR = path.resolve('src/content/posts');
const UPLOAD_DIR = path.resolve('public/uploads');

const tagsBySlug = {
  'oneplus-13-stealth-root-guide': ['Android', 'Root'],
  'ip-cleanliness-analysis-methods': ['网络', 'IP'],
  dnsleak: ['网络', 'DNS'],
  'whisper-fast-gui': ['AI', '工具'],
  'fix-tun-network-issue': ['网络', 'Clash'],
  '12': ['Lsky Pro', '图床']
};

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*'
});
turndown.use(gfm);
turndown.addRule('removeEmptyLinks', {
  filter: (node) => node.nodeName === 'A' && !node.getAttribute('href'),
  replacement: (content) => content
});
turndown.addRule('wordpressPre', {
  filter: (node) => node.nodeName === 'PRE',
  replacement: (_content, node) => {
    const code = node.textContent.replace(/^\n+|\n+$/g, '');
    const language = node.querySelector?.('code')?.className?.match(/language-([\w-]+)/)?.[1] ?? '';
    return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
  }
});

function decodeEntities(value = '') {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(value = '') {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .replace(/\s*\[…\]\s*$/, '')
    .trim();
}

function yaml(value) {
  return JSON.stringify(value);
}

function withTimezone(value) {
  return /(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}+08:00`;
}

function localUploadPath(remoteUrl) {
  const url = new URL(remoteUrl);
  const marker = '/wp-content/uploads/';
  const index = url.pathname.indexOf(marker);
  if (index === -1) return null;
  return `/uploads/${decodeURIComponent(url.pathname.slice(index + marker.length))}`;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'yyzmiao-astro-migrator/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

async function download(remoteUrl, publicPath) {
  const destination = path.join('public', publicPath.replace(/^\//, '').replaceAll('/', path.sep));
  try {
    await fs.access(destination);
    return;
  } catch {}
  const response = await fetch(remoteUrl, { headers: { 'User-Agent': 'yyzmiao-astro-migrator/1.0' } });
  if (!response.ok) throw new Error(`Failed asset ${response.status}: ${remoteUrl}`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

async function localizeImages(html) {
  const assets = [];
  const rewritten = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const original = tag.match(/data-original=["']([^"']+)["']/i)?.[1];
    const regular = [...tag.matchAll(/\ssrc=["']([^"']+)["']/gi)].map((match) => match[1]).find((src) => !src.startsWith('data:'));
    const source = decodeEntities(original ?? regular ?? '');
    if (!source) return '';
    const publicPath = localUploadPath(source);
    if (!publicPath) return tag;
    assets.push([source, publicPath]);
    const alt = decodeEntities(tag.match(/alt=["']([^"']*)["']/i)?.[1] ?? '文章插图');
    return `<img src="${publicPath}" alt="${alt}" loading="lazy">`;
  });
  await Promise.all(assets.map(([remote, local]) => download(remote, local)));
  return rewritten;
}

await fs.mkdir(CONTENT_DIR, { recursive: true });
await fs.mkdir(UPLOAD_DIR, { recursive: true });

const posts = await fetchJson(`${WP_API}/posts?per_page=100&_fields=id,date,modified,slug,title,excerpt,content`);
for (const post of posts) {
  const slug = decodeURIComponent(post.slug);
  const html = await localizeImages(post.content.rendered);
  let markdown = turndown.turndown(html)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/https:\/\/yyzmiao\.top\/wp-content\/uploads\//g, '/uploads/')
    .trim();
  const title = stripHtml(post.title.rendered);
  const excerpt = stripHtml(post.excerpt.rendered);
  const description = excerpt || markdown.replace(/[`#*_>\[\]()]/g, '').replace(/\s+/g, ' ').slice(0, 150);
  const published = new Date(withTimezone(post.date));
  const year = String(published.getFullYear());
  const month = String(published.getMonth() + 1).padStart(2, '0');
  const day = String(published.getDate()).padStart(2, '0');
  const postDir = path.join(CONTENT_DIR, year, month, day);
  const frontmatter = [
    '---',
    `title: ${yaml(title)}`,
    `description: ${yaml(description)}`,
    `pubDatetime: ${withTimezone(post.date)}`,
    `modDatetime: ${withTimezone(post.modified)}`,
    `tags: ${yaml(tagsBySlug[slug] ?? ['技术笔记'])}`,
    'draft: false',
    '---',
    ''
  ].join('\n');
  await fs.mkdir(postDir, { recursive: true });
  await fs.writeFile(path.join(postDir, `${slug}.md`), `${frontmatter}${markdown}\n`, 'utf8');
  console.log(`Migrated: ${slug}`);
}

const media = await fetchJson(`${WP_API}/media?per_page=100&_fields=source_url`);
for (const item of media) {
  const publicPath = localUploadPath(item.source_url);
  if (publicPath) await download(item.source_url, publicPath);
}
console.log(`Completed: ${posts.length} posts, ${media.length} media records.`);
