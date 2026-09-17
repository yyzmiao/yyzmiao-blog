import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export function postUrl(post: Post) {
  const date = post.data.publishedAt;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `/${year}/${month}/${day}/${post.data.slug}/`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai'
  }).format(date);
}

export function readingTime(text: string) {
  const chars = text.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(chars / 500));
}
