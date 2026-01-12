export const SiteConfig = {
  // Used in the top bar and prompt
  username: 'v3g3t4ble',
  hostname: 'blog',
  shell: 'zsh',
  
  // Prompt settings
  prompt: {
    directory: '~/blog',
    branch: 'main',
    branchColor: 'text-red-400', // tailwind class
  },

  // File tree header
  fileTree: {
    rootName: '~/blog',
  },

  // Metadata
  title: 'V3g3t4ble\'s Blog',
  description: 'A terminal-styled blog built with Astro',
  
  // Security
  password: 'admin', // Simple password for access
};
