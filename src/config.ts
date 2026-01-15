export const SiteConfig = {
  // Metadata
  title: import.meta.env.TITLE || "V3g3t4ble's Blog",
  description: import.meta.env.DESCRIPTION || 'A blog about cybersecurity research and development',
  
  // Security
  password: import.meta.env.BLOG_PASSWORD,

  theme: import.meta.env.BLOG_THEME || 'terminal',

  typora: {
    wechat: {
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
