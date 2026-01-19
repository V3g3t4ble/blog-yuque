export const SiteConfig = {
  // Metadata
  title: import.meta.env.TITLE || "V3g3t4ble's Blog",
  description: import.meta.env.DESCRIPTION || 'A blog about cybersecurity research and development',
  
  // Security
  password: import.meta.env.BLOG_PASSWORD,

  theme: import.meta.env.BLOG_THEME || 'terminal',

  friendLinks: String(import.meta.env.FRIEND_LINKS || '')
    .split(/[\n,;]+/g)
    .map((s: string) => s.trim())
    .filter(Boolean)
    .map((item: string) => {
      const sep = item.includes('|') ? '|' : item.includes('=') ? '=' : '';
      if (!sep) return null;
      const [labelRaw, hrefRaw] = item.split(sep);
      const label = (labelRaw || '').trim();
      const href = (hrefRaw || '').trim();
      if (!label || !href) return null;
      return { label, href };
    })
    .filter(Boolean) as Array<{ label: string; href: string }>,

  typora: {
    about: {
      avatar: import.meta.env.TYPORA_ABOUT_AVATAR,
      name: import.meta.env.TYPORA_ABOUT_NAME,
      bio: import.meta.env.TYPORA_ABOUT_BIO,
      website: import.meta.env.TYPORA_ABOUT_WEBSITE,
      tags: String(import.meta.env.TYPORA_ABOUT_TAGS || '')
        .split(/[,|]/g)
        .map((t: string) => t.trim())
        .filter(Boolean),
    },
    wechat: {
      enabled: import.meta.env.TYPORA_WECHAT_HINT_ENABLED === 'true',
      name: import.meta.env.TYPORA_WECHAT_NAME,
      qrImage: import.meta.env.TYPORA_WECHAT_QR_IMAGE,
    },
  },

  terminal: {
    username: 'v3g3t4ble',
    hostname: 'blog',
    shell: 'zsh',
    prompt: {
      directory: '~/blog',
      branch: 'main',
      branchColor: 'text-red-400',
    },
    fileTree: {
      rootName: '~/blog',
    },
  },
};
