import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config/site';
import { postUrl } from '../utils/posts';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: postUrl(post)
    })),
    customData: '<language>zh-CN</language>'
  });
}
