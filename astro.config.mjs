// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: process.env.BLOG_RENDER_MODE === 'ssr' ? 'server' : 'static',
  adapter: process.env.BLOG_RENDER_MODE === 'ssr' ? node({ mode: 'standalone' }) : undefined,
  // GitHub Pages deployment configuration
  // Replace 'https://<user>.github.io' with your site's URL
  // Replace '/<project-name>' with your project's repository name if not at root
  site: 'https://v3g3t4ble.space',
  base: '/',
  build: {
    format: 'file'
  }
});
