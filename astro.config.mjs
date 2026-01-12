// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  // GitHub Pages deployment configuration
  // Replace 'https://<user>.github.io' with your site's URL
  // Replace '/<project-name>' with your project's repository name if not at root
  site: 'https://v3g3t4ble.space',
  base: '/',
  build: {
    format: 'file'
  }
});
