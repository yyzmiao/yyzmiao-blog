import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yyzmiao.top',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/404') })],
  markdown: {
    shikiConfig: { theme: 'github-dark-default', wrap: true },
    headingIds: true,
    syntaxHighlight: 'shiki'
  }
});
