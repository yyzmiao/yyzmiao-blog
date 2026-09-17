import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://yyzmiao.top/",
    title: "一叶梓喵的小站",
    description: "记录网络、系统与折腾过程中的技术笔记。",
    author: "一叶梓喵",
    profile: "https://github.com/yyzmiao",
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 8,
    perIndex: 6,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/yyzmiao/yyzmiao-blog/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    {
      name: "github",
      url: "https://github.com/yyzmiao",
      linkTitle: "一叶梓喵的 GitHub",
    },
  ],
  shareLinks: [],
});
