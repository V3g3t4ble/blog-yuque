export const SiteConfig = {
  // Metadata
  title: 'V3g3t4ble\'s Blog',
  description: 'A blog about cybersecurity research and development',
  
  // Security
  password: import.meta.env.BLOG_PASSWORD,

  theme: import.meta.env.BLOG_THEME || 'terminal',

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
