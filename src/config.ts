export const SiteConfig = {
  // Metadata
  title: import.meta.env.TITLE || "V3g3t4ble's Blog",
  description: import.meta.env.DESCRIPTION || 'A blog about cybersecurity research and development',
  
  // Security
  password: import.meta.env.BLOG_PASSWORD,

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
  giscus: {
    enabled: import.meta.env.GISCUS_ENABLED === 'true',
    repo: import.meta.env.GISCUS_REPO,
    repoId: import.meta.env.GISCUS_REPO_ID,
    category: import.meta.env.GISCUS_CATEGORY || 'Announcements',
    categoryId: import.meta.env.GISCUS_CATEGORY_ID,
    mapping: import.meta.env.GISCUS_MAPPING || 'pathname',
    strict: import.meta.env.GISCUS_STRICT || '0',
    reactionsEnabled: import.meta.env.GISCUS_REACTIONS_ENABLED || '1',
    emitMetadata: import.meta.env.GISCUS_EMIT_METADATA || '0',
    inputPosition: import.meta.env.GISCUS_INPUT_POSITION || 'top',
    theme: import.meta.env.GISCUS_THEME || 'preferred_color_scheme',
    lang: import.meta.env.GISCUS_LANG || 'zh-CN',
  },
};
