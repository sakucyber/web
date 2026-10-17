/**
 * 站点级配置：导航、社交链接、站点元信息。
 * 改这里就能改全站导航 / 社交卡片 / SEO 默认值，不用逐页找。
 */

export interface NavItem {
  label: string;
  href: string;
  /** 判断导航高亮的路径前缀，如 /posts */
  match?: string;
  /** 是否只做精确匹配（首页用） */
  exact?: boolean;
  /** 是否在移动端抽屉里显示 */
  mobile?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: 'bilibili' | 'github' | 'mail';
  desc: string;
  /** 是否新窗口打开 */
  external?: boolean;
}

export interface SiteConfig {
  url: string;
  title: string;
  shortTitle: string;
  description: string;
  author: string;
  email: string;
  lang: string;
  locale: string;
  themeColor: { light: string; dark: string };
  defaultTheme: 'light' | 'dark';
  themeStorageKey: string;
  nav: NavItem[];
  socials: SocialLink[];
  keywords: string[];
  copyright: string;
  /** 首页 Hero 文案 */
  hero: {
    badge: string;
    title: string;
    accent: string;
    subtitle: string;
    tags: string[];
  };
}

export const SITE: SiteConfig = {
  url: 'https://buling.qzz.io',
  title: 'buling ✨ 的个人小窝',
  shortTitle: 'buling 的小窝',
  description:
    'buling 的个人小窝 —— 初二学生 / UP主 / 游戏开发者。这里是我的作品集、图片画廊与生活记录。',
  author: 'buling',
  email: 'm2738895415@outlook.com',
  lang: 'zh-CN',
  locale: 'zh_CN',
  themeColor: { light: '#fef6ff', dark: '#0a0a0f' },
  defaultTheme: 'dark',
  themeStorageKey: 'blog-theme',
  keywords: ['buling', '个人博客', '作品集', '游戏开发', 'UP主', 'Minecraft', 'Astro'],
  copyright: '© 2025–2026 buling 的个人小窝 ✨ 保留所有权利',
  nav: [
    { label: '首页', href: '/', exact: true },
    { label: '文章', href: '/posts', match: '/posts' },
    { label: '作品', href: '/works', match: '/works' },
    { label: '项目中心', href: '/project', match: '/project' },
    { label: '画廊', href: '/gallery', match: '/gallery' },
    { label: '关于', href: '/#about' },
  ],
  socials: [
    {
      label: '哔哩哔哩',
      href: 'https://space.bilibili.com/1800030924',
      icon: 'bilibili',
      desc: 'UID: 1800030924',
      external: true,
    },
    {
      label: 'GitHub',
      href: 'https://github.com/sakucyber/',
      icon: 'github',
      desc: 'sakucyber',
      external: true,
    },
    {
      label: '邮箱',
      href: 'mailto:m2738895415@outlook.com',
      icon: 'mail',
      desc: 'm2738895415@outlook.com',
    },
  ],
  hero: {
    badge: '🌸 欢迎来到我的小窝',
    title: '你好！我是',
    accent: 'buling',
    subtitle: '初二学生 · 内容创作者 · 游戏开发者\n一个分享生活、技术与爱好的个人空间',
    tags: ['🎒 初二', '🎬 UP主', '🎮 游戏开发', '💻 编程', '⛏️ Minecraft'],
  },
};

/** 站点所有「一级页面」，用于搜索索引与 sitemap 的静态部分 */
export const STATIC_PAGES = [
  { title: '首页', description: SITE.description, url: '/', type: 'page' as const },
  {
    title: '文章列表',
    description: '按时间浏览全部文章，支持标签与分类筛选。',
    url: '/posts',
    type: 'page' as const,
  },
  {
    title: '作品列表',
    description: '用心制作的每一个项目，点开就能玩。',
    url: '/works',
    type: 'page' as const,
  },
  {
    title: '项目中心',
    description: '小游戏与趣味工具集合。',
    url: '/project',
    type: 'page' as const,
  },
  {
    title: '图片画廊',
    description: '记录美好瞬间，支持分类筛选与灯箱预览。',
    url: '/gallery',
    type: 'page' as const,
  },
  {
    title: '搜索',
    description: '搜索文章、作品与项目描述。',
    url: '/search',
    type: 'page' as const,
  },
  {
    title: '关于我',
    description: '关于 buling：初二学生 / UP主 / 游戏开发者。',
    url: '/#about',
    type: 'page' as const,
  },
];

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href || pathname === '/';
  if (item.href.startsWith('/#')) return false;
  const target = item.href.replace(/\/$/, '');
  return pathname === target || pathname.startsWith(`${target}/`);
}
