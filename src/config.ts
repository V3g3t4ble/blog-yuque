export const SiteConfig = {
  // Metadata
  title: import.meta.env.TITLE || "V3g3t4ble's Blog",
  description: import.meta.env.DESCRIPTION || 'A blog about cybersecurity research and development',
  
  // Security
  password: import.meta.env.BLOG_PASSWORD,

  theme: import.meta.env.BLOG_THEME || 'terminal',

  typora: {
    about: {
      avatar: import.meta.env.TYPORA_ABOUT_AVATAR,
      name: import.meta.env.TYPORA_ABOUT_NAME,
      bio: import.meta.env.TYPORA_ABOUT_BIO,
      website: import.meta.env.TYPORA_ABOUT_WEBSITE,
      github: import.meta.env.TYPORA_ABOUT_GITHUB,
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
